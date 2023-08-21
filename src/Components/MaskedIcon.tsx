import styled from '@emotion/styled';

export const MaskedIcon = styled.svg<{
    src: string;
    size: string;
    color?: string;
}>`
    background-color: ${({ color }) => color || 'currentcolor'};
    mask: url(${({ src }) => src}) no-repeat center left;
    mask-size: contain;
    width: ${({ size }) => size};
    height: ${({ size }) => size};
    padding: 0;
    margin: 0;
`;
