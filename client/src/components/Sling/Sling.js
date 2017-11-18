import React, { Component } from 'react';
import CodeMirror from 'react-codemirror2';
import io from 'socket.io-client/dist/socket.io.js';
import { throttle } from 'lodash';
import {Link} from 'react-router-dom'
import Button from '../globals/Button';
import StdOut from './StdOut';
import EditorHeader from './EditorHeader';

import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/base16-dark.css';
import './Sling.css';
import SlingUsers from './SlingUsers.js';


class Sling extends Component {
  state = {
    initialText: '',
    stdout: '',
    users:[],
    // userCount: 0
  }

  colors=["#00FFFF","#FFFF00","#DDA0DD", "#FA8072", "#7CFC00", "#FF7F50", "#00FFFF","#FFFF00","#DDA0DD", "#FA8072", "#7CFC00", "#FF7F50"];

  // <=== The below function is responsible for rendering highlights

  renderHL = () => {
    let cordarray = this.highlights;
    let hlColor = this.userColor
    console.log('at renderHL', hlColor)
    var marker = this.editor.markText({
      line: cordarray[0],
      ch: cordarray[1]
    }, {
      line: cordarray[2],
      ch: cordarray[3]
    }, {
      css: "background-color: " + hlColor
    });

    var marker2 = this.editor.markText({
      line: cordarray[2],
      ch: cordarray[3]
    }, {
      line: cordarray[0],
      ch: cordarray[1]
    }, {
      css: "background-color: "+ hlColor
    });

    function timeclear(){
      marker.clear();
      marker2.clear();
    }
    //This clears the highlight after two seconds.
    setTimeout(timeclear, 2000);
  }
    
      // <=== This function is responsible for getting your cordinates as you move
    
  getSelection = () => {
    var cords = [];
    let setColor = this.colors[this.state.userCount]
    var data = this.editor.doc.listSelections()
    cords.push(data[0].head.line);
    cords.push(data[0].head.ch);
    cords.push(data[0].anchor.line);
    cords.push(data[0].anchor.ch);
    // Uncommenting the following will log cordinates of your cursor constantly
    // console.log(cords)
  
    this.highlights = cords;
    
    this.socket.emit('client.highlight', {
      highlight: cords,
      userColor: setColor
    })

  }

  synced = true;
  highlighting = false;

  runCode = () => {
    this.socket.emit('client.run');
  }

  componentDidMount() {

    this.editor.on('cursorActivity', this.getSelection);

    this.socket = io(process.env.REACT_APP_SOCKET_SERVER_URL, {
      query: {
        roomId: this.props.slingId,
      }
    });

    this.socket.on('connect', () => {
      let newCount= this.state.userCount++;
      // this.setState({
      //   userCount: newCount
      // })
      console.log('at init', this.state)
      this.socket.emit('client.ready');
    });

    this.socket.on('server.initialState', ({ id, text: initialText, userCount }) => {
      console.log('at server init state', userCount)
      this.setState({ id, initialText, userCount });
  
      
    });

    this.socket.on('server.changed', ({ metadata }) => {
      const { from, to, text, origin } = metadata;
      this.synced = false;
      this.editor.replaceRange(
        text,
        from,
        to,
        origin
      );
    });

    this.socket.on('server.sync', ({ text, metadata, highlight }) => {
      this.synced = false;
      const cursorPosition = this.editor.getCursor();
      // console.log('text = ', text);
      console.log('highlight = ', highlight);
      // console.log('metadata = ', metadata);
      this.updateLine(text, metadata);
      this.editor.setCursor(cursorPosition);
    })

    // <=== This function is responsible for listening to changes in highlight

    this.socket.on('server.highlight', ({ highlight, userColor }) => {
      this.highlights = highlight
      this.userColor= userColor
      this.renderHL()
  
      console.log('after server highlight', this.highlights)
    });

    this.socket.on('server.run', ({ stdout }) => {
      this.setState({ stdout });
    });

    this.socket.on('server.run', ({ userCount }) => {
      this.setState({ userCount });
    });

    window.addEventListener('resize', this.setEditorSize);
  }
  
  componentWillUnmount() {
    window.removeEventListener('resize', this.setEditorSize);
  }

  updateLine(text, metadata) {
    const { from, to } = metadata;
    text = text.split('\n')[from.line].slice(0, from.ch);
    this.editor.replaceRange(text, { 
      line: from.line,
      ch: 0
    }, to);
  }

  addUser=()=>{
    let user= localStorage.username || 'anonymous'
    this.state.users.push(user)
  }

  handleChange = (editor, metadata, value) => {
    if (this.synced) {
      this.socket.emit('client.update', { 
        metadata: metadata,
        text: value,
      });
    } else {
      this.synced = !this.synced;
    }
  }

  leaveRoom = () => {
    // this.props.route
    this.socket.emit('client.disconnect')
  }

  setEditorSize = throttle(() => {
    this.editor.setSize(null, `${window.innerHeight - 80}px`);
  }, 100);

  initializeEditor = (editor) => {
    // give the component a reference to the CodeMirror instance
    this.editor = editor;
    this.setEditorSize();
    this.addUser();
  }

  render() {
    return (
      <div className="sling-container">
        <EditorHeader />
        <div className="code-editor-container">
          <CodeMirror
            editorDidMount={this.initializeEditor}
            value={this.state.initialText}
            options={{
              mode: 'javascript',
              lineNumbers: true,
              theme: 'base16-dark',
            }}
            onChange={this.handleChange}
          />
        </div>
        <div className="stdout-container">
        <SlingUsers users={ this.state.users}/>
          <Button
            className="run-btn"
            text="Run Code"
            backgroundColor="red"
            color="white"
            onClick={this.runCode}
          />
          <Button className="btn run-btn"
            text={<Link color="white" to="/">
            Leave Room
          </Link>}
            backgroundColor="white"
            color="white"
            onClick={this.leaveRoom}
            >
          {/* <span className="auth-link">
              <Link to="/auth/signup">
                Sign up
              </Link>
            </span> */}
          </Button>
          <StdOut 
            text={this.state.stdout}
          />
        </div>
      </div>
    );
  }
}

export default Sling;
