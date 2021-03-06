import React from 'react'

const UserList = ({users, playing, gameEnded}) => {
  return users.map(user => renderUser(user))

  function renderUser (user) {
    return (
      <div className='row' key={user.id}>
        <div className='one-half column'>{user.name}</div>
        <div className='one-half column'>{renderUserInfo(user)}</div>
      </div>
    )
  }

  function renderUserInfo (user) {
    if (user.ready && !playing && !gameEnded) return <strong>READY!</strong>

    if (playing || gameEnded) {
      return (
        <div>
          <strong>KP/m:</strong>
          <br/>
          {user.currentKPM} (current)
          <br/>
          {user.bestKPM} (best)
        </div>
      )
    }
  }
}

export default UserList
