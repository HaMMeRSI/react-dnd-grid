import './DndComponent.css';
import { CSSProperties, MouseEvent as SyntheticMouseEvent, RefObject } from 'react';
import SvgMove from '../../Images/MoveSvg';
import ScaleSvg from '../../Images/ScaleSvg';
import { stopPropagation } from '../../Utils';
import { Rect } from '@/types';

type Props = {
    parent: RefObject<HTMLElement>;
    mask: Rect | null;
    setDrag: (isDrag: boolean) => void;
    setIsScaling: (isScaling: boolean) => void;

    scale: number;
    parentForPotal: React.RefObject<HTMLDivElement>;
};

export default function DndComp({ mask, setDrag, setIsScaling, scale, parentForPotal: _ }: Props) {
    if (!mask) return null;

    function dnd_drag_down(e: SyntheticMouseEvent) {
        e.stopPropagation();
        setDrag(true);
    }
    function dnd_scale_down(e: SyntheticMouseEvent) {
        e.stopPropagation();
        setIsScaling(true);
    }
    function getScale(): CSSProperties {
        return {
            transform: `scale(${Math.max(1, (1 / scale) * 4)})`,
        };
    }
    function getButtonPos(): CSSProperties {
        return { transform: `translate(-100%, 0%) scale(${Math.max(1, (1 / scale) * 4)})` };
    }

    return (
        <div className="dnd" style={mask}>
            <div className="dnd_move" onMouseDown={dnd_drag_down} style={getScale()}>
                <SvgMove></SvgMove>
            </div>
            <div className="dnd_min_disabled" style={getButtonPos()} onMouseUp={stopPropagation} onMouseDown={stopPropagation}>
                Please Connect
            </div>
            <div className="dnd_scale" onMouseDown={dnd_scale_down} style={getScale()}>
                <ScaleSvg></ScaleSvg>
            </div>
            {/* <Popup tokenId={tokenId} onClose={closeWidnow} parentForPotal={parentForPotal} isVisible={isVisible}></Popup> */}
        </div>
    );
}
