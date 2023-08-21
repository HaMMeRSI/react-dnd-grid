import usePan from '@/Hooks/usePan';
import usePrevious from '@/Hooks/usePrevious';
import useScale from '@/Hooks/useScale';
import { ORIGIN, pointUtils, parseN } from '@/Utils';
import { Rect } from '@/types';
import styled from '@emotion/styled';
import { useRef, useState, useCallback, MouseEvent } from 'react';
import DndComp from './DndComp';
import MaskedArea from './MaskedArea';

interface IRealPixestate {
    offsetX: number;
    offsetY: number;
    scale: number;
    lineWidth: number;
    dimensons: number;
    cellSize: number;
    cursor?: string;
}

const RealPixestate = styled.div<IRealPixestate>`
    position: relative;
    transform: ${({ offsetX, offsetY, scale }) => `translate(${-offsetX}px, ${-offsetY}px) scale(${scale})`};
    transform-origin: 0 0;
    width: ${({ dimensons, cellSize }) => cellSize * dimensons}px;
    height: ${({ dimensons, cellSize }) => cellSize * dimensons}px;
    cursor: ${props => props.cursor ?? 'default'};
    background-size: ${({ cellSize }) => `${cellSize}px ${cellSize}px`};
    background-image: ${({ lineWidth: width }) => `
        linear-gradient(to right, grey ${width}px, transparent ${width}px),
        linear-gradient(to bottom, grey ${width}px, transparent ${width}px)`};
`;

const Canvas = styled.canvas`
    position: absolute;
    top: 0;
    left: 0;
`;

interface IProps {
    lineWidth?: number;
    dimensions?: number;
    cellSize?: number;
    className?: string;
    scaleOptions?: {
        min?: number;
        max?: number;
        speed?: number;
    };
    maskOptions?: {
        radius?: number;
        lineWidth?: number;
        lineColor?: string;
    };
}

export default function ({ lineWidth = 0.1, dimensions = 100, cellSize = 5, className, scaleOptions, maskOptions }: IProps) {
    const realSize = cellSize * dimensions;

    const realPixestateRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const adjustedOffset = useRef(ORIGIN());

    const [relativeMousePos, setRelativeMousePos] = useState(ORIGIN());
    const [mousePosDown, setMousePosDown] = useState(ORIGIN());

    const [isMaskStretching, setIsMaskStretching] = useState(false);
    const [isMaskDragging, setIsMaskDragging] = useState(false);

    const [mask, setMaskPos] = useState<Rect | null>(null);
    const [cursor, setCursor] = useState('default');

    const [startPan, offset, isPanning] = usePan(realPixestateRef);
    const scale = useScale(realPixestateRef, scaleOptions);

    const lastOffset = usePrevious(offset) ?? offset;
    const lastScale = usePrevious(scale) ?? scale;

    if (lastScale === scale) {
        const delta = pointUtils.diff(offset, lastOffset);
        adjustedOffset.current = pointUtils.sum(adjustedOffset.current, delta);
    } else {
        const lastMouse = pointUtils.scale(relativeMousePos, lastScale);
        const newMouse = pointUtils.scale(relativeMousePos, scale);
        const mouseOffset = pointUtils.diff(lastMouse, newMouse);
        adjustedOffset.current = pointUtils.diff(adjustedOffset.current, mouseOffset);
    }

    const onMouseDown = useCallback((e: MouseEvent) => {
        startPan(e);
        setMousePosDown({ x: e.pageX, y: e.pageY });
    }, []);

    const onMouseMove = useCallback(
        (e: MouseEvent) => {
            setRelativeMousePos({
                x: (e.pageX + adjustedOffset.current.x) / scale,
                y: (e.pageY + adjustedOffset.current.y) / scale,
            });

            if (mask) {
                e.stopPropagation();

                if (isMaskDragging) {
                    setCursor('grabbing');

                    const mouseCellPosX = parseN(relativeMousePos.x, cellSize);
                    const mouseCellPosY = parseN(relativeMousePos.y, cellSize);

                    const xMaxed = Math.min(realSize - mask.width, mouseCellPosX);
                    const yMaxed = Math.min(realSize - mask.height, mouseCellPosY);

                    const xBounded = Math.max(0, xMaxed);
                    const yBounded = Math.max(0, yMaxed);

                    setMaskPos({
                        top: yBounded,
                        left: xBounded,
                        width: mask.width,
                        height: mask.height,
                    });
                } else if (isMaskStretching) {
                    setCursor('nwse-resize');

                    const mouseCellPosX = parseN(relativeMousePos.x, cellSize);
                    const mouseCellPosY = parseN(relativeMousePos.y, cellSize);

                    const widthMined = Math.max(cellSize, mouseCellPosX - mask.left + cellSize);
                    const heightMined = Math.max(cellSize, mouseCellPosY - mask.top + cellSize);

                    const widthBounded = Math.min(widthMined, realSize - mask.left);
                    const heightBounded = Math.min(heightMined, realSize - mask.top);

                    setMaskPos({
                        top: mask.top,
                        left: mask.left,
                        width: widthBounded,
                        height: heightBounded,
                    });
                } else if (isPanning) {
                    setMaskPos(null);
                }
            }
        },
        [scale, mask, cellSize, realSize, relativeMousePos, isMaskDragging, isMaskStretching, isPanning]
    );

    const onMouseUp = useCallback(
        (e: MouseEvent) => {
            e.stopPropagation();
            const upPoint = { x: e.pageX, y: e.pageY };

            if (pointUtils.eq(upPoint, mousePosDown) && !mask) {
                setMaskPos({
                    top: parseN(relativeMousePos.y, cellSize),
                    left: parseN(relativeMousePos.x, cellSize),
                    width: cellSize,
                    height: cellSize,
                });
            } else if (!isMaskDragging && !isMaskStretching) {
                setMaskPos(null);
            }

            setCursor('default');
        },
        [mask, cellSize, relativeMousePos, mousePosDown, isMaskDragging, isMaskStretching]
    );

    return (
        <RealPixestate
            ref={realPixestateRef}
            className={className}
            cursor={cursor}
            offsetX={adjustedOffset.current.x}
            offsetY={adjustedOffset.current.y}
            scale={scale}
            lineWidth={lineWidth}
            dimensons={dimensions}
            cellSize={cellSize}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}>
            <Canvas ref={canvasRef} width={cellSize * dimensions} height={cellSize * dimensions} />
            <DndComp onDrag={setIsMaskDragging} onStretch={setIsMaskStretching} mask={mask} scale={scale} />
            <MaskedArea
                mask={mask}
                adjust={lineWidth}
                dimensions={dimensions}
                cellSize={cellSize}
                color={maskOptions?.lineColor}
                width={maskOptions?.lineWidth}
                radius={maskOptions?.radius}
            />
        </RealPixestate>
    );
}
