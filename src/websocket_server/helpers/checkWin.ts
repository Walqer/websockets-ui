import { addShipsData } from '../handlers/handleAddShips'
import { getShipPositions } from '../handlers/handleAttack'

export function checkWin(board: addShipsData): boolean {
    return board.ships.every((ship) => {
        const shipPositions = getShipPositions(ship)
        return shipPositions.every((pos) => board.hits.has(`${pos.x},${pos.y}`))
    })
}
