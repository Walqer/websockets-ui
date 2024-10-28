import { Position } from '../handlers/handleAddShips'

export function generateRandomPosition(hittedPositions: Set<string>): Position {
    let x, y
    let positionKey

    do {
        x = Math.floor(Math.random() * 10)
        y = Math.floor(Math.random() * 10)
        positionKey = `${x},${y}`
    } while (hittedPositions.has(positionKey))
    return { x, y }
}
