import { DIMENSIONS } from "./constants";

export function drawGridlines(ctx, cx, cy) {
    const {
        WIDTH,
        HEIGHT,
        STEP
    } = DIMENSIONS;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'black';
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx, 0);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx, HEIGHT);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(0, cy);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(WIDTH, cy);
    ctx.stroke();

    ctx.lineWidth = 1;

    ////////////////////////////////////////////////////
    ctx.strokeStyle = 'lightgrey';

    // Q1
    let x = cx;
    while (x >= 0) {
        ctx.beginPath();
        ctx.moveTo(x, cy);
        ctx.lineTo(x, 0);
        ctx.stroke();
        x -= STEP;
    }

    let y = cy;
    while (y >= 0) {
        ctx.beginPath();
        ctx.moveTo(cx, y);
        ctx.lineTo(0, y);
        ctx.stroke();
        y -= STEP;
    }

    // Q2
    x = cx;
    while (x <= WIDTH) {
        ctx.beginPath();
        ctx.moveTo(x, cy);
        ctx.lineTo(x, 0);
        ctx.stroke();
        x += STEP;
    }

    y = cy;
    while (y >= 0) {
        ctx.beginPath();
        ctx.moveTo(cx, y);
        ctx.lineTo(WIDTH, y);
        ctx.stroke();
        y -= STEP;
    }

    // Q3
    x = cx;
    while (x <= WIDTH) {
        ctx.beginPath();
        ctx.moveTo(x, cy);
        ctx.lineTo(x, HEIGHT);
        ctx.stroke();
        x += STEP;
    }

    y = cy;
    while (y <= HEIGHT) {
        ctx.beginPath();
        ctx.moveTo(cx, y);
        ctx.lineTo(WIDTH, y);
        ctx.stroke();
        y += STEP;
    }

    // Q4
    x = cx;
    while (x >= 0) {
        ctx.beginPath();
        ctx.moveTo(x, cy);
        ctx.lineTo(x, HEIGHT);
        ctx.stroke();
        x -= STEP;
    }

    y = cy;
    while (y <= HEIGHT) {
        ctx.beginPath();
        ctx.moveTo(cx, y);
        ctx.lineTo(0, y);
        ctx.stroke();
        y += STEP;
    }
}

export function drawGridlines2(ctx) {
    console.log(ctx);
    console.log(Math.floor(WIDTH / STEP), Math.floor(HEIGHT / STEP))
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'lightgrey';
    ctx.setLineDash([]);

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

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'black';

    let xi = Math.floor((HEIGHT / STEP) / 2);
    ctx.beginPath();
    ctx.moveTo(0, STEP * xi);
    ctx.lineTo(WIDTH, STEP * xi);
    ctx.stroke();

    xi = Math.floor((WIDTH / STEP) / 2);
    ctx.beginPath();
    ctx.moveTo(STEP * xi, 0);
    ctx.lineTo(STEP * xi, HEIGHT);
    ctx.stroke();
}