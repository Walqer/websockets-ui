import { turn } from '../helpers/turn'
import { addShipsData, GameInfo, Position, Ship } from './handleAddShips'
import ws from 'ws'
export interface AttackData {
    x: number
    y: number
    gameId: string
    indexPlayer: string
}

export const handleAttack = (
    data: AttackData,
    games: Map<string, GameInfo>
) => {
    const isTurn = checkTurn(data.gameId, data.indexPlayer, games)
    if (!isTurn) return
    const game = games.get(data.gameId)
    if (!game) return
    const enemy =
        game!.turnOwner === 'firstPlayer' ? 'secondPlayer' : 'firstPlayer'
    const attackPos = { x: data.x, y: data.y }
    const enemyBoard = game[enemy] as addShipsData
    const repeatShot = enemyBoard.hits.has(`${data.x},${data.y}`) // Повторный выстрел
    if (repeatShot) return
    const { board, message } = checkAttack(enemyBoard, attackPos, game)
    games.set(data.gameId, { ...game, [enemy]: board })
    createAttackResponse({
        wsList: [game.firstPlayer.ws, game.secondPlayer!.ws],
        currentPlayer: data.indexPlayer,
        position: attackPos,
        status: message,
    })
    if (message !== 'miss') {
        turn(data.gameId, games, game.turnOwner)
    } else {
        turn(data.gameId, games, enemy)
    }
}

function checkTurn(
    gameId: string,
    indexPlayer: string,
    games: Map<string, GameInfo>
) {
    const game = games.get(gameId)
    return game![game!.turnOwner]?.indexPlayer === indexPlayer
}

function getShipPositions(ship: Ship) {
    const positions: Position[] = []
    for (let i = 0; i < ship.length; i++) {
        const pos = !ship.direction
            ? { x: ship.position.x + i, y: ship.position.y } // Вертикально
            : { x: ship.position.x, y: ship.position.y + i } // Горизонтально
        positions.push(pos)
    }
    return positions
}

function checkAttack(
    board: addShipsData,
    { x, y }: Position,
    game: GameInfo
): {
    board: addShipsData
    message: AttackStatus
} {
    const hitKey = `${x},${y}`
    if (board.hits.has(hitKey)) {
        return { board, message: 'miss' } // Повторный выстрел
    }
    for (const ship of board.ships) {
        const shipPositions = getShipPositions(ship)
        for (const position of shipPositions) {
            if (position.x === x && position.y === y) {
                board.hits.add(hitKey) // Записываем попадание

                // Проверка на уничтожение
                const allHits = shipPositions.every((pos) =>
                    board.hits.has(`${pos.x},${pos.y}`)
                )
                if (allHits) {
                    let aroundPositions = getSurroundingPositions(shipPositions)
                    aroundPositions.forEach(({ x, y }) => {
                        if (board.hits.has(`${x},${y}`)) return
                        board.hits.add(`${x},${y}`)
                        createAttackResponse({
                            currentPlayer: game[game.turnOwner]!.indexPlayer,
                            position: { x, y },
                            status: 'miss',
                            wsList: [
                                game.firstPlayer.ws,
                                game.secondPlayer!.ws,
                            ],
                        })
                    })
                }
                return { board, message: allHits ? 'killed' : 'shot' }
            }
        }
    }
    board.hits.add(hitKey)
    return { board, message: 'miss' }
}

interface AttackResponseArgs {
    position: Position
    currentPlayer: string
    status: AttackStatus
    wsList: ws[]
}

type AttackStatus = 'miss' | 'killed' | 'shot'

function createAttackResponse({
    currentPlayer,
    position,
    status,
    wsList,
}: AttackResponseArgs) {
    const res = {
        type: 'attack',
        data: JSON.stringify({
            position,
            currentPlayer,
            status,
        }),
        id: 0,
    }
    wsList.forEach((ws) => {
        ws.send(JSON.stringify(res))
    })
}

function getSurroundingPositions(shipPositions: Position[]): Position[] {
    const surrounding: Position[] = []

    shipPositions.forEach((pos) => {
        // Добавляем все позиции вокруг
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue // Пропускаем саму позицию
                surrounding.push({ x: pos.x + dx, y: pos.y + dy })
            }
        }
    })

    // Удаляем дубликаты, если они есть
    const uniquePositions = new Set(surrounding.map((p) => `${p.x},${p.y}`))
    return Array.from(uniquePositions).map((key) => {
        const [x, y] = key.split(',').map(Number)
        return { x, y }
    })
}
