import styled from '@emotion/styled';
import { useState } from 'react';
import { Grid, GridProvider } from '$/main';

const StyledGrid = styled(Grid)`
    background-color: #eeeeee22;
`;

// const Canvas = styled.canvas`
//     position: absolute;
//     top: 0;
//     left: 0;
// `;

const Img = styled.img`
    position: absolute;
    top: 0;
    left: 0;
    user-select: none;
    pointer-events: none;
    width: 100%;
    height: 100%;
`;

const Button = styled.button`
    display: block;
    font-size: 0.5rem;
    background-color: transparent;
    padding: 2px;
    box-sizing: border-box;
    margin-top: 1px;
    color: white;
    white-space: nowrap;

    border: 1px solid;
    border-image-slice: 1;
    border-width: 1px;
    border-image-source: linear-gradient(315deg, #743ad5, #d53a9d);
    cursor: pointer;
    transition: border-image-source 0.1s ease-in-out;

    :disabled {
        cursor: default;
    }
`;

export default function App() {
    const [cellSize, _setCellSize] = useState(5);
    const [dimensions, _setDimensions] = useState(100);

    return (
        <GridProvider>
            <StyledGrid
                gridOptions={{
                    enable: true,
                    cellSize,
                    dimensions,
                    lineWidth: 0.1,
                }}
                selectOptions={{
                    enable: true,
                    maskOptions: {
                        lineWidth: 2,
                    },
                    component: <Button onClick={() => console.log('Hello')}>Click</Button>,
                }}>
                {/* <Canvas width={cellSize * dimensions} height={cellSize * dimensions} /> */}
                <Img src="https://picsum.photos/500/500" />
            </StyledGrid>
        </GridProvider>
    );
}
