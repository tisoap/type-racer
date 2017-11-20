const debug = require('debug')
const socketLog = debug('typeracer:socket')
const socketIO = require('socket.io')
const Room = require('./Room')
const User = require('./User')

let websocket
const rooms = {}

function startWebSocket (server) {
  websocket = socketIO(server)
  websocket.on('connection', handleConnection)
}

function handleConnection (socket) {
  socketLog('An user connected')

  socket.on('join', joinRoom)
  socket.on('disconnect', handleDisconnection)

  function joinRoom (message) {
    const {userName, roomName} = message
    socketLog(`User "${userName}" wants to join room "${roomName}"`)

    let room = rooms[roomName]
    if (!room) {
      socketLog(`Creating room "${roomName}"`)
      rooms[roomName] = new Room(roomName)
      room = rooms[roomName]
    }

    const userExists = room.getUser(userName)
    if (userExists) {
      socket.emit('join', {error: true, message: 'Username already taken'})
      socketLog(`User "${userName}" already exists in room "${roomName}"`)
      return
    }

    socketLog(`Creating user "${userName}"`)

    const newUser = new User({name: userName, id: socket.id, room: roomName})
    room.addUser(newUser)
    socket.user = newUser
    socket.join(roomName)
    socket.emit('join', {message: `You joined room ${roomName}`})
    websocket.to(roomName).emit('user', {action: 'join', user: userName})
    socketLog(`User "${userName}" joined room "${roomName}"`)
  }

  function handleDisconnection () {
    const userName = socket.user && socket.user.name
    const roomName = socket.user && socket.user.room
    const room = roomName && rooms[roomName]
    if (room && userName) {
      room.removeUser(userName)
      websocket.to(roomName).emit('user', {action: 'leave', user: userName})
      socketLog(`User "${userName}" was removed from room "${roomName}"`)
    }
    socketLog('User disconnected')
  }
}

module.exports = {
  startWebSocket
}
