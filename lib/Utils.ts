import { UIEvent } from 'react';
import { Point } from './types';

export function stopPropagation(e: UIEvent) {
    e.stopPropagation();
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

export function clamp(min: number, max: number, val: number) {
    if (val >= max) return max;
    if (val <= min) return min;
    return val;
}

export function easeInOutSine(x: number): number {
    return -(Math.cos(Math.PI * x) - 1) / 2;
}

export function remap(value: number, low1: number, high1: number, low2: number, high2: number) {
    return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
}
