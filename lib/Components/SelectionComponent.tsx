import { CSSProperties, MouseEvent as SyntheticMouseEvent } from 'react';
import MoveSvg from '$/assets/move.svg';
import StretchSvg from '$/assets/stretch.svg';

import { Rect } from '$/types';
import { MaskedIcon } from './MaskedIcon';

const containerStyle = (mask: Rect): CSSProperties => ({ userSelect: 'none', position: 'absolute', ...mask });
const moveContainerStyle = (scale: number): CSSProperties => ({
    position: 'absolute',
    top: '-5px',
    left: '-5px',
    transformOrigin: '100% 100%',
    scale,
    zIndex: 2,
});
const StretchContainerStyle = (scale: number): CSSProperties => ({
    position: 'absolute',
    bottom: '-5px',
    right: '-5px',
    transformOrigin: 'top left',
    scale,
    zIndex: 2,
});
const componentContainerStyle = (scale: number): CSSProperties => ({
    position: 'absolute',
    left: '100%',
    top: 'calc(100% + 1px)',
    zIndex: 2,
    transformOrigin: 'top right',
    scale,
    transform: 'translate(-100%, 0%)',
});
const moveStyle = {
    fontSize: '4px',
    width: '5px',
    height: '5px',
    cursor: 'grab',
    display: 'block',
};
const stretchStyle = {
    display: 'block',
    fontSize: '4px',
    width: '4px',
    height: '4px',
    cursor: 'nwse-resize',
};

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
        <div style={containerStyle(mask)}>
            <div style={moveContainerStyle(scaled)} onMouseDown={turnOn(onDrag)}>
                {scaleIcon ?? <MaskedIcon src={MoveSvg} size="5px" color="white" style={moveStyle} />}
            </div>
            <div style={componentContainerStyle(scaled)} onMouseDown={e => e.stopPropagation()} onMouseUp={e => e.stopPropagation()}>
                {component}
            </div>
            <div style={StretchContainerStyle(scaled)} onMouseDown={turnOn(onStretch)}>
                {stretchIcon ?? <MaskedIcon src={StretchSvg} size="4px" color="white" style={stretchStyle} />}
            </div>
        </div>
    );
}
