import React, { Component } from 'react';
// import io from 'socket.io-client/dist/socket.io.js';
// import { throttle } from 'lodash';

// import Button from '../globals/Button';

class SlingUsers extends Component {
  state = { }



  render() {
    // console.log('inside sling users', this.props)
    const {users} = this.props
    return (
      <div>
        <h3>Collaborators: {users.map(user => user )}</h3>
      </div>
    );
  }

}

export default SlingUsers
