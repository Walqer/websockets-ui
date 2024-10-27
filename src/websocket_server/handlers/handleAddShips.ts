import ws from 'ws'
import { startGame } from '../helpers/startGame'
export const handleAddShips = (
    data: string,
    games: Map<string, GameInfo>,
    ws: ws
) => {
    const gameData = JSON.parse(data) as addShipsData
    gameData.ws = ws
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
}

export interface Ship {
    position: {
        x: number
        y: number
    }
    direction: boolean
    length: number
    type: string
}
