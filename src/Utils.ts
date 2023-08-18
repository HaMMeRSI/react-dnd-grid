import { UIEvent } from 'react';
import { Point, Section } from './types';

export function stopPropagation(e: UIEvent) {
    e.stopPropagation();
}

export function maskToTokenId(mask: Section, size = 1000) {
    return (mask.left * size + mask.top) * size * size + (mask.left + mask.width) * size + (mask.top + mask.height);
}

export function breakTokenId(tokenId: number): Section {
    function Section(x1: any, y1: any, x2: any, y2: any): Section {
        return {
            left: parseInt(x1),
            top: parseInt(y1),
            width: parseInt(x2) - parseInt(x1) || 1000,
            height: parseInt(y2) - parseInt(y1) || 1000,
        };
    }

    const dimensions = 1000;
    const dimSquared = dimensions * dimensions;
    const xy1 = tokenId / dimSquared;
    const xy2 = tokenId % dimSquared;

    const x1 = xy1 / dimensions;
    const y1 = xy1 % dimensions;

    const x2 = xy2 / dimensions;
    const y2 = xy2 % dimensions;

    return Section(x1, y1, x2, y2);
}

export function checkIntersection(tokenId: number, tokenIds: number[]) {
    for (const currTokenId of tokenIds) {
        const area1 = breakTokenId(tokenId);
        const area2 = breakTokenId(currTokenId);
        if (!(area2.left > area1.left + area1.width || area2.left + area2.width < area1.left || area2.top > area1.top + area1.height || area2.top + area2.height < area1.top)) {
            return true;
        }
    }

    return false;
}

export async function getImageSize(src: string): Promise<number> {
    try {
        const fetchedData = await fetch(src);
        const blob = await fetchedData.blob();
        return blob.size;
    } catch (e) {
        return -1;
    }
}

export const ORIGIN = (): Point => ({ x: 0, y: 0 });

export const pointUtils = {
    sum: (p1: Point, p2: Point) => ({ x: p1.x + p2.x, y: p1.y + p2.y }),
    diff: (p1: Point, p2: Point) => ({ x: p1.x - p2.x, y: p1.y - p2.y }),
    scale: (p1: Point, scale: number) => ({ x: p1.x * scale, y: p1.y * scale }),
    map: (p1: Point, fn: (x: number, y: number) => Point) => fn(p1.x, p1.y),
    eq: (p1: Point, p2: Point) => p1.x === p2.x && p1.y === p2.y,
};

export const parseN = (number: number, n: number = 5) => parseInt(`${number / n}`) * n;

export function getCoordId([x1, y1]: [number, number], [x2, y2]: [number, number], size = 1000) {
    return (x1 * size + y1) * size * size + x2 * size + y2;
}

export function clamp(min: number, max: number, val: number) {
    if (val >= max) return max;
    if (val <= min) return min;
    return val;
}
