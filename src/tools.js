import { CURSORS, STEP } from "./constants"

export const TOOLS = {
    BRUSH: {
        value: "brush",
        // handle returns an array of 2 elements [didModify, modifiedState]
        handle: (row, col, user, {shape, color, style}, localState, isCellFree) => {
            if (isCellFree) {
                localState.positions.push({
                    user: user,
                    color: color,
                    shape: shape,
                    style: style,
                    position: {
                        row, col
                    }
                })
                return [true, localState]
            }
            return [false, localState]
        },
        cursorUrl: CURSORS.BRUSH
    },
    ERASER: {
        value: "eraser",
        handle: (row, col, user, {shape, color, style}, localState, isCellFree) => {
            if (isCellFree) {
                const index = localState.positions.findIndex(({ position }) => position.row === row && position.col === col)
                if (index > -1) {
                    localState.positions.splice(index, 1);
                    return [true, localState]
                }
            }
            return [false, localState]
        },
        cursorUrl: CURSORS.ERASER
    },
    getTool: (value) => {
        if (TOOLS.ERASER.value === value) return TOOLS.ERASER
        return TOOLS.BRUSH
    }
};

export const TRIANGLE = {
    ACUTE_BL: {
        handle: (ctx, topLeftX, topLeftY) => {
            ctx.moveTo(topLeftX, topLeftY);
            ctx.lineTo(topLeftX, topLeftY + STEP);
            ctx.lineTo(topLeftX + STEP, topLeftY + STEP);
        }
    },
    ACUTE_BR: {
        handle: (ctx, topLeftX, topLeftY) => {
            ctx.moveTo(topLeftX, topLeftY + STEP);
            ctx.lineTo(topLeftX + STEP, topLeftY + STEP);
            ctx.lineTo(topLeftX + STEP, topLeftY);
        }
    },
    ACUTE_TL: {
        handle: (ctx, topLeftX, topLeftY) => {
            ctx.moveTo(topLeftX, topLeftY);
            ctx.lineTo(topLeftX, topLeftY + STEP);
            ctx.lineTo(topLeftX + STEP, topLeftY);
        }
    },
    ACUTE_TR: {
        handle: (ctx, topLeftX, topLeftY) => {
            ctx.moveTo(topLeftX + STEP, topLeftY);
            ctx.lineTo(topLeftX + STEP, topLeftY + STEP);
            ctx.lineTo(topLeftX, topLeftY);
        }
    },
}

export const BRUSH_SHAPES = {

    CIRCLE: {
        value: "circle",
        draw: (ctx, coords, options) => {
            const { row, col } = coords;

            const x = col * STEP + STEP / 2;
            const y = row * STEP + STEP / 2;
            const radius = STEP / 2;

            if (!options.style || options.style === "fill") {
                ctx.fillStyle = options.color ?? "black";
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, 2 * Math.PI);
                ctx.fill();
            } else{
                if (options.style === "dashed") {
                    ctx.setLineDash([7, 3]);
                } else {
                    ctx.setLineDash([])
                }
                ctx.strokeStyle = options.color ?? "black";
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, 2 * Math.PI);
                ctx.stroke();
            }
        }
    },
    SQUARE: {
        value: "square",
        draw: (ctx, coords, options) => {
            const { row, col } = coords;
            if (!options.style || options.style === "fill") {
                ctx.fillStyle = options.color ?? "black";
                ctx.fillRect(col * STEP, row * STEP, STEP, STEP);
            } else {
                if (options.style === "dashed") {
                    ctx.setLineDash([7, 3]);
                } else {
                    ctx.setLineDash([])
                }
                ctx.strokeStyle = options.color ?? "black";
                ctx.strokeRect(col * STEP, row * STEP, STEP, STEP);
            }
        }
    },
    TRIANGLE: (triangleType) => {
        return {
            value: "triangle",
            draw: (ctx, coords, options) => {
                const { row, col } = coords;
                const topLeftX = col * STEP;
                const topLeftY = row * STEP;

                if (!options.style || options.style === "fill") {
                    ctx.fillStyle = options.color ?? "black";

                    ctx.beginPath();
                    triangleType.handle(ctx, topLeftX, topLeftY)
                    ctx.closePath();

                    ctx.fill();
                } else {
                    if (options.style === "dashed") {
                        ctx.setLineDash([7, 3]);
                    } else {
                        ctx.setLineDash([])
                    }
                    ctx.strokeStyle = options.color ?? "black";

                    ctx.beginPath();
                    triangleType.handle(ctx, topLeftX, topLeftY)
                    ctx.closePath();

                    ctx.stroke();
                }
            }
        }
    }

}