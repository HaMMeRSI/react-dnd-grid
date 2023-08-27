import { CSSProperties } from 'react';

const iconStyle = (src: string, size: string, color: string = 'currentcolor'): CSSProperties => ({
    backgroundColor: color,
    mask: `url(${src}) center left no-repeat`,
    WebkitMask: `url(${src}) center left no-repeat`,
    maskSize: `contain`,
    WebkitMaskSize: `contain`,
    width: size,
    height: size,
    padding: 0,
    margin: 0,
});

interface IProps {
    src: string;
    size: string;
    color?: string;
    className?: string;
    style?: CSSProperties;
}

export function MaskedIcon({ src, size, color, className, style }: IProps) {
    return <svg style={{ ...iconStyle(src, size, color), ...style }} className={className} />;
}
