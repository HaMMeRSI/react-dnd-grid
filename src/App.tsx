import { CSSProperties, useState } from 'react';
import { Grid, GridProvider } from '$/main';

const imgStyle: CSSProperties = {
    position: 'absolute',
    top: '0',
    left: '0',
    userSelect: 'none',
    pointerEvents: 'none',
    width: '100%',
    height: '100%',
};

const buttonStyle: CSSProperties = {
    display: 'block',
    fontSize: '0.5rem',
    backgroundColor: 'transparent',
    padding: '2px',
    boxSizing: 'border-box',
    marginTop: '1px',
    color: 'white',
    whiteSpace: 'nowrap',
    border: '1px solid',
    borderImageSlice: '1',
    borderWidth: '1px',
    borderImageSource: 'linear-gradient(315deg, #743ad5, #d53a9d)',
    cursor: 'pointer',
    transition: 'border-image-source 0.1s ease-in-out',
};

export default function App() {
    const [cellSize, _setCellSize] = useState(5);
    const [dimensions, _setDimensions] = useState(100);

    return (
        <GridProvider>
            <Grid
                style={{ backgroundColor: '#eeeeee22' }}
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
                    component: (
                        <button onClick={() => console.log('Hello')} style={buttonStyle}>
                            Click
                        </button>
                    ),
                }}>
                {/* <Canvas width={cellSize * dimensions} height={cellSize * dimensions} /> */}
                <img src="https://picsum.photos/500/500" style={imgStyle} />
            </Grid>
        </GridProvider>
    );
}
