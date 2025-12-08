export interface Size {
    width: number;
    height: number;
}

export interface Point {
    x: number;
    y: number;
}

export interface Rect extends Point, Size {}

export function pointDelta(a: Point, b: Point): Point {
    return {
        x: b.x - a.x,
        y: b.y - a.y,
    };
}

export function pointsDistance(p1: Point, p2: Point): number {
    return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}
