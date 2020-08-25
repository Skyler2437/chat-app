const v = require('voca')

const users = []

//removes a user
const removeUser = (id) => {
    const index = users.findIndex(user => user.id === id)

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}   


//adds a user
const addUser = ( {id, username, room} ) => {

    //clean the data
    username = v.capitalize(username.trim().toLowerCase())
    room = v.capitalize(room.trim().toLowerCase())

    //validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required.'
        }
    }

    //check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    //validate username
    if (existingUser) {
        return {
            error: 'Username is in use.'
        }
    }

    //store the user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

//gets user
const getUser = (id) => {
    return users.find(user => user.id === id)
}


//gets users in a room
const getUsersInRoom = (room) => {
    room = v.capitalize(room.trim().toLowerCase())
    const usersInRoom = users.filter(user => user.room === room)
    return usersInRoom 
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}