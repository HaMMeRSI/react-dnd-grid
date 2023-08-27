import { useRef, useState, useCallback, MouseEvent, CSSProperties } from 'react';
import DndComp from './SelectionComponent';
import MaskedArea from './SelectionArea';
import usePan from '$/Hooks/usePan';
import usePrevious from '$/Hooks/usePrevious';
import useScale from '$/Hooks/useScale';
import {  useBoxContext } from '$/main';
import { ORIGIN, pointUtils, parseN } from '$/Utils';

interface IBoxState {
    offsetX: number;
    offsetY: number;
    scale: number;
    dimensions: number;
    cellSize: number;
    cursor?: string;
    extra?: CSSProperties;
}

const boxStyle = ({ offsetX, offsetY, scale, dimensions, cellSize, cursor, extra }: IBoxState): CSSProperties => ({
    position: 'relative',
    transform: `translate(${-offsetX}px, ${-offsetY}px) scale(${scale})`,
    transformOrigin: '0 0',
    width: `${cellSize * dimensions}px`,
    height: `${cellSize * dimensions}px`,
    cursor: cursor ?? 'default',
    ...extra,
});

const gridStyle = (cellSize: number, lineWidth: number): CSSProperties => ({
    position: 'absolute',
    inset: '0',
    backgroundColor: 'transparent',
    backgroundSize: `${cellSize}px ${cellSize}px`,
    backgroundImage: `linear-gradient(to right, grey ${lineWidth}px, transparent ${lineWidth}px), linear-gradient(to bottom, grey ${lineWidth}px, transparent ${lineWidth}px)`,
    userSelect: 'none',
    pointerEvents: 'none',
});

export interface IBoxProps {
    className?: string;
    style?: CSSProperties;
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

export default function ({ gridOptions, className, style, scaleOptions, selectOptions, children }: IBoxProps) {
    const { cellSize = 5, dimensions = 100, lineWidth = 0.1, enable: enableGrid = false } = gridOptions ?? {};
    const { enable: enableSelect = false } = selectOptions ?? {};
    const realSize = cellSize * dimensions;

    const boxRef = useRef<HTMLDivElement>(null);
    const adjustedOffset = useRef(ORIGIN());
    const endPan = useRef<VoidFunction>(() => {});

    const [relativeMousePos, setRelativeMousePos] = useState(ORIGIN());
    const [mousePosDown, setMousePosDown] = useState(ORIGIN());

    const [isSelectionStretching, setIsSelectionStretching] = useState(false);
    const [isSelectionDragging, setIsSelectionDragging] = useState(false);

    const [cursor, setCursor] = useState('default');

    const [startPan, offset, isPanning] = usePan(boxRef);
    const scale = useScale(boxRef, scaleOptions);

    const lastOffset = usePrevious(offset) ?? offset;
    const lastScale = usePrevious(scale) ?? scale;

    const { selection, setSelection } = useBoxContext();

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

            if (selection) {
                e.stopPropagation();

                if (isSelectionDragging) {
                    setCursor('grabbing');

                    const mouseCellPosX = parseN(relativeMousePos.x, cellSize);
                    const mouseCellPosY = parseN(relativeMousePos.y, cellSize);

                    const xMaxed = Math.min(realSize - selection.width, mouseCellPosX);
                    const yMaxed = Math.min(realSize - selection.height, mouseCellPosY);

                    const xBounded = Math.max(0, xMaxed);
                    const yBounded = Math.max(0, yMaxed);

                    setSelection({
                        top: yBounded,
                        left: xBounded,
                        width: selection.width,
                        height: selection.height,
                    });
                } else if (isSelectionStretching) {
                    setCursor('nwse-resize');

                    const mouseCellPosX = parseN(relativeMousePos.x, cellSize);
                    const mouseCellPosY = parseN(relativeMousePos.y, cellSize);

                    const widthMined = Math.max(cellSize, mouseCellPosX - selection.left + cellSize);
                    const heightMined = Math.max(cellSize, mouseCellPosY - selection.top + cellSize);

                    const widthBounded = Math.min(widthMined, realSize - selection.left);
                    const heightBounded = Math.min(heightMined, realSize - selection.top);

                    setSelection({
                        top: selection.top,
                        left: selection.left,
                        width: widthBounded,
                        height: heightBounded,
                    });
                }
            }
        },
        [scale, selection, cellSize, realSize, relativeMousePos, isSelectionDragging, isSelectionStretching, isPanning]
    );

    const onMouseUp = useCallback(
        (e: MouseEvent) => {
            e.stopPropagation();
            const upPoint = { x: e.pageX, y: e.pageY };
            setIsSelectionStretching(false);
            setIsSelectionDragging(false);

            if (pointUtils.eq(upPoint, mousePosDown) && !selection) {
                setSelection({
                    top: parseN(relativeMousePos.y, cellSize),
                    left: parseN(relativeMousePos.x, cellSize),
                    width: cellSize,
                    height: cellSize,
                });
            } else if (!isSelectionDragging && !isSelectionStretching && !isPanning) {
                setSelection(null);
            }

            endPan.current();
            setCursor('default');
        },
        [selection, cellSize, relativeMousePos, mousePosDown, isSelectionDragging, isSelectionStretching]
    );

    return (
        <div
            ref={boxRef}
            className={className}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            style={boxStyle({
                offsetX: adjustedOffset.current.x,
                offsetY: adjustedOffset.current.y,
                scale,
                dimensions,
                cellSize,
                cursor,
                extra: style,
            })}>
            {children}
            <DndComp
                onDrag={setIsSelectionDragging}
                onStretch={setIsSelectionStretching}
                selection={enableSelect ? selection : null}
                scale={scale}
                component={selectOptions?.component}
                scaleIcon={selectOptions?.scaleIcon}
                stretchIcon={selectOptions?.stretchIcon}
            />
            {enableGrid && <div style={gridStyle(cellSize, lineWidth)} />}
            <MaskedArea
                selection={enableSelect ? selection : null}
                adjust={lineWidth}
                dimensions={dimensions}
                cellSize={cellSize}
                opacity={selectOptions?.maskOptions?.opacity}
                color={selectOptions?.maskOptions?.lineColor}
                width={selectOptions?.maskOptions?.lineWidth}
                radius={selectOptions?.maskOptions?.radius}
            />
        </div>
    );
}
