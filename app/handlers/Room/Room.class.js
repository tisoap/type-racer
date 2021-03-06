const moment = require('moment')

class Room {
  constructor (name) {
    this.name = name
    this.users = {}
    this.createdAt = moment()
    this.playing = false
    this.gameStart = undefined
    this.gameEnd = undefined
    this.gameDuration = moment.duration({minutes: 3, seconds: 1})
      .asMilliseconds()
  }

  get activeUsers () {
    return Object.values(this.users).length
  }

  get allUsersReady () {
    const allUsers = Object.values(this.users)
    if (allUsers.length < 1) return false

    const foundNonReadyUser = allUsers.find(user => user.ready === false)
    if (foundNonReadyUser) return false
    else return true
  }

  get activeSince () {
    const now = moment()
    return now.diff(this.createdAt, 'seconds')
  }

  get counter () {
    if (!this.gameEnd) return 0

    const now = moment()
    if (now.isAfter(this.gameEnd)) return 0

    return this.gameEnd.diff(now, 'seconds')
  }

  get usersKPM () {
    return Object.values(this.users).map(user => ({
      ...user,
      currentKPM: user.currentKPM,
      bestKPM: user.bestKPM
    }))
  }

  get keystrokes () {
    return Object.values(this.users).reduce((keystrokes, user) => {
      keystrokes = keystrokes + user.currentKPM
      return keystrokes
    }, 0)
  }

  get ranking () {
    return Object.values(this.users)
      .map(user => ({
        name: user.name,
        score: user.bestKPM
      }))
      .sort((a, b) => b.score - a.score)
  }

  get lastMinuteLead () {
    const users = Object.values(this.users)
      .map(user => ({
        name: user.name,
        score: user.currentKPM
      }))
      .sort((a, b) => b.score - a.score)
    const lead = users[0]
    return lead.name
  }

  get belowMean () {
    const users = Object.values(this.users)
    const total = users.reduce((total, user) => {
      total = total + user.bestKPM
      return total
    }, 0)

    const mean = (total / users.length)

    return users.reduce((bellowMean, user) => {
      if (user.bestKPM < mean) bellowMean = bellowMean + 1
      return bellowMean
    }, 0)
  }

  getUser (userName) {
    return this.users[userName]
  }

  addUser (user) {
    this.users[user.name] = user
  }

  removeUser (userName) {
    delete this.users[userName]
  }

  startGame (text) {
    this.text = text
    this.playing = true

    const now = moment()
    this.gameStart = now
    this.gameEnd = now.add(this.gameDuration)

    Object.values(this.users).forEach(user => { user.startedPlaying = now })
  }
}

module.exports = Room
