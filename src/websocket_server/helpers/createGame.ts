import { randomUUID } from 'crypto'
import { Room, updateRoomForAll } from './updateRoomForAll'
import { Player } from '../types/messageTypes'
export const createGame = (
    users: Map<Player['name'], Player>,
    rooms: Map<string, Room>,
    roomIndex: string
) => {
    const room = rooms.get(roomIndex) as Room
    const idGame = randomUUID()
    const roomFull = room.roomUsers.length === 2
    if (!roomFull) return
    room.roomUsers.forEach((player) => {
        const playerSocket = users.get(player.name)?.ws
        playerSocket?.send(createGameResponse(idGame))
    })
    rooms.delete(roomIndex)
}

const createGameResponse = (idGame: string) => {
    return JSON.stringify({
        type: 'create_game',
        data: JSON.stringify({
            idGame,
            idPlayer: randomUUID(),
        }),
        id: 0,
    })
}
