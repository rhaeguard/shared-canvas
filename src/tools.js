import { CURSORS, DIMENSIONS } from "./constants"

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
    HAND: {
        value: "hand",
        handle: (row, col, user, { shapeName, color, style }, localState, cellAvailability) => {
            return [false, localState]
        },
        cursorUrl: CURSORS.HAND
    },
    getTool: (value) => {
        if (TOOLS.ERASER.value === value) return TOOLS.ERASER
        if (TOOLS.HAND.value === value) return TOOLS.HAND
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
            ctx.lineTo(topLeftX, topLeftY + DIMENSIONS.STEP);
            ctx.lineTo(topLeftX + DIMENSIONS.STEP, topLeftY + DIMENSIONS.STEP);
        }
    },
    ACUTE_BR: {
        value: "acbr",
        handle: (ctx, topLeftX, topLeftY) => {
            ctx.moveTo(topLeftX, topLeftY + DIMENSIONS.STEP);
            ctx.lineTo(topLeftX + DIMENSIONS.STEP, topLeftY + DIMENSIONS.STEP);
            ctx.lineTo(topLeftX + DIMENSIONS.STEP, topLeftY);
        }
    },
    ACUTE_TL: {
        value: "actl",
        handle: (ctx, topLeftX, topLeftY) => {
            ctx.moveTo(topLeftX, topLeftY);
            ctx.lineTo(topLeftX, topLeftY + DIMENSIONS.STEP);
            ctx.lineTo(topLeftX + DIMENSIONS.STEP, topLeftY);
        }
    },
    ACUTE_TR: {
        value: "actr",
        handle: (ctx, topLeftX, topLeftY) => {
            ctx.moveTo(topLeftX + DIMENSIONS.STEP, topLeftY);
            ctx.lineTo(topLeftX + DIMENSIONS.STEP, topLeftY + DIMENSIONS.STEP);
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
            const x = cx + (col > 0 ? col - 1 : col) * DIMENSIONS.STEP + DIMENSIONS.STEP / 2;
            const y = cy + (row > 0 ? row - 1 : row) * DIMENSIONS.STEP + DIMENSIONS.STEP / 2;
            const radius = DIMENSIONS.STEP / 2;

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
                const x = cx + (col > 0 ? col - 1 : col) * DIMENSIONS.STEP;
                const y = cy + (row > 0 ? row - 1 : row) * DIMENSIONS.STEP;
                ctx.fillRect(x, y, DIMENSIONS.STEP, DIMENSIONS.STEP);
            } else {
                if (options.style === "dashed") {
                    ctx.setLineDash([7, 3]);
                } else {
                    ctx.setLineDash([])
                }
                ctx.strokeStyle = options.color ?? "black";
                const x = cx + (col > 0 ? col - 1 : col) * DIMENSIONS.STEP;
                const y = cy + (row > 0 ? row - 1 : row) * DIMENSIONS.STEP;
                ctx.strokeRect(x, y, DIMENSIONS.STEP, DIMENSIONS.STEP);
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
                    const topLeftX = cx + (col > 0 ? col - 1 : col) * DIMENSIONS.STEP;
                    const topLeftY = cy + (row > 0 ? row - 1 : row) * DIMENSIONS.STEP;

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