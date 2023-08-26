import { MouseEvent as SyntheticMouseEvent } from 'react';
import MoveSvg from '$/assets/move.svg';
import StretchSvg from '$/assets/stretch.svg';

import { Rect } from '@/types';
import styled from '@emotion/styled';
import { MaskedIcon } from './MaskedIcon';

const Container = styled.div`
    user-select: none;
    position: absolute;
`;

const MoveContainer = styled.div<{ scale: number }>`
    position: absolute;
    top: -5px;
    left: -5px;
    transform-origin: 100% 100%;
    scale: ${({ scale }) => scale};
    z-index: 2;
`;
const StretchContainer = styled.div<{ scale: number }>`
    position: absolute;
    bottom: -5px;
    right: -5px;
    transform-origin: top left;
    scale: ${({ scale }) => scale};
    z-index: 2;
`;
const ComponentContainer = styled.div<{ scale: number }>`
    position: absolute;
    left: 100%;
    top: calc(100% + 1px);
    z-index: 2;
    transform-origin: top right;
    transform: translate(-100%, 0%) scale(${({ scale }) => scale});
`;

const Move = styled(MaskedIcon)`
    background-color: white;
    font-size: 4px;
    width: 5px;
    height: 5px;
    cursor: grab;
    display: block;
`;

const Stretch = styled(MaskedIcon)`
    display: block;
    background-color: white;
    font-size: 4px;
    width: 4px;
    height: 4px;
    cursor: nwse-resize;
`;

type Props = {
    mask: Rect | null;
    scale: number;

    onDrag: (isDrag: boolean) => void;
    onStretch: (isScaling: boolean) => void;

    component?: React.ReactNode;
    scaleIcon?: React.ReactNode;
    stretchIcon?: React.ReactNode;
};

export default function DndComp({ mask, onDrag, onStretch, scale, component, scaleIcon, stretchIcon }: Props) {
    if (!mask) return null;

    const scaled = Math.max(1, (1 / scale) * 4);

    function turnOn(fn: any) {
        return (e: SyntheticMouseEvent) => {
            e.stopPropagation();
            fn(true);
        };
    }

    return (
        <Container style={mask}>
            <MoveContainer scale={scaled} onMouseDown={turnOn(onDrag)}>
                {scaleIcon ?? <Move src={MoveSvg} size="4px" />}
            </MoveContainer>
            <ComponentContainer onMouseDown={e => e.stopPropagation()} onMouseUp={e => e.stopPropagation()} scale={scaled}>
                {component}
            </ComponentContainer>
            <StretchContainer scale={scaled} onMouseDown={turnOn(onStretch)}>
                {stretchIcon ?? <Stretch src={StretchSvg} size="4px" />}
            </StretchContainer>
        </Container>
    );
}
