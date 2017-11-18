import React, { Component } from 'react';
// import io from 'socket.io-client/dist/socket.io.js';
// import { throttle } from 'lodash';

// import Button from '../globals/Button';

class SlingUsers extends Component {
  state = { }

  colors=["#00FFFF","#FFFF00","#DDA0DD", "#FA8072", "#7CFC00", "#FF7F50", "#00FFFF","#FFFF00","#DDA0DD", "#FA8072", "#7CFC00", "#FF7F50"];

  render() {
    // console.log('inside sling users', this.props)
    const {users} = this.props
    return (
      <div>
        <h3>Collaborators: 
        
        {users.map(user => user )}</h3>
      </div>
    );
  }

}

export default SlingUsers
