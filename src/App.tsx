import { useRef, useState, MouseEvent } from 'react';
import usePan from './Hooks/usePan';
import useScale from './Hooks/useScale';
import usePrevious from './Hooks/usePrevious';
import MaskedArea from './Components/MaskedArea';
import DndComp from './Components/DndComponent/DndComp';
import { Rect } from './types';
import styled from '@emotion/styled';
import { ORIGIN, parseN, pointUtils } from './Utils';

interface IRealPixestate {
    offsetX: number;
    offsetY: number;
    scale: number;
    lineWidth: number;
    dimensons: number;
    cellSize: number;
}

const Container = styled.div<{ cursor?: string }>`
    position: relative;
    cursor: ${props => props.cursor ?? 'default'};
`;

const RealPixestate = styled.div<IRealPixestate>`
    position: relative;
    transform: ${({ offsetX, offsetY, scale }) => `translate(${-offsetX}px, ${-offsetY}px) scale(${scale})`};
    transform-origin: 0 0;
    width: ${({ dimensons, cellSize }) => cellSize * dimensons}px;
    height: ${({ dimensons, cellSize }) => cellSize * dimensons}px;
    background-color: #eeeeee22;
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

const gridLine = 0.1;
const dimensions = 100;
const cellSize = 5;
const realSize = cellSize * dimensions;
const startScale = 1;

export default function App() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const realPixestateRef = useRef<HTMLDivElement>(null);
    const adjustedOffset = useRef(ORIGIN());

    const [isDndDraging, setIsDndDraging] = useState(false);
    const [isDndScaling, setIsDndScaling] = useState(false);

    const [relativeMousePos, setRelativeMousePos] = useState(ORIGIN());
    const [mousePosDown, setMousePosDown] = useState(ORIGIN());

    const [cursor, setCursor] = useState('default');
    const [mask, setMaskPos] = useState<Rect | null>(null);

    const [startPan, offset] = usePan(realPixestateRef);
    const scale = useScale(realPixestateRef, { start: startScale });

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

    function dndMove(e: MouseEvent) {
        e.stopPropagation();

        if (mask) {
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
        }
    }

    function dndScale(e: MouseEvent) {
        e.stopPropagation();

        if (mask) {
            const mouseCellPosX = parseN(relativeMousePos.x, cellSize);
            const mouseCellPosY = parseN(relativeMousePos.y, cellSize);

            const heightMined = Math.max(cellSize, mouseCellPosY - mask.top + cellSize);
            const widthMined = Math.max(cellSize, mouseCellPosX - mask.left + cellSize);

            const heightBounded = Math.min(heightMined, realSize - mask.top);
            const widthBounded = Math.min(widthMined, realSize - mask.left);

            setMaskPos({
                top: mask.top,
                left: mask.left,
                width: widthBounded,
                height: heightBounded,
            });
        }
    }

    function onMouseDown(e: MouseEvent) {
        startPan(e);
        setMousePosDown({ x: e.pageX, y: e.pageY });
    }

    function onMouseMove(e: MouseEvent) {
        setCursor('default');

        if (isDndDraging) {
            setCursor('grabbing');
            dndMove(e);
        } else if (isDndScaling) {
            setCursor('nwse-resize');
            dndScale(e);
        }

        setRelativeMousePos({
            x: (e.pageX + adjustedOffset.current.x) / scale,
            y: (e.pageY + adjustedOffset.current.y) / scale,
        });
    }

    function onMouseUp(e: MouseEvent) {
        e.stopPropagation();
        const upPoint = { x: e.pageX, y: e.pageY };

        if (pointUtils.eq(upPoint, mousePosDown) && !mask) {
            setMaskPos({
                top: parseN(relativeMousePos.y, cellSize),
                left: parseN(relativeMousePos.x, cellSize),
                width: cellSize,
                height: cellSize,
            });
        } else if (!isDndDraging && !isDndScaling) {
            setMaskPos(null);
        }

        setIsDndDraging(false);
        setIsDndScaling(false);
        setCursor('default');
    }

    return (
        <Container cursor={cursor} ref={containerRef}>
            <RealPixestate
                offsetX={adjustedOffset.current.x}
                offsetY={adjustedOffset.current.y}
                scale={scale}
                ref={realPixestateRef}
                lineWidth={gridLine}
                dimensons={dimensions}
                cellSize={cellSize}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}>
                <Canvas ref={canvasRef} width={cellSize * dimensions} height={cellSize * dimensions} />
                <DndComp
                    parent={realPixestateRef}
                    parentForPotal={containerRef}
                    setDrag={setIsDndDraging}
                    setIsScaling={setIsDndScaling}
                    mask={mask}
                    scale={scale}
                />
                <MaskedArea mask={mask} adjust={gridLine} dimensions={dimensions} cellSize={cellSize} />
                {/* <DescriptionBox scale={scale} tokenId={getAreaId([mask.x, mask.y], [mask.x + mask.w - 1, mask.y + mask.h - 1])} /> */}
            </RealPixestate>
        </Container>
    );
}
