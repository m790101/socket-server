const express = require('express')
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require('cors')
const app = express()
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'Post']
    }
})
const { v4: uuidv4 } = require('uuid');

app.use(cors())

let onlineUser = []

app.get('/', (req, res) => {
    res.send('hiiiiii')
})

io.on("connection", (socket) => {
    console.log('connect')
    socket.on('online', data => {
        if(onlineUser.indexOf(data.name)){
            onlineUser.filter(user=> user.name !== data.name)
        }
        onlineUser.push(data)
        console.log(onlineUser)
    })
    socket.emit('onlineUserNow', onlineUser)

    socket.on('onlineStatus', data => {
        socket.broadcast.emit('onlineStatusCheck', data)

    })
    socket.on('message', data => {
        socket.broadcast.emit('messageReceive', data)

    })


    socket.on('disconnect', () => {
        const user = onlineUser.find(user => user.id === socket.id)
        const data = {
            id: uuidv4(),
            text: `${user.name}已經下線`,
            name: user.name,
            account: user.account,
            type:1
        }
       socket.broadcast.emit('offLine', data)

        onlineUser = onlineUser.filter(user => user.id !== socket.id)

        console.log('left')
    })
});



httpServer.listen(3000, () => {
    console.log('server on local 3000')
})