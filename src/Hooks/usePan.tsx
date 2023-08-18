import { ORIGIN } from '@/Utils';
import { Point } from '@/types';
import { MouseEvent as SyntheticMouseEvent, RefObject, useState, useRef } from 'react';

export default function usePan(ref: RefObject<HTMLElement | null>) {
    const lastPointRef = useRef<Point>(ORIGIN());
    const [panState, setPanState] = useState<Point>(ORIGIN());
    const [isPanning, setIsPanning] = useState(false);

    const pan = (e: MouseEvent) => {
        const lastPoint = lastPointRef.current;
        const point: Point = { x: e.pageX, y: e.pageY };
        lastPointRef.current = point;

        setPanState(panState => {
            return {
                x: panState.x + (lastPoint.x - point.x),
                y: panState.y + (lastPoint.y - point.y),
            };
        });
    };

    // Tear down listeners.
    const endPan = (_e: MouseEvent) => {
        setIsPanning(false);
        ref.current?.removeEventListener('mousemove', pan);
        ref.current?.removeEventListener('mouseup', endPan);
    };

    // Set up listeners.
    const startPan = (e: SyntheticMouseEvent) => {
        setIsPanning(true);
        ref.current?.addEventListener('mousemove', pan);
        ref.current?.addEventListener('mouseup', endPan);
        lastPointRef.current = { x: e.pageX, y: e.pageY };
    };

    return [startPan, panState, isPanning] as const;
}
