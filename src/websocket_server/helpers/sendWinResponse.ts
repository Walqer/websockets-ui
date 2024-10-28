import ws from 'ws'
export const sendWinResponse = (winPlayer: string, wsList: ws[]) => {
    const response = {
        type: 'finish',
        data: JSON.stringify({ winPlayer }),
        id: 0,
    }
    wsList.forEach((ws) => {
        ws.send(JSON.stringify(response))
    })
}
