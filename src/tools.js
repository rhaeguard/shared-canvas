export const TOOLS = {
    BRUSH: {
        value: "brush",
        // handle returns an array of 2 elements [didModify, modifiedState]
        handle: (row, col, user, color, localState, isCellFree) => {
            if (isCellFree) {
                localState.positions.push({
                    user: user,
                    color: color,
                    position: {
                        row, col
                    }
                })
                return [true, localState]
            }
            return [false, localState]
        }
    },
    ERASER: {
        value: "eraser",
        handle: (row, col, user, color, localState, isCellFree) => {
            if (isCellFree) {
                const index = localState.positions.findIndex(({ position }) => position.row === row && position.col === col)
                if (index > -1) {
                    localState.positions.splice(index, 1);
                    return [true, localState]
                }
            }
            return [false, localState]
        }
    },
    getTool: (value) => {
        if (TOOLS.ERASER.value === value) return TOOLS.ERASER
        return TOOLS.BRUSH
    }
}