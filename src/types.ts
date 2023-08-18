export type Point = { x: number; y: number };
export type ImageT = [string, number, number, number, number];
export type Section = { x: number; y: number; w: number; h: number };
export type Metadata = {
    tokenId: number;
    image_url: string;
    description: string;
    external_url: string;
    url_title: string;
    name: string;
    bio_link: string;
};
export type TokenPrices = {
    ETH: number;
    DAI: number;
    USDC: number;
    USDT: number;
    TST: number;
    [key: string]: number;
};

export type Rect = { x: number; y: number; w: number; h: number };

declare global {
    interface Window {}
}
