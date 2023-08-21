import { Rect } from '@/types';
import styled from '@emotion/styled';

const Svg = styled.svg<{ realSize: number }>`
    position: absolute;
    width: ${props => props.realSize}px;
    height: ${props => props.realSize}px;
    pointer-events: none;
    top: 0;
    left: 0;
`;

interface IProps {
    mask: Rect | null;
    adjust: number;
    dimensions: number;
    cellSize: number;
    width?: number;
    color?: string;
    radius?: number;
}

export default function MaskedArea({ mask, adjust, dimensions, cellSize, width = 2, color = 'rgb(10 2 255 / 54%)', radius = 0 }: IProps) {
    if (!mask) return null;

    const realSize = dimensions * cellSize;
    return (
        <Svg viewBox={`0 0 ${realSize} ${realSize}`} realSize={realSize}>
            <defs>
                <mask id="myMask">
                    {/* Everything under a white pixel will be visible */}
                    <rect x="0" y="0" width={realSize} height={realSize} fill="white" />

                    {/* Everything under a black pixel will be invisible */}
                    <rect x={mask.left} y={mask.top} width={mask.width + adjust} height={mask.height + adjust} fill="black" />
                </mask>
            </defs>
            <rect
                x={0}
                y={0}
                width={realSize}
                height={realSize}
                mask="url(#myMask)"
                style={{ fill: 'hsl(231deg 38% 19% / 60%)', filter: 'blur(5px)' }}
            />
            <rect x={mask.left} y={mask.top} width={mask.width} height={mask.height} mask="url(#myMask)" fill="white" />
            <rect
                x={mask.left - width / 2}
                y={mask.top - width / 2}
                width={mask.width + width + adjust}
                height={mask.height + width + adjust}
                mask="url(#myMask)"
                fill={color}
                rx={radius}
            />
        </Svg>
    );
}
