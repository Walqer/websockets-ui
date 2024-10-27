import { GameInfo } from '../handlers/handleAddShips'
export const turn = (gameId: string, games: Map<string, GameInfo>) => {
    const game = games.get(gameId) as GameInfo
    const { firstPlayer, secondPlayer, turnOwner } = game
    const nextTurnOwner =
        turnOwner === 'firstPlayer' ? 'secondPlayer' : 'firstPlayer'

    const plyaers = [firstPlayer.ws, secondPlayer!.ws]
    games.set(gameId, {
        ...game,
        turnOwner: nextTurnOwner,
    })
    const turnResponse = JSON.stringify({
        type: 'turn',
        data: JSON.stringify({
            currentPlayer: game[nextTurnOwner]?.indexPlayer,
        }),
        id: 0,
    })
    plyaers.forEach((player) => {
        player.send(turnResponse)
    })
}
