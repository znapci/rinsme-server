const getDB = require('../util/db').getDB

class User {
  constructor (username, password) {
    this.username = username
    this.password = password
    this.sessions = []
    this.creationtime = Date.now()
  }

  save () {
    const db = getDB()
    return db.collection('users').insertOne(this)
  }

  findMatch () {
    const db = getDB()
    return db.collection('users').findOne({
      username: { $eq: this.username }
    }, {
      projection: {
        _id: 1
      }
    })
  }

  getUserCredentials () {
    const db = getDB()
    return db.collection('users').findOne({
      username: { $eq: this.username }
    }, {
      projection: {
        password: 1,
        sessions: 1
      }
    })
  }

  addSession (sessionId, prevSessions) {
    const updatedSessions = [...prevSessions, sessionId]
    const db = getDB()
    return db.collection('users').updateOne({
      username: { $eq: this.username }
    }, {
      $set: { sessions: updatedSessions }
    }
    )
  }

  removeSession (sessionId, userId) {
    const db = getDB()
    return db.collection('users').findOne({
      username: { $eq: userId }
    }, {
      projection: {
        _id: 0,
        sessions: 1
      }
    }).then(userCreds => {
      const updatedSessions = userCreds.sessions.filter(session => session !== sessionId)
      return db.collection('users').updateOne({
        username: { $eq: userId }
      }, {
        $set: { sessions: updatedSessions }
      }
      )
    }).catch(err => console.error(err))
  }

  getSessions (userId) {
    const db = getDB()
    return db.collection('users').findOne({
      username: { $eq: userId }
    }, {
      projection: {
        _id: 0,
        sessions: 1
      }
    })
  }

  setSocketId (socketId, userId) {
    const db = getDB()
    return db.collection('users').updateOne({
      username: { $eq: userId }
    }, {
      $set: { socketId }
    }
    )
  }

  getSocketId (userId) {
    const db = getDB()
    return db.collection('users').findOne({
      username: { $eq: userId }
    }, {
      projection: {
        _id: 0,
        socketId: 1
      }
    })
  }
}

module.exports = User
