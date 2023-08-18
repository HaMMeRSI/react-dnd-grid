import './DndComponent.css';
import { CSSProperties, MouseEvent as SyntheticMouseEvent, RefObject, useCallback, useState } from 'react';
import SvgMove from '../../Images/MoveSvg';
import ScaleSvg from '../../Images/ScaleSvg';
import { Section } from '../../types';
import Popup from '../Popup/Popup';
import { maskToTokenId, stopPropagation } from '../../Utils';

type Props = {
    parent: RefObject<HTMLElement>;
    mask: Section;
    setDrag: (isDrag: boolean) => void;
    setIsScaling: (isScaling: boolean) => void;

    scale: number;
    parentForPotal: React.RefObject<HTMLDivElement>;
};

export default function DndComp({ mask, setDrag, setIsScaling, scale, parentForPotal }: Props) {
    const [isVisible, setVisiblity] = useState(false);
    const [tokenId, setTokenId] = useState(0);

    const pos: CSSProperties = {
        top: mask.y,
        left: mask.x,
        width: mask.w,
        height: mask.h,
    };

    function openWidnow(e: SyntheticMouseEvent) {
        e.stopPropagation();
        setTokenId(maskToTokenId(mask));
        setVisiblity(true);
    }

    const closeWidnow = useCallback(
        function closeWidnow(e?: SyntheticMouseEvent) {
            e?.stopPropagation();
            e?.preventDefault();
            setVisiblity(false);
            setDrag(false);
        },
        [setDrag]
    );

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
    function getMintPos(): CSSProperties {
        return { transform: `translate(-100%, 0%) scale(${Math.max(1, (1 / scale) * 4)})` };
    }

    return (
        <div className="dnd" style={pos}>
            <div className="dnd_move" onMouseDown={dnd_drag_down} style={getScale()}>
                <SvgMove></SvgMove>
            </div>
            {!getScale ? (
                <div className="dnd_mint" style={getMintPos()} onMouseUp={openWidnow} onMouseDown={stopPropagation}>
                    Request
                </div>
            ) : (
                <div className="dnd_min_disabled" style={getMintPos()} onMouseUp={stopPropagation} onMouseDown={stopPropagation}>
                    Please Connect
                </div>
            )}
            <div className="dnd_scale" onMouseDown={dnd_scale_down} style={getScale()}>
                <ScaleSvg></ScaleSvg>
            </div>
            {/* <Popup tokenId={tokenId} onClose={closeWidnow} parentForPotal={parentForPotal} isVisible={isVisible}></Popup> */}
        </div>
    );
}
