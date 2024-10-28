import ws from 'ws'
import { startGame } from '../helpers/startGame'
export const handleAddShips = (
    data: string,
    games: Map<string, GameInfo>,
    ws: ws
) => {
    const gameData = JSON.parse(data) as addShipsData
    gameData.ws = ws
    gameData.hits = new Set()
    if (games.has(gameData.gameId)) {
        const game = games.get(gameData.gameId) as GameInfo
        game.secondPlayer = gameData
        games.set(gameData.gameId, game)
    } else {
        games.set(gameData.gameId, {
            gameId: gameData.gameId,
            firstPlayer: gameData,
            secondPlayer: null,
            turnOwner: 'firstPlayer',
        })
    }
    const game = games.get(gameData.gameId) as GameInfo
    if (game.firstPlayer && game.secondPlayer) {
        startGame(game, games)
    }
}

export interface GameInfo {
    gameId: string
    turnOwner: 'firstPlayer' | 'secondPlayer'
    firstPlayer: addShipsData
    secondPlayer: addShipsData | null
}
export interface addShipsData {
    gameId: string
    ws: ws
    ships: Ship[]
    indexPlayer: string
    hits: Set<string>
}

export interface Ship {
    position: Position
    direction: boolean
    length: number
    type: 'small' | 'medium' | 'large' | 'huge'
}

export interface Position {
    x: number
    y: number
}
