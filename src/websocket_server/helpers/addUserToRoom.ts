import ws from 'ws'
import { Player } from '../types/messageTypes'
import { Room } from './updateRoomForAll'
interface addUsertoRoomParams {
    ws: ws
    rooms: Map<string, Room>
    users: Map<Player['name'], Player>
    wsToPlayerName: Map<ws, Player['name']>
    indexRoom: string
}

export const addUserToRoom = ({
    ws,
    rooms,
    users,
    wsToPlayerName,
    indexRoom,
}: addUsertoRoomParams) => {
    const player = users.get(wsToPlayerName.get(ws)!) as Player
    const room = rooms.get(indexRoom) as Room
    if (room.roomUsers.find((user) => user.name === player.name)) return
    room.roomUsers.push({ name: player.name, index: player.ws! })
    rooms.set(indexRoom, room)
}
