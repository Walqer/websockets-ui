import { GameInfo, Ship } from '../handlers/handleAddShips'
import { turn } from './turn'
export const startGame = (game: GameInfo, games: Map<string, GameInfo>) => {
    game.firstPlayer.ws.send(
        createStartGameResponse(
            game.gameId,
            game.firstPlayer.ships,
            game.firstPlayer.indexPlayer
        )
    )

    game.secondPlayer!.ws.send(
        createStartGameResponse(
            game.gameId,
            game.secondPlayer!.ships,
            game.secondPlayer!.indexPlayer
        )
    )
    turn(game.gameId, games, 'firstPlayer')
}

const createStartGameResponse = (
    gameId: string,
    ships: Ship[],
    indexPlayer: string
) => {
    return JSON.stringify({
        type: 'start_game',
        data: JSON.stringify({
            gameId,
            ships,
            indexPlayer,
        }),
        id: 0,
    })
}
