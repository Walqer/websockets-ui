import { randomUUID } from 'node:crypto'
import { WebSocketServer } from 'ws'
import { Player } from '../types/messageTypes'
import ws from 'ws'
const createUpdateRoomResponse = (rooms: Room[]) => {
    return JSON.stringify({
        type: 'update_room',
        data: JSON.stringify(rooms),
        id: 0,
    })
}
export const createRoom = (
    ws: ws,
    rooms: Map<string, Room>,
    users: Map<Player['name'], Player>,
    wsToPlayerName: Map<ws, Player['name']>
) => {
    const playerName = wsToPlayerName.get(ws) as string
    const player = users.get(playerName) as Player
    if (player.hasOwnRoom) return
    const roomId = randomUUID()
    rooms.set(roomId, {
        roomId,
        roomUsers: [{ name: player.name, index: player.ws! }],
    })
    player.hasOwnRoom = true
}
export const updateRoomForAll = (wss: WebSocketServer, rooms: Room[]) => {
    const response = createUpdateRoomResponse(rooms)
    wss.clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
            client.send(response)
        }
    })
}

interface RoomUser {
    name: string
    index: ws
}

export interface Room {
    roomId: number | string
    roomUsers: RoomUser[]
}
