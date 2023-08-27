# React Pannable Zoomable Gridable Content

> This is a light and simple react component for panning and zooming html elements.

<p>
  <a href="https://www.npmjs.com/package/react-zoom-pan-grid">
    <img src="https://custom-icon-badges.demolab.com/npm/v/react-zoom-pan-grid.svg?logo=npm&color=e22000"/>
  </a>
  <a href="https://github.com/HaMMeRSI/react-zoom-pan-grid">
    <img src="https://custom-icon-badges.demolab.com/github/stars/HaMMeRSI/react-zoom-pan-grid?logo=star" />
  </a>
  <a href="https://raw.githubusercontent.com/HaMMeRSI/react-zoom-pan-grid/main/LICENSE">
    <img src="https://custom-icon-badges.demolab.com/github/license/HaMMeRSI/react-zoom-pan-grid?logo=law&color=green" />
  </a>
  <a href="https://www.npmjs.com/package/react-zoom-pan-grid">
    <img src="https://custom-icon-badges.demolab.com/npm/dm/react-zoom-pan-grid?logoColor=fff&logo=trending-up" />
  </a>
  <a href="https://www.npmjs.com/package/react-zoom-pan-grid">
    <img src="https://custom-icon-badges.demolab.com/bundlephobia/minzip/react-zoom-pan-grid?color=E10098&logo=package" />
  </a>
  <a href="https://github.com/HaMMeRSI/react-zoom-pan-grid">
    <img src="https://custom-icon-badges.demolab.com/badge/typescript-%23007ACC.svg?logo=typescript&logoColor=white" />
  </a>
  
</p>

## Key Features

🚀 Fast and easy to use

🧚🏻 No external dependencies

🔧 Highly customizable

🌐 Show grid ontop of the content

🔲 Make a selection on grid

## Installation

```
npm install --save react-zoom-pan-grid
or
yarn add react-zoom-pan-grid
```

## Examples

```tsx
import { CSSProperties, useState } from 'react';
import { Box, BoxProvider } from 'react-zoom-pan-grid';

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
        <BoxProvider>
            <Box
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
                <img src="https://picsum.photos/500/500" style={imgStyle} />
            </Box>
        </BoxProvider>
    );
}
```

### Caveat
> This package does not work properly with React.UseStrict double rendering, remove it to properly work with it.

## License
MIT © [Sagi Hammer](https://github.com/HaMMeRSI)
