import { easeInOutSine, remap } from '@/Utils';
import { RefObject, useCallback, useEffect, useState } from 'react';

function clamp(min: number, max: number, val: number) {
    if (val > max) return max;
    if (val < min) return min;
    return val;
}

interface IOptions {
    start?: number;
    max?: number;
    speed?: number;
}

function handleZoom(start: number, max: number, speed: number) {
    let current = 0;

    return (direction: 1 | -1) => {
        current = clamp(start, max, current + speed * direction);
        const remped = remap(current, start, max, 0, 1);
        const easing = easeInOutSine(remped);

        return remap(easing, 0, 1, start, max);
    };
}

export default function useScale(ref: RefObject<HTMLElement | null>, options?: IOptions) {
    const { start = 1, max = 10, speed = 0.1 } = options ?? {};
    const [scale, setScale] = useState(start);
    const zoom = useCallback(handleZoom(start, max, speed), [start, max, speed]);

    useEffect(() => {
        const listenerWrapper = (e: GlobalEventHandlersEventMap['wheel']) => {
            e.preventDefault();

            const newScale = zoom(e.deltaY > 0 ? -1 : 1);

            setScale(newScale);
        };

        ref.current?.addEventListener('wheel', listenerWrapper, { passive: false });
        return () => ref.current?.removeEventListener('wheel', listenerWrapper);
    }, []);

    return scale;
}
