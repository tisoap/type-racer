import React, { Component } from 'react'
import {Socket} from '../../handlers'

import UserList from '../UserList'
import ReadyButton from '../ReadyButton'
import Timer from '../Timer'
import TypingGame from '../TypingGame'

const {
  GAME_START, ROOM_INFO, SERVER_ERROR, USER_JOIN, USER_LEAVE, USER_READY,
  KEYSTROKE, GAME_END
} = Socket.MESSAGE_TYPES

const TWO_SECONDS = 2000

export default class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      socket: window.io(),
      roomName: window.roomname,
      userName: window.username,
      ready: false,
      playing: false,
      gameEnd: undefined,
      users: [],
      text: '',
      keystrokes: 0,
      interval: undefined
    }
  }

  componentDidMount () {
    const {socket, roomName, userName} = this.state

    socket.on(USER_JOIN, this.handleSocketJoin.bind(this))
    socket.on(USER_LEAVE, this.handleSocketLeave.bind(this))
    socket.on(USER_READY, this.handleSocketReady.bind(this))
    socket.on(ROOM_INFO, this.handleSocketRoomInfo.bind(this))
    socket.on(GAME_START, this.handleSocketStart.bind(this))
    socket.on(GAME_END, this.handleSocketEnd.bind(this))
    socket.on(SERVER_ERROR, this.handleSocketError.bind(this))

    const joinData = {roomName, userName}
    console.log('Sending join data:', joinData)
    socket.emit(USER_JOIN, joinData)
  }

  componentWillUnmount () {
    clearInterval(this.state.interval)
  }

  render () {
    const {users, playing, ready, text, gameEnd} = this.state
    return (
      <div className='container'>
        <h1>Typeracer Like</h1>
        <div className='row'>
          <div className='four columns'>
            <UserList users={users} playing={playing}/>
          </div>
          <div className='six columns'>
            <ReadyButton ready={ready}
              onClick={() => this.handleClickReady()} />
            <Timer end={gameEnd}/>
          </div>
        </div>
        <div className='row'>
          <div className='twelve columns'>
            <TypingGame
              onKeystroke={() => this.handleKeystroke()}
              playing={playing}
              texts={text}/>
          </div>
        </div>
      </div>
    )
  }

  sendKeystrokes () {
    const {socket, keystrokes} = this.state
    if (keystrokes > 0) {
      socket.emit(KEYSTROKE, keystrokes)
      this.setState({keystrokes: 0})
    }
  }

  handleKeystroke () {
    const {keystrokes} = this.state
    this.setState({
      keystrokes: keystrokes + 1
    })
  }

  handleClickReady () {
    console.log(`Emitting ${USER_READY} to server`)
    const {socket} = this.state
    socket.emit(USER_READY)
  }

  handleSocketJoin (message) {
    const joinedUser = message.user
    console.log(`User ${joinedUser.name} joined.`)

    this.setState({
      users: [
        ...this.state.users,
        joinedUser
      ]
    })
  }

  handleSocketLeave (message) {
    const leavedUser = message.user
    console.log(`User ${leavedUser.name} leaved.`)

    const {users} = this.state
    const updatedUsers = users.filter(user => user.id !== leavedUser.id)
    this.setState({
      users: updatedUsers
    })
  }

  handleSocketReady (message) {
    const readyUser = message.user
    console.log(`User ${readyUser.name} is ready.`)

    const {users, userName} = this.state
    const user = users.find(user => user.id === readyUser.id)
    user.ready = true

    if (readyUser.name === userName) this.setState({ready: true})
    else this.forceUpdate()
  }

  handleSocketRoomInfo (message) {
    console.log('Room information:', message)
    const roomUsers = Object.values(message.users)
    this.setState({
      users: [
        ...this.state.users,
        ...roomUsers
      ]
    })
  }

  handleSocketStart (message) {
    console.log('Game started:', message)
    const {text, end} = message
    const gameEnd = end
    const interval = setInterval(this.sendKeystrokes.bind(this), TWO_SECONDS)
    this.setState({text, gameEnd, interval, playing: true})
  }

  handleSocketEnd (message) {
    console.log('Game ended:', message)
    clearInterval(this.state.interval)
  }

  handleSocketError (error) {
    // TODO: Display error message to user
    console.error('Server error:', error.message)
  }
}
