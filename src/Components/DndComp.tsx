import { MouseEvent as SyntheticMouseEvent } from 'react';
import MoveSvg from '@/assets/move.svg';
import StretchSvg from '@/assets/stretch.svg';

import { stopPropagation } from '../Utils';
import { Rect } from '@/types';
import styled from '@emotion/styled';
import { MaskedIcon } from './MaskedIcon';

const Container = styled.div`
    user-select: none;
    position: absolute;
`;

const Move = styled(MaskedIcon)<{ scale: number }>`
    position: absolute;
    background-color: white;
    font-size: 4px;
    top: -5px;
    left: -5px;
    width: 5px;
    height: 5px;
    transform-origin: 80% 80%;
    z-index: 2;
    cursor: grab;
    scale: ${({ scale }) => scale};
`;

const Stretch = styled(MaskedIcon)<{ scale: number }>`
    position: absolute;
    background-color: white;
    font-size: 4px;
    bottom: -5px;
    right: -5px;
    width: 4px;
    height: 4px;
    transform-origin: top left;
    z-index: 2;
    cursor: nwse-resize;
    scale: ${({ scale }) => scale};
`;

const Button = styled.button<{ scale: number }>`
    position: absolute;
    font-size: 0.5rem;
    left: 100%;
    top: 100%;
    background-color: transparent;
    padding: 2px;
    box-sizing: border-box;
    z-index: 2;
    margin: 3px 0 0 -1px;
    transform-origin: top right;
    color: white;
    white-space: nowrap;

    border: 1px solid;
    border-image-slice: 1;
    border-width: 1px;
    border-image-source: linear-gradient(315deg, #743ad5, #d53a9d);
    cursor: pointer;
    transition: border-image-source 0.1s ease-in-out;

    transform: translate(-100%, 0%) scale(${({ scale }) => scale});
    :disabled {
        cursor: default;
    }
`;

type Props = {
    mask: Rect | null;
    onDrag: (isDrag: boolean) => void;
    onStretch: (isScaling: boolean) => void;

    scale: number;
};

export default function DndComp({ mask, onDrag, onStretch, scale }: Props) {
    if (!mask) return null;
    const scaled = Math.max(1, (1 / scale) * 4);

    function turnOn(fn: any) {
        return (e: SyntheticMouseEvent) => {
            e.stopPropagation();
            fn(true);
        };
    }

    return (
        <Container style={mask} onMouseUp={() => (onDrag(false), onStretch(false))}>
            <Move onMouseDown={turnOn(onDrag)} scale={scaled} src={MoveSvg} size="4px" />
            <Button disabled onMouseUp={stopPropagation} onMouseDown={stopPropagation} scale={scaled}>
                Please Connect
            </Button>
            <Stretch onMouseDown={turnOn(onStretch)} scale={scaled} src={StretchSvg} size="4px" />
        </Container>
    );
}
