import { Player } from '../types/messageTypes'
import ws from 'ws'
import { randomUUID } from 'node:crypto'

interface sendRegResponseData {
    name: string
    index: number | string
}
const sendRegResponse = (
    ws: ws,
    { name, index }: sendRegResponseData,
    error?: string
) => {
    ws.send(
        JSON.stringify({
            type: 'reg',
            data: JSON.stringify({
                name,
                index,
                error: Boolean(error),
                errorText: error,
            }),
            id: 0,
        })
    )
}
export const handleRegister = (
    playerData: Omit<Player, 'index' | 'isOnline'>,
    ws: ws,
    users: Map<Player['name'], Player>,
    wsToPlayerName: Map<ws, Player['name']>
) => {
    const { name, password } = playerData
    if (users.get(name)?.ws) {
        sendRegResponse(
            ws,
            { name, index: -1 },
            'User already exists and is online'
        )
    } else if (users.has(name)) {
        const PlayerDataFromBase = users.get(name) as Player
        if (PlayerDataFromBase.password === password) {
            users.set(name, { ...PlayerDataFromBase, ws: ws })
            wsToPlayerName.set(ws, name)
            sendRegResponse(ws, { name, index: PlayerDataFromBase.index })
        } else {
            sendRegResponse(ws, { name, index: -1 }, 'Wrong password')
        }
    } else {
        const newUser = {
            ...playerData,
            index: randomUUID(),
            isOnline: true,
            ws,
        }
        users.set(name, newUser)
        sendRegResponse(ws, { name, index: newUser.index })
        wsToPlayerName.set(ws, name)
    }

    ws.on('close', () => {
        const username = wsToPlayerName.get(ws) as string
        const PlayerDataFromBase = users.get(username) as Player
        wsToPlayerName.delete(ws)
        users.set(username, { ...PlayerDataFromBase, ws: null })
    })
}
