import { useRef, useState, useCallback, MouseEvent, CSSProperties } from 'react';
import DndComp from './SelectionComponent';
import MaskedArea from './MaskedArea';
import usePan from '$/Hooks/usePan';
import usePrevious from '$/Hooks/usePrevious';
import useScale from '$/Hooks/useScale';
import { useGridContext } from '$/main';
import { ORIGIN, pointUtils, parseN } from '$/Utils';

interface IGridState {
    offsetX: number;
    offsetY: number;
    scale: number;
    dimensions: number;
    cellSize: number;
    cursor?: string;
    extra?: CSSProperties;
}

const containerStyle = ({ offsetX, offsetY, scale, dimensions, cellSize, cursor, extra }: IGridState): CSSProperties => ({
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

export interface IGridProps {
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

export default function ({ gridOptions, className, style, scaleOptions, selectOptions, children }: IGridProps) {
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
        <div
            ref={realPixestateRef}
            className={className}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            style={containerStyle({
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
                onDrag={setIsMaskDragging}
                onStretch={setIsMaskStretching}
                mask={enableSelect ? mask : null}
                scale={scale}
                component={selectOptions?.component}
                scaleIcon={selectOptions?.scaleIcon}
                stretchIcon={selectOptions?.stretchIcon}
            />
            {enableGrid && <div style={gridStyle(cellSize, lineWidth)} />}
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
        </div>
    );
}
