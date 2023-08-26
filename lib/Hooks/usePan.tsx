import { ORIGIN } from '@/Utils';
import { Point } from '@/types';
import { MouseEvent as SyntheticMouseEvent, RefObject, useState, useRef } from 'react';

export default function usePan(ref: RefObject<HTMLElement | null>) {
    const lastPointRef = useRef<Point>(ORIGIN());
    const [panState, setPanState] = useState<Point>(ORIGIN());
    const [isPanning, setIsPanning] = useState(false);

    const pan = (e: MouseEvent) => {
        setIsPanning(true);

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

    // Set up listeners.
    const startPan = (e: SyntheticMouseEvent) => {
        ref.current?.addEventListener('mousemove', pan);
        lastPointRef.current = { x: e.pageX, y: e.pageY };

        return () => {
            setIsPanning(false);
            ref.current?.removeEventListener('mousemove', pan);
        };
    };

    return [startPan, panState, isPanning] as const;
}
