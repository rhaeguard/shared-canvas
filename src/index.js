import circle from './imgs/circle.png'
import square from './imgs/square.png'
import atbl from './imgs/acute-tr-bottom-left.png'
import atbr from './imgs/acute-tr-bottom-right.png'
import attl from './imgs/acute-tr-top-left.png'
import attr from './imgs/acute-tr-top-right.png'

import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'
import { BRUSH_SHAPES, CELL_OWNERSHIP, TOOLS, TRIANGLE } from './tools'
import { drawGridlines } from './canvasUtils'
import { generateRandomUser } from './generalUtils'
import { DIMENSIONS } from './constants'

const yDoc = new Y.Doc()
const webRtcProvider = new WebrtcProvider('shared-canvas', yDoc)

let localCollectiveState = {
    positions: []
};

export const userCanvasState = {
    highlightedCell: null,
    positionClickedOn: null,
    currentCenter: [(DIMENSIONS.WIDTH) / 2, (DIMENSIONS.HEIGHT) / 2],
    isMouseDown: false,
    currentTool: TOOLS.BRUSH,
    currentColor: "black",
    currentShape: BRUSH_SHAPES.SQUARE,
    currentStyle: "fill", // fill | line | dashed
}

function setupBrushShapes(drawFunction) {
    const shapesDiv = document.querySelector(".shapes")
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
    const allBtns = document.querySelectorAll(".canvas-tool");
    for (let btn of allBtns) {
        if (btn.dataset.toolName === userCanvasState.currentTool.value) {
            btn.classList.add("selected-canvas-tool");
        }
        btn.addEventListener('click', (e) => {
            userCanvasState.currentTool = TOOLS.getTool(btn.dataset.toolName);
            changeCanvasCursor(canvas);
            allBtns.forEach(aBtn => aBtn.classList.remove("selected-canvas-tool"));
            btn.classList.add("selected-canvas-tool");
        })
    }
}

function setupFillStyle(canvas) {
    const allSpans = document.querySelectorAll(`.fill-style`);
    for (let span of allSpans) {
        if (span.dataset.fillStyleValue ===  userCanvasState.currentStyle) {
            span.classList.add("selected-fill-style");
        }
        span.addEventListener('click', (e) => {
            userCanvasState.currentStyle = span.dataset.fillStyleValue;
            allSpans.forEach(aSpan => aSpan.classList.remove("selected-fill-style"));
            span.classList.add("selected-fill-style");
        })
    }
}

function setupCanvas() {
    const canvas = document.getElementById("main-canvas");
    canvas.height = DIMENSIONS.HEIGHT;
    canvas.width = DIMENSIONS.WIDTH;
    changeCanvasCursor(canvas);
    return canvas
}

function setupZoomInOut(drawFunction) {
    document.getElementById("zoom-in").addEventListener('click', (event) => {
        DIMENSIONS.STEP += 5;
        drawFunction();
    })

    document.getElementById("zoom-out").addEventListener('click', (event) => {
        DIMENSIONS.STEP -= 5;
        drawFunction();
    })
}

function changeCanvasCursor(canvas) {
    if (userCanvasState.currentTool.cursorUrl === "grab") {
        canvas.style.cursor = userCanvasState.currentTool.cursorUrl;        
    } else {
        canvas.style.cursor = `url('${userCanvasState.currentTool.cursorUrl}'), auto`;        
    }
}

function getRowColPair(event) {
    const [x, y] = [event.clientX, event.clientY];

    const [cx, cy] = userCanvasState.currentCenter;

    const dx = Math.abs(cx - x);
    const dy = Math.abs(cy - y);

    const rawRow = Math.ceil(dy / DIMENSIONS.STEP);
    const rawCol = Math.ceil(dx / DIMENSIONS.STEP);

    const sigX = cx - x > 0 ? -1 : 1;
    const sigY = cy - y > 0 ? -1 : 1;

    const col = sigX * rawCol;
    const row = sigY * rawRow;

    return [row, col];
}

function addNewCollaborator(collaboratorName, isMe, clearAll) {
    const collaboratorsDiv = document.getElementById("collaborators");
    if (clearAll) {
        collaboratorsDiv.innerHTML = "";
    }
    const newPerson = document.createElement("div");
    newPerson.innerText = collaboratorName.trim().split(" ").map(e => e.charAt(0)).join("")
    newPerson.title = isMe ? `You(${collaboratorName})` : collaboratorName;
    const classes = isMe ? ["collaborator", "currentUser"] : ["collaborator"]
    newPerson.classList.add(...classes);
    collaboratorsDiv.appendChild(newPerson);
}

(function () {
    const user = generateRandomUser()
    addNewCollaborator(user.name, true)
    const allUsers = yDoc.getMap("availableUsers")
    setInterval(() => {
        allUsers.set(`${user.id}`, {
            user,
            lastSeen: new Date().toString()
        });
    }, 5000);

    allUsers.observe(() => {
        addNewCollaborator(user.name, true, true)
        for (const [userId, data] of allUsers.entries()) {
            const {user: savedUser, lastSeen} = data;
            const lastSeenMillis = Date.parse(lastSeen);
            const nowMillis = Date.parse(new Date().toString());
            if (nowMillis - lastSeenMillis <= 10_000 && savedUser.id !== user.id) {
                addNewCollaborator(savedUser.name, false, false)
            }
        }
    })

    // set up the canvas
    const canvas = setupCanvas();
    const ctx = canvas.getContext('2d');

    setupColorPicker();
    setupTools(canvas);
    setupBrushShapes(draw);
    setupFillStyle(canvas);
    setupZoomInOut(draw);
    // create a new event type
    const DRAW_EVENT = new Event('draw');

    // set up the CRDT map
    const remoteCollectiveState = yDoc.getMap("collectiveState");
    // listen for changes
    remoteCollectiveState.observe(() => {
        localCollectiveState = { ...remoteCollectiveState.get("collectiveState") }
        draw()
    })

    drawGridlines(ctx, userCanvasState.currentCenter[0], userCanvasState.currentCenter[1]);

    const changeCenter = (x, y) => {
        userCanvasState.currentCenter = [x, y];
        canvas.dispatchEvent(DRAW_EVENT);
    };

    // listen to the draw event we created
    canvas.addEventListener('draw', (e) => {
        // set the local state as the collective state
        remoteCollectiveState.set("collectiveState", localCollectiveState);
        draw()
    }, false);

    // when mouse clicks, do the appropriate action
    window.onresize = (event) => {
        event.preventDefault();
        DIMENSIONS.HEIGHT = window.innerHeight;
        DIMENSIONS.WIDTH = window.innerWidth;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        userCanvasState.currentCenter = [(DIMENSIONS.WIDTH) / 2, (DIMENSIONS.HEIGHT) / 2],
        draw();
        return false;
    };
    canvas.addEventListener('mousedown', setPosition);

    canvas.addEventListener('mousemove', (e) => {
        if (userCanvasState.currentTool === TOOLS.HAND && e.buttons === 1) {
            const [x, y] = [e.clientX, e.clientY];

            if (userCanvasState.cellClickedOn) {
                const [row, col] = userCanvasState.cellClickedOn;
                const cx = x - (col > 0 ? col - 1 : col) * DIMENSIONS.STEP;
                const cy = y - (row > 0 ? row - 1 : row) * DIMENSIONS.STEP;
                changeCenter(cx, cy);
            } else {
                userCanvasState.cellClickedOn = getRowColPair(e);
            }
        } else {
            userCanvasState.cellClickedOn = null;
        }
        const [x, y] = [e.clientX, e.clientY];
        drawGridlines(ctx, x, y);

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
        for (const element of localCollectiveState.positions) {
            if (row === element.position.row &&
                col === element.position.col) {
                return user.id === element.user.id 
                        ? CELL_OWNERSHIP.ME
                        : CELL_OWNERSHIP.OTHERS
            }
        }
        return CELL_OWNERSHIP.NOONE
    }

    function setPosition(e) {
        // if not left or scroll button click, stop
        if (e.buttons !== 1 && e.buttons !== 4) return;

        const [row, col] = getRowColPair(e);

        if (e.buttons === 1 && !e.ctrlKey) {
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
        ctx.clearRect(0, 0, DIMENSIONS.WIDTH, DIMENSIONS.HEIGHT);
        // re-draw
        drawGridlines(ctx, userCanvasState.currentCenter[0], userCanvasState.currentCenter[1]);
        for (let i = 0; i < localCollectiveState.positions.length; i++) {
            getShape(localCollectiveState.positions[i].shapeName)?.draw(
                ctx,
                localCollectiveState.positions[i].position,
                userCanvasState.currentCenter,
                {
                    color: localCollectiveState.positions[i].color,
                    style: localCollectiveState.positions[i].style
                }
            )
        }

        if (userCanvasState.highlightedCell) {
            userCanvasState.currentShape.draw(ctx, userCanvasState.highlightedCell, userCanvasState.currentCenter, { style: "dashed" })
        }
    }
})();