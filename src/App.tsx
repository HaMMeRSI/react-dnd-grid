import { useRef, useState, MouseEvent } from 'react';
import usePan from './Hooks/usePan';
import useScale from './Hooks/useScale';
import usePrevious from './Hooks/usePrevious';
import MaskedArea from './Components/MaskedArea';
import DndComp from './Components/DndComponent/DndComp';
import { Rect } from './types';
import styled from '@emotion/styled';
import { ORIGIN, parseN, pointUtils } from './Utils';

const Container = styled.div<{ cursor?: string }>`
    position: relative;
    cursor: ${props => props.cursor ?? 'default'};
`;

const RealPixestate = styled.div<{ offsetX: number; offsetY: number; scale: number }>`
    position: relative;
    transform: ${({ offsetX, offsetY, scale }) => `translate(${-offsetX}px, ${-offsetY}px) scale(${scale})`};
    transform-origin: 0 0;
    display: inline-block;
    width: fit-content;
    box-shadow: black 0 0 50px -20px;
`;

const Grid = styled.div`
    pointer-events: none;
    position: relative;
    width: 1000px;
    height: 1000px;
    background-size: 5px 5px;
    background-image: linear-gradient(to right, grey 0.25px, transparent 0.25px),
        linear-gradient(to bottom, grey 0.25px, transparent 0.25px);
`;

const Canvas = styled.canvas`
    position: absolute;
    top: 0;
    left: 0;
`;

const Blur = styled.div`
    width: 100%;
    height: 100%;
    background-color: rgba(179, 179, 179, 0.23);
    position: absolute;
    top: 0;
    left: 0;
    filter: blur(4px);
    pointer-events: none;
`;

export default function App() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const realPixestateRef = useRef<HTMLDivElement>(null);
    const adjustedOffset = useRef(ORIGIN());

    const [isDndDraging, setIsDndDraging] = useState(false);
    const [isDndScaling, setIsDndScaling] = useState(false);

    const [relativeMousePos, setRelativeMousePos] = useState(ORIGIN());
    const [mousePosDown, setMousePosDown] = useState(ORIGIN());

    const [cursor, setCursor] = useState('default');
    const [mask, setMaskPos] = useState<Rect | null>();

    const [startPan, offset] = usePan(realPixestateRef);
    const scale = useScale(realPixestateRef);

    const lastOffset = usePrevious(offset) ?? offset;
    const lastScale = usePrevious(scale) ?? scale;

    if (lastScale === scale) {
        const delta = pointUtils.diff(offset, lastOffset);
        adjustedOffset.current = pointUtils.sum(adjustedOffset.current, delta);
    } else {
        const lastMouse = pointUtils.scale(relativeMousePos, lastScale);
        const newMouse = pointUtils.scale(relativeMousePos, scale);
        const mouseOffset = pointUtils.diff(lastMouse, newMouse);
        adjustedOffset.current = pointUtils.diff(adjustedOffset.current, mouseOffset);
    }

    function dndMove(e: MouseEvent) {
        e.stopPropagation();

        if (mask) {
            const left = Math.max(0, Math.min(1000 - mask.width, parseN(relativeMousePos.x)));
            const top = Math.max(0, Math.min(1000 - mask.height, parseN(relativeMousePos.y)));
            setMaskPos({ top, left, width: mask.width, height: mask.height });
        }
    }

    function dndScale(e: MouseEvent) {
        e.stopPropagation();
        if (mask) {
            const m = 4;
            const height = Math.min(1000 - mask.top, Math.max(m, parseN(relativeMousePos.y) - mask.top + m));
            const width = Math.min(1000 - mask.left, Math.max(m, parseN(relativeMousePos.x) - mask.left + m));
            setMaskPos({ top: mask.top, left: mask.left, width: width > 999 ? 999 : width, height: height > 999 ? 999 : height });
        }
    }

    function onMouseDown(e: MouseEvent) {
        startPan(e);
        setMousePosDown({ x: e.pageX, y: e.pageY });
    }

    function onMouseMove(e: MouseEvent) {
        setCursor('default');

        if (isDndDraging) {
            setCursor('grabbing');
            dndMove(e);
        } else if (isDndScaling) {
            setCursor('nw-resize');
            dndScale(e);
        }

        setRelativeMousePos({
            x: (e.pageX + adjustedOffset.current.x) / scale,
            y: (e.pageY + adjustedOffset.current.y) / scale,
        });
    }

    function onMouseUp(e: MouseEvent) {
        e.stopPropagation();
        const upPoint = { x: e.pageX, y: e.pageY };

        if (pointUtils.eq(upPoint, mousePosDown) && !mask) {
            setMaskPos({
                top: parseInt(`${relativeMousePos.y / 5}`) * 5,
                left: parseInt(`${relativeMousePos.x / 5}`) * 5,
                width: 4,
                height: 4,
            });
        } else if (!isDndDraging && !isDndScaling) {
            setMaskPos(null);
        }

        setIsDndDraging(false);
        setIsDndScaling(false);
        setCursor('default');
    }

    return (
        <Container cursor={cursor} ref={containerRef}>
            <RealPixestate
                offsetX={adjustedOffset.current.x}
                offsetY={adjustedOffset.current.y}
                scale={scale}
                ref={realPixestateRef}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}>
                <Grid />
                <Canvas ref={canvasRef} width="1000" height="1000" />
                {!!mask && (
                    <DndComp
                        parent={realPixestateRef}
                        parentForPotal={containerRef}
                        setDrag={setIsDndDraging}
                        setIsScaling={setIsDndScaling}
                        mask={mask}
                        scale={scale}
                    />
                )}
                {!!mask && <MaskedArea mask={mask} />}
                <Blur />
                {/* <DescriptionBox scale={scale} tokenId={getAreaId([mask.x, mask.y], [mask.x + mask.w - 1, mask.y + mask.h - 1])} /> */}
            </RealPixestate>
        </Container>
    );
}
