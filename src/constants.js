import brushSelect from './imgs/brush-select-cursor-24.png';
import eraserSelect from './imgs/eraser-select-cursor-24.png';

export const DIMENSIONS = {
    WIDTH: window.innerWidth,
    HEIGHT: window.innerHeight,
    STEP: 25
}

export const CURSORS = {
    BRUSH: brushSelect,
    ERASER: eraserSelect,
    HAND: 'grab'
}

export const LOCAL_STORAGE_USER_KEY = "USER"