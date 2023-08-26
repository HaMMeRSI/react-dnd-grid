import { ORIGIN, pointUtils, parseN } from '@/Utils';
import styled from '@emotion/styled';
import { useRef, useState, useCallback, MouseEvent } from 'react';
import DndComp from './SelectionComponent';
import MaskedArea from './MaskedArea';
import usePan from '$/Hooks/usePan';
import usePrevious from '$/Hooks/usePrevious';
import useScale from '$/Hooks/useScale';
import { useGridContext } from '$/main';

interface IGridState {
    offsetX: number;
    offsetY: number;
    scale: number;
    dimensons: number;
    cellSize: number;
    cursor?: string;
}

const GridContainer = styled.div<IGridState>`
    position: relative;
    transform: ${({ offsetX, offsetY, scale }) => `translate(${-offsetX}px, ${-offsetY}px) scale(${scale})`};
    transform-origin: 0 0;
    width: ${({ dimensons, cellSize }) => cellSize * dimensons}px;
    height: ${({ dimensons, cellSize }) => cellSize * dimensons}px;
    cursor: ${props => props.cursor ?? 'default'};
`;

const Grid = styled.div<{ cellSize: number; lineWidth: number }>`
    position: absolute;
    inset: 0;
    background-color: transparent;
    background-size: ${({ cellSize }) => `${cellSize}px ${cellSize}px`};
    background-image: ${({ lineWidth: width }) => `
        linear-gradient(to right, grey ${width}px, transparent ${width}px),
        linear-gradient(to bottom, grey ${width}px, transparent ${width}px)`};
    user-select: none;
    pointer-events: none;
`;

export interface IGridProps {
    className?: string;
    children?: React.ReactNode;
    selectOptions?: {
        enable?: boolean;
        component?: React.ReactNode;
        scaleIcon?: React.ReactNode;
        stretchIcon?: React.ReactNode;
        maskOptions?: {
            radius?: number;
            lineWidth?: number;
            lineColor?: string;
            opacity?: number;
        };
    };
    scaleOptions?: {
        min?: number;
        max?: number;
        speed?: number;
    };
    gridOptions?: {
        enable?: boolean;
        lineWidth?: number;
        dimensions?: number;
        cellSize?: number;
    };
}

export default function ({ gridOptions, className, scaleOptions, selectOptions, children }: IGridProps) {
    const { cellSize = 5, dimensions = 100, lineWidth = 0.1, enable: enableGrid = false } = gridOptions ?? {};
    const { enable: enableSelect = false } = selectOptions ?? {};
    const realSize = cellSize * dimensions;

    const realPixestateRef = useRef<HTMLDivElement>(null);
    const adjustedOffset = useRef(ORIGIN());
    const endPan = useRef<VoidFunction>(() => {});

    const [relativeMousePos, setRelativeMousePos] = useState(ORIGIN());
    const [mousePosDown, setMousePosDown] = useState(ORIGIN());

    const [isMaskStretching, setIsMaskStretching] = useState(false);
    const [isMaskDragging, setIsMaskDragging] = useState(false);

    const [cursor, setCursor] = useState('default');

    const [startPan, offset, isPanning] = usePan(realPixestateRef);
    const scale = useScale(realPixestateRef, scaleOptions);

    const lastOffset = usePrevious(offset) ?? offset;
    const lastScale = usePrevious(scale) ?? scale;

    const { mask, setMask } = useGridContext();

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
        endPan.current = startPan(e);
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

                    setMask({
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

                    setMask({
                        top: mask.top,
                        left: mask.left,
                        width: widthBounded,
                        height: heightBounded,
                    });
                }
            }
        },
        [scale, mask, cellSize, realSize, relativeMousePos, isMaskDragging, isMaskStretching, isPanning]
    );

    const onMouseUp = useCallback(
        (e: MouseEvent) => {
            e.stopPropagation();
            const upPoint = { x: e.pageX, y: e.pageY };
            setIsMaskStretching(false);
            setIsMaskDragging(false);

            if (pointUtils.eq(upPoint, mousePosDown) && !mask) {
                setMask({
                    top: parseN(relativeMousePos.y, cellSize),
                    left: parseN(relativeMousePos.x, cellSize),
                    width: cellSize,
                    height: cellSize,
                });
            } else if (!isMaskDragging && !isMaskStretching && !isPanning) {
                setMask(null);
            }

            endPan.current();
            setCursor('default');
        },
        [mask, cellSize, relativeMousePos, mousePosDown, isMaskDragging, isMaskStretching]
    );

    return (
        <GridContainer
            ref={realPixestateRef}
            className={className}
            cursor={cursor}
            offsetX={adjustedOffset.current.x}
            offsetY={adjustedOffset.current.y}
            scale={scale}
            dimensons={dimensions}
            cellSize={cellSize}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}>
            {children}
            <DndComp
                onDrag={setIsMaskDragging}
                onStretch={setIsMaskStretching}
                mask={enableSelect ? mask : null}
                scale={scale}
                component={selectOptions?.component}
                scaleIcon={selectOptions?.scaleIcon}
                stretchIcon={selectOptions?.stretchIcon}
            />
            {enableGrid && <Grid cellSize={cellSize} lineWidth={lineWidth} />}
            <MaskedArea
                mask={enableSelect ? mask : null}
                adjust={lineWidth}
                dimensions={dimensions}
                cellSize={cellSize}
                opacity={selectOptions?.maskOptions?.opacity}
                color={selectOptions?.maskOptions?.lineColor}
                width={selectOptions?.maskOptions?.lineWidth}
                radius={selectOptions?.maskOptions?.radius}
            />
        </GridContainer>
    );
}
