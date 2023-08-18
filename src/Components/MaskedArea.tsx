import { Section } from '../types';
import styled from '@emotion/styled';

type Props = { mask: Section };

const Svg = styled.svg`
    position: absolute;
    width: 1000px;
    height: 1000px;
    pointer-events: none;
    top: 0;
    left: 0;
`;

export default function MaskedArea({ mask }: Props) {
    const bw = 2;
    return (
        <Svg viewBox="0 0 1000 1000">
            <defs>
                <mask id="myMask">
                    {/* Everything under a white pixel will be visible */}
                    <rect x="0" y="0" width="1000" height="1000" fill="white" />

                    {/* Everything under a black pixel will be invisible */}
                    <rect x={mask.left} y={mask.top} width={mask.width} height={mask.height} fill="black" />
                </mask>
            </defs>
            <rect
                x={0}
                y={0}
                width={1000}
                height={1000}
                mask="url(#myMask)"
                style={{ fill: 'hsl(231deg 38% 19% / 60%)', filter: 'blur(5px)' }}
            />
            <rect x={mask.left} y={mask.top} width={mask.width} height={mask.height} mask="url(#myMask)" fill="white" />
            <rect
                x={mask.left - bw / 2}
                y={mask.top - bw / 2}
                width={mask.width + bw}
                height={mask.height + bw}
                mask="url(#myMask)"
                fill="rgb(10 2 255 / 54%)"
                rx="1"
            />
        </Svg>
    );
}
