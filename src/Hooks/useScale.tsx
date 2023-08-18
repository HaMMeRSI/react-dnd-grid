import { RefObject, useEffect, useState } from 'react';

const MIN_SCALE = 0.4;
const MAX_SCALE = 10;

function clamp(min: number, max: number, val: number) {
    if (val > max) return max;
    if (val < min) return min;
    return val;
}

export default function useScale(ref: RefObject<HTMLElement | null>) {
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const listenerWrapper = (e: GlobalEventHandlersEventMap['wheel']) => {
            e.preventDefault();
            const direction = e.deltaY > 0 ? -1 : 1;
            setScale(currentScale => clamp(MIN_SCALE, MAX_SCALE, currentScale + 0.2 * direction));
        };

        ref.current?.addEventListener('wheel', listenerWrapper, { passive: false });
        return () => ref.current?.removeEventListener('wheel', listenerWrapper);
    }, []);

    return scale;
}
