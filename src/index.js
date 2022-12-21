import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'
import { TOOLS } from './tools'
import { drawGridlines } from './canvasUtils'
import { generateRandomUser } from './generalUtils'
import { WIDTH, HEIGHT, STEP } from './constants'

const yDoc = new Y.Doc()
const webRtcProvider = new WebrtcProvider('shared-canvas', yDoc)

let currentColor = "black";
let currentTool = TOOLS.BRUSH

function setupColorPicker() {
    const cp = document.getElementById("color-picker-input");
    cp.value = currentColor;

    const span = document.getElementById("color-picker-span");
    span.addEventListener('click', (e) => {
        cp.click()
    })

    cp.addEventListener('change', (e) => {
        currentColor = e.target.value;
        span.style.backgroundColor = currentColor;
    })
}

function setupTools(canvas) {
    for (let rb of document.querySelectorAll(`input[name="tool"]`)) {
        rb.addEventListener('change', (e) => {
            currentTool = TOOLS.getTool(e.target.value);
            changeCanvasCursor(canvas)
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
    canvas.style.cursor = `url('${currentTool.cursorUrl}'), auto`;
}

(function () {
    const user = generateRandomUser()

    // set up the canvas
    const canvas = setupCanvas();
    const ctx = canvas.getContext('2d');

    setupColorPicker();
    setupTools(canvas);
    // create a new event type
    const DRAW_EVENT = new Event('draw');

    let localState = {
        positions: []
    };

    let userCanvasState = {
        highlightedCell: null
    }

    // set up the CRDT map
    const ymap = yDoc.getMap("collectiveState");
    // listen for changes
    ymap.observe(() => {
        localState = { ...ymap.get("collectiveState") }
        draw()
    })

    drawGridlines(ctx);

    // listen to the draw event we created
    canvas.addEventListener('draw', (e) => {
        // set the local state as the collective state
        ymap.set("collectiveState", localState);
        draw()
    }, false);

    // when mouse clicks, do the appropriate action
    canvas.addEventListener('mousedown', setPosition);
    canvas.addEventListener('mousemove', (e) => {
        const [x, y] = [e.clientX, e.clientY];

        const row = Math.floor(y / STEP)
        const col = Math.floor(x / STEP)

        userCanvasState.highlightedCell = {row, col}
        draw();
    });

    function isCellFree(row, col) {
        return !localState.positions.some(
            (element) =>
                row === element.position.row &&
                col === element.position.col &&
                user.id !== element.user.id)
    }

    function setPosition(e) {
        // if not left or right click, stop
        if (e.buttons !== 1 && e.buttons !== 2) return;

        const [x, y] = [e.clientX, e.clientY];

        const row = Math.floor(y / STEP)
        const col = Math.floor(x / STEP)

        if (e.buttons === 1) {
            const [didModify, modifiedState] = currentTool.handle(
                row,
                col,
                user,
                currentColor,
                localState,
                isCellFree(row, col)
            )
            if (didModify) {
                canvas.dispatchEvent(DRAW_EVENT);
            }
        }
    }

    function draw() {
        // clear
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        // re-draw
        drawGridlines(ctx);
        for (let i = 0; i < localState.positions.length; i++) {
            const { row, col } = localState.positions[i].position;
            ctx.fillStyle = localState.positions[i].color;
            ctx.fillRect(col * STEP, row * STEP, STEP, STEP);
        }

        if (userCanvasState.highlightedCell) {
            const { row, col } = userCanvasState.highlightedCell;
            ctx.setLineDash([7, 3]);
            ctx.strokeStyle = 'black';
            ctx.strokeRect(col * STEP, row * STEP, STEP, STEP);
        }
    }
})();