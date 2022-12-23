import circle from './imgs/circle.png'
import square from './imgs/square.png'
import atbl from './imgs/acute-tr-bottom-left.png'
import atbr from './imgs/acute-tr-bottom-right.png'
import attl from './imgs/acute-tr-top-left.png'
import attr from './imgs/acute-tr-top-right.png'

import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'
import { BRUSH_SHAPES, TOOLS, TRIANGLE } from './tools'
import { drawGridlines } from './canvasUtils'
import { generateRandomUser } from './generalUtils'
import { WIDTH, HEIGHT, STEP } from './constants'

const yDoc = new Y.Doc()
const webRtcProvider = new WebrtcProvider('shared-canvas', yDoc)

let localCollectiveState = {
    positions: []
};

const userCanvasState = {
    highlightedCell: null,
    isMouseDown: false,
    currentTool: TOOLS.BRUSH,
    currentColor: "black",
    currentShape: BRUSH_SHAPES.SQUARE,
    currentStyle: "fill", // fill | line | dashed
}

function setupBrushShapes(drawFunction) {
    const shapesDiv = document.querySelector("#shapes-popup .shapes")
    const options = [
        ["circle", circle, BRUSH_SHAPES.CIRCLE],
        ["square", square, BRUSH_SHAPES.SQUARE],
        ["acute triangle 1", atbl, BRUSH_SHAPES.TRIANGLE.new(TRIANGLE.ACUTE_BL)],
        ["acute triangle 2", atbr, BRUSH_SHAPES.TRIANGLE.new(TRIANGLE.ACUTE_BR)],
        ["acute triangle 3", attl, BRUSH_SHAPES.TRIANGLE.new(TRIANGLE.ACUTE_TL)],
        ["acute triangle 4", attr, BRUSH_SHAPES.TRIANGLE.new(TRIANGLE.ACUTE_TR)],
    ];

    options.forEach(([name, src, shape]) => {
        const span = document.createElement("span");
        span.classList = ["item"];
        const img = document.createElement("img");
        img.src = src;
        img.alt = name;
        span.appendChild(img)

        span.addEventListener('click', (event) => {
            userCanvasState.currentShape = shape;
            document.getElementById("shapes-popup").style.display = "none";
            drawFunction()
        });

        shapesDiv.appendChild(span);
    })
}

function setupColorPicker() {
    const cp = document.getElementById("color-picker-input");
    cp.value = userCanvasState.currentColor;

    const span = document.getElementById("color-picker-span");
    span.addEventListener('click', (e) => {
        cp.click()
    })

    cp.addEventListener('change', (e) => {
        userCanvasState.currentColor = e.target.value;
        span.style.backgroundColor = userCanvasState.currentColor;
    })
}

function setupTools(canvas) {
    for (let rb of document.querySelectorAll(`input[name="tool"]`)) {
        rb.addEventListener('change', (e) => {
            userCanvasState.currentTool = TOOLS.getTool(e.target.value);
            changeCanvasCursor(canvas)
        })
    }
}

function setupFillStyle(canvas) {
    for (let rb of document.querySelectorAll(`input[name="fill-style"]`)) {
        rb.addEventListener('change', (e) => {
            userCanvasState.currentStyle = e.target.value;
        })
    }
}

function setupCanvas() {
    const canvas = document.getElementById("main-canvas");
    canvas.height = HEIGHT;
    canvas.width = WIDTH;
    changeCanvasCursor(canvas);
    return canvas
}

function changeCanvasCursor(canvas) {
    canvas.style.cursor = `url('${userCanvasState.currentTool.cursorUrl}'), auto`;
}

function getRowColPair(event) {
    const [x, y] = [event.clientX, event.clientY];

    const row = Math.floor(y / STEP);
    const col = Math.floor(x / STEP);

    return [row, col];
}

(function () {
    const user = generateRandomUser()

    // set up the canvas
    const canvas = setupCanvas();
    const ctx = canvas.getContext('2d');

    setupColorPicker();
    setupTools(canvas);
    setupBrushShapes(draw);
    setupFillStyle(canvas);
    // create a new event type
    const DRAW_EVENT = new Event('draw');

    // set up the CRDT map
    const ymap = yDoc.getMap("collectiveState");
    // listen for changes
    ymap.observe(() => {
        localCollectiveState = { ...ymap.get("collectiveState") }
        draw()
    })

    drawGridlines(ctx);

    // listen to the draw event we created
    canvas.addEventListener('draw', (e) => {
        // set the local state as the collective state
        ymap.set("collectiveState", localCollectiveState);
        draw()
    }, false);

    // when mouse clicks, do the appropriate action
    canvas.addEventListener('mousedown', setPosition);
    canvas.addEventListener('mousemove', (e) => {
        const [row, col] = getRowColPair(e);

        userCanvasState.highlightedCell = { row, col }
        draw();

        if (userCanvasState.isMouseDown) {
            const [didModify, modifiedState] = userCanvasState.currentTool.handle(
                row,
                col,
                user,
                {
                    shapeName: userCanvasState.currentShape.value,
                    color: userCanvasState.currentColor,
                    style: userCanvasState.currentStyle
                },
                localCollectiveState,
                isCellFree(row, col)
            )
            if (didModify) {
                canvas.dispatchEvent(DRAW_EVENT);
            }
        }
    });

    canvas.addEventListener('mouseup', (e) => {
        userCanvasState.isMouseDown = false;
    })

    function isCellFree(row, col) {
        return !localCollectiveState.positions.some(
            (element) =>
                row === element.position.row &&
                col === element.position.col &&
                user.id !== element.user.id)
    }

    function setPosition(e) {
        // if not left or scroll button click, stop
        if (e.buttons !== 1 && e.buttons !== 4) return;

        const [row, col] = getRowColPair(e);

        if (e.buttons === 1) {
            userCanvasState.isMouseDown = true;
            const [didModify, modifiedState] = userCanvasState.currentTool.handle(
                row,
                col,
                user,
                {
                    shapeName: userCanvasState.currentShape.value,
                    color: userCanvasState.currentColor,
                    style: userCanvasState.currentStyle
                },
                localCollectiveState,
                isCellFree(row, col)
            )
            if (didModify) {
                canvas.dispatchEvent(DRAW_EVENT);
            }
        } else {
            const shapesPopupDiv = document.getElementById("shapes-popup");

            const closeShapesPopup = (event) => {
                if (event.key === "Escape") {
                    shapesPopupDiv.style.display = "none";
                }
                document.removeEventListener("click", closeShapesPopup);
            };

            e.preventDefault();
            e.stopPropagation();
            document.addEventListener('keydown', closeShapesPopup);
            const x = e.offsetX + 15;
            const y = e.offsetY + 15;
            shapesPopupDiv.style.display = "block";
            shapesPopupDiv.style.top = `${y}px`;
            shapesPopupDiv.style.left = `${x}px`;
        }
    }

    function getShape(shapeName) {
        for (const shape of Object.values(BRUSH_SHAPES)) {
            const result = shape.getShape(shapeName)
            if (result) {
                return result;
            }
        }
        return null
    }

    function draw() {
        // clear
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        // re-draw
        drawGridlines(ctx);
        for (let i = 0; i < localCollectiveState.positions.length; i++) {
            getShape(localCollectiveState.positions[i].shapeName)?.draw(
                ctx,
                localCollectiveState.positions[i].position,
                {
                    color: localCollectiveState.positions[i].color,
                    style: localCollectiveState.positions[i].style
                }
            )
        }

        if (userCanvasState.highlightedCell) {
            userCanvasState.currentShape.draw(ctx, userCanvasState.highlightedCell, { style: "dashed" })
        }
    }
})();