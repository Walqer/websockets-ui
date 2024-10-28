import ws from 'ws'
import { Message, Player } from './types/messageTypes'
import { handleRegister } from './handlers/handleRegister'
import { createRoom, Room, updateRoomForAll } from './helpers/updateRoomForAll'
import {
    updateWinnersForAll,
    Winner,
    WinnerForResponse,
} from './helpers/updateWinnersForAll'
import { addUserToRoom } from './helpers/addUserToRoom'
import { createGame } from './helpers/createGame'
import { GameInfo, handleAddShips } from './handlers/handleAddShips'
import { AttackData, handleAttack } from './handlers/handleAttack'
import { generateRandomPosition } from './helpers/generateRandomPosition'

const webSocketServer = new ws.Server({ port: 3000 })

const users = new Map<Player['name'], Player>()
const wsToPlayerName = new Map<ws, Player['name']>()
const rooms = new Map<string, Room>()
const winners = new Map<string, Winner>()

const games = new Map<string, GameInfo>()
webSocketServer.on('connection', (ws, req) => {
    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message.toString()) as Message

        switch (parsedMessage.type) {
            case 'reg':
                const data = JSON.parse(parsedMessage.data)
                handleRegister(data, ws, users, wsToPlayerName)
                updateRoomForAll(webSocketServer, Array.from(rooms.values()))
                const winnersList: WinnerForResponse[] = Array.from(
                    Object.values(winners)
                ).map((player) => {
                    const playerWs = wsToPlayerName.get(player.ws) as string
                    const user = users.get(playerWs)
                    return {
                        name: user?.name as string,
                        wins: player.wins,
                    }
                })
                updateWinnersForAll(webSocketServer, winnersList)
                break
            case 'create_room':
                createRoom(ws, rooms, users, wsToPlayerName)
                updateRoomForAll(webSocketServer, Array.from(rooms.values()))
                break
            case 'add_user_to_room':
                const indexRoom = JSON.parse(parsedMessage.data).indexRoom
                addUserToRoom({
                    ws,
                    rooms,
                    users,
                    wsToPlayerName,
                    indexRoom,
                })
                updateRoomForAll(webSocketServer, Array.from(rooms.values()))
                createGame(users, rooms, indexRoom)
                updateRoomForAll(webSocketServer, Array.from(rooms.values()))
                break
            case 'add_ships':
                handleAddShips(parsedMessage.data, games, ws)
                break
            case 'attack':
                const attackRequestData = JSON.parse(
                    parsedMessage.data
                ) as AttackData
                const win = handleAttack(attackRequestData, games)
                if (win) {
                    const user = users.get(wsToPlayerName.get(ws)!) as Player
                    if (!winners.has(user.name)) {
                        const winner = winners.set(user.name, {
                            name: user.name!,
                            wins: 1,
                        })
                    } else {
                        const player = winners.get(user.name) as Winner
                        const winner = winners.set(user.name, {
                            ...player,
                            wins: player.wins + 1,
                        })
                    }
                    const winnersList: WinnerForResponse[] = Array.from(
                        Object.values(winners)
                    ).map((player) => {
                        const playerWs = wsToPlayerName.get(player.ws) as string
                        const user = users.get(playerWs)
                        return {
                            name: user?.name as string,
                            wins: player.wins,
                        }
                    })
                    updateWinnersForAll(webSocketServer, winnersList)
                }
                break
            case 'randomAttack':
                const randomAttackRequestData = JSON.parse(
                    parsedMessage.data
                ) as AttackData
                const game = games.get(randomAttackRequestData.gameId)
                const enemy =
                    randomAttackRequestData.indexPlayer === 'firstPlayer'
                        ? 'secondPlayer'
                        : 'firstPlayer'
                const randomPos = generateRandomPosition(game![enemy]!.hits)
                const randomAttacData = {
                    ...randomAttackRequestData,
                    ...randomPos,
                }
                handleAttack(randomAttacData, games)
                break
            case 'single_play':
                //not implemented
                break
            default:
                ws.close(500, 'Wrong message type')
        }
    })
})

webSocketServer.on('close', () => {
    console.log('Client disconnected')
})
