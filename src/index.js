const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')

const { generateMessage, generateLocation } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    
    //When a new connection is made to the server
    console.log('New Websocket Connection')

    socket.on('join', ( { username, room }, callback ) => {
        const { error, user } = addUser({ id: socket.id, username, room})

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        //When a user joins
        socket.emit('message', generateMessage('Chat App', 'Welcome!')) //message sent to joining user
        socket.broadcast.to(user.room).emit('message', generateMessage('Chat App', `${user.username} has joined!`)) //messages sent to other users
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        
        callback()
    })

    //When a user disconnects
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage('Chat App', `${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }

        
    }) 


    //receives the new message from the client, then emits it back as a message to the client
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)

        const filter = new Filter()

        if (filter.isProfane(message)) {
            socket.emit('message', generateMessage(user.username, 'Profanity is not allowed.'))
            return callback('Profanity is not allowed.')
            
        }
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    //receives the new location message from the client, then emits it back as a message to the client
    socket.on('location', (location, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocation(user.username, `https://google.com/maps/?q=${location.latitude},${location.longitude}`))
        callback()
    })

    
})

//When server starts up
server.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})