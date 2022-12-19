import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'

const yDoc = new Y.Doc()
const webRtcProvider = new WebrtcProvider('shared-canvas', yDoc)

let currentColor = "black";

const WIDTH = 500;
const HEIGHT = 650;
const STEP = 25;

function drawGridlines(ctx) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'lightgrey';

    // draw vertical lines
    for (let xi = 0; xi < Math.floor(WIDTH / STEP); xi++) {
        ctx.beginPath();
        ctx.moveTo(STEP * xi, 0);
        ctx.lineTo(STEP * xi, HEIGHT);
        ctx.stroke();
    }

    // draw horizontal lines
    for (let xi = 0; xi < Math.floor(HEIGHT / STEP); xi++) {
        ctx.beginPath();
        ctx.moveTo(0, STEP * xi);
        ctx.lineTo(WIDTH, STEP * xi);
        ctx.stroke();
    }
}

function generateRandomNumber() {
    return Math.ceil(Math.random() * 1000000);
}

function generateRandomUser() {
    return {
        id: generateRandomNumber()
    }
}

function setupColorPicker() {
    const cp = document.getElementById("color-picker");
    cp.value = currentColor;

    cp.addEventListener('change', (e) => {
        currentColor = e.target.value;
    })
}

(function () {
    const user = generateRandomUser()
    setupColorPicker();
    // create a new event type
    const DRAW_EVENT = new Event('draw');

    let localState = {
        positions: []
    };

    // set up the CRDT map
    const ymap = yDoc.getMap("collectiveState");
    // listen for changes
    ymap.observe(() => {
        localState = { ...ymap.get("collectiveState") }
        draw()
    })

    // set up the canvas
    const canvas = document.getElementById("main-canvas");
    canvas.height = HEIGHT;
    canvas.width = WIDTH;

    const ctx = canvas.getContext('2d');

    drawGridlines(ctx);

    // listen to the draw event we created
    canvas.addEventListener('draw', (e) => {
        // set the local state as the collective state
        ymap.set("collectiveState", localState);
        draw()
    }, false);

    // when mouse clicks, do the appropriate action
    canvas.addEventListener('mousedown', setPosition);

    function setPosition(e) {
        // if not left or right click, stop
        if (e.buttons !== 1 && e.buttons !== 2) return;

        const [x, y] = [e.clientX, e.clientY];

        const row = Math.floor(y / STEP)
        const col = Math.floor(x / STEP)

        if (e.buttons === 1) {
            // left click
            localState.positions.push({
                user: user,
                color: currentColor,
                position: {
                    row, col
                }
            })
            canvas.dispatchEvent(DRAW_EVENT);
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
    }
})();