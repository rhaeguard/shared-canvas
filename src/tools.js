import { CURSORS, STEP } from "./constants"

export const TOOLS = {
    BRUSH: {
        value: "brush",
        // handle returns an array of 2 elements [didModify, modifiedState]
        handle: (row, col, user, { shapeName, color, style }, localState, cellAvailability) => {
            if (cellAvailability === CELL_OWNERSHIP.NOONE) {
                localState.positions.push({
                    user: user,
                    color: color,
                    shapeName: shapeName,
                    style: style,
                    position: {
                        row, col
                    }
                })
                return [true, localState]
            } else if (cellAvailability === CELL_OWNERSHIP.ME) {
                const index = localState.positions.findIndex(element => row === element.position.row && col === element.position.col)
                localState.positions[index] = {
                    user: user,
                    color: color,
                    shapeName: shapeName,
                    style: style,
                    position: {
                        row, col
                    }
                }
            }
            return [false, localState]
        },
        cursorUrl: CURSORS.BRUSH
    },
    ERASER: {
        value: "eraser",
        handle: (row, col, user, { shapeName, color, style }, localState, cellAvailability) => {
            if (cellAvailability === CELL_OWNERSHIP.ME) {
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
    getTriangleType: (typeName) => {
        switch(typeName) {
            case "acbl": return TRIANGLE.ACUTE_BL
            case "acbr": return TRIANGLE.ACUTE_BR
            case "actl": return TRIANGLE.ACUTE_TL
            case "actr": return TRIANGLE.ACUTE_TR
            default: return null
        }
    },
    ACUTE_BL: {
        value: "acbl",
        handle: (ctx, topLeftX, topLeftY) => {
            ctx.moveTo(topLeftX, topLeftY);
            ctx.lineTo(topLeftX, topLeftY + STEP);
            ctx.lineTo(topLeftX + STEP, topLeftY + STEP);
        }
    },
    ACUTE_BR: {
        value: "acbr",
        handle: (ctx, topLeftX, topLeftY) => {
            ctx.moveTo(topLeftX, topLeftY + STEP);
            ctx.lineTo(topLeftX + STEP, topLeftY + STEP);
            ctx.lineTo(topLeftX + STEP, topLeftY);
        }
    },
    ACUTE_TL: {
        value: "actl",
        handle: (ctx, topLeftX, topLeftY) => {
            ctx.moveTo(topLeftX, topLeftY);
            ctx.lineTo(topLeftX, topLeftY + STEP);
            ctx.lineTo(topLeftX + STEP, topLeftY);
        }
    },
    ACUTE_TR: {
        value: "actr",
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
        getShape: (shapeName) => {
            if (!shapeName || shapeName !== "circle") return null
            return BRUSH_SHAPES.CIRCLE;
        },
        draw: (ctx, coords, center, options) => {
            const { row, col } = coords;

            const [cx, cy] = center;
            const x = cx + (col > 0 ? col - 1 : col) * STEP + STEP / 2;
            const y = cy + (row > 0 ? row - 1 : row) * STEP + STEP / 2;
            const radius = STEP / 2;

            if (!options.style || options.style === "fill") {
                ctx.fillStyle = options.color ?? "black";
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, 2 * Math.PI);
                ctx.fill();
            } else {
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
        getShape: (shapeName) => {
            if (!shapeName || shapeName !== "square") return null
            return BRUSH_SHAPES.SQUARE;
        },
        draw: (ctx, coords, center, options) => {
            const { row, col } = coords;
            const [cx, cy] = center;
            if (!options.style || options.style === "fill") {
                ctx.fillStyle = options.color ?? "black";
                const x = cx + (col > 0 ? col - 1 : col) * STEP;
                const y = cy + (row > 0 ? row - 1 : row) * STEP;
                ctx.fillRect(x, y, STEP, STEP);
            } else {
                if (options.style === "dashed") {
                    ctx.setLineDash([7, 3]);
                } else {
                    ctx.setLineDash([])
                }
                ctx.strokeStyle = options.color ?? "black";
                const x = cx + (col > 0 ? col - 1 : col) * STEP;
                const y = cy + (row > 0 ? row - 1 : row) * STEP;
                ctx.strokeRect(x, y, STEP, STEP);
            }
        }
    },
    TRIANGLE: {
        getShape: (shapeName) => {
            if (!shapeName) return null

            const typeName = shapeName.replace("triangle-", "");
            const type = TRIANGLE.getTriangleType(typeName);
            return BRUSH_SHAPES.TRIANGLE.new(type);
        },
        new: (triangleType) => {
            return {
                value: `triangle-${triangleType.value}`,
                draw: (ctx, coords, center, options) => {
                    const { row, col } = coords;
                    const [cx, cy] = center;
                    const topLeftX = cx + (col > 0 ? col - 1 : col) * STEP;
                    const topLeftY = cy + (row > 0 ? row - 1 : row) * STEP;

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

}

export const CELL_OWNERSHIP = {
    NOONE: "NOONE",
    OTHERS: "OTHERS",
    ME: "ME"
}