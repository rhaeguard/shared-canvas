import { WIDTH, HEIGHT, STEP } from "./constants";

export function drawGridlines(ctx) {
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