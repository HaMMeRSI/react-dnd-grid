import { clamp } from '$/Utils';
import { Rect } from '$/types';
import { CSSProperties } from 'react';

const svgStyle = (realSize: number): CSSProperties => ({
    position: 'absolute',
    width: realSize + 'px',
    height: realSize + 'px',
    pointerEvents: 'none',
    top: '0',
    left: '0',
});

interface IProps {
    selection: Rect | null;
    adjust: number;
    dimensions: number;
    cellSize: number;
    width?: number;
    color?: string;
    radius?: number;
    opacity?: number;
}

export default function MaskedArea({
    selection,
    adjust,
    dimensions,
    cellSize,
    width = 2,
    color = 'rgb(10 2 255 / 54%)',
    radius = 0,
    opacity = 0.7,
}: IProps) {
    if (!selection) return null;

    const realSize = dimensions * cellSize;

    return (
        <svg viewBox={`0 0 ${realSize} ${realSize}`} style={svgStyle(realSize)}>
            <defs>
                <mask id="myMask">
                    {/* Everything under a white pixel will be visible */}
                    <rect x="0" y="0" width={realSize} height={realSize} fill="white" />

                    {/* Everything under a black pixel will be invisible */}
                    <rect
                        x={selection.left}
                        y={selection.top}
                        width={selection.width + adjust}
                        height={selection.height + adjust}
                        fill="black"
                    />
                </mask>
            </defs>
            <rect
                x={0}
                y={0}
                width={realSize}
                height={realSize}
                mask="url(#myMask)"
                style={{ fill: `rgb(0 0 0 / ${clamp(0, 1, opacity) * 100}%)` }}
            />
            <rect x={selection.left} y={selection.top} width={selection.width} height={selection.height} mask="url(#myMask)" fill="white" />
            <rect
                x={selection.left - width / 2}
                y={selection.top - width / 2}
                width={selection.width + width + adjust}
                height={selection.height + width + adjust}
                mask="url(#myMask)"
                fill={color}
                rx={radius}
            />
        </svg>
    );
}
