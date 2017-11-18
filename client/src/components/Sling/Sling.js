import React, { Component } from 'react';
import CodeMirror from 'react-codemirror2';
import io from 'socket.io-client/dist/socket.io.js';
import { throttle } from 'lodash';

import Button from '../globals/Button';
import StdOut from './StdOut';
import EditorHeader from './EditorHeader';

import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/base16-dark.css';
import './Sling.css';

class Sling extends Component {
  state = {
    initialText: '',
    stdout: '',
    highlight: []
  }

  highlight=[1,2,1,4];

  synced = true;
  highlighting = false;

  runCode = () => {
    this.socket.emit('client.run');
  }

  componentDidMount() {
    this.socket = io(process.env.REACT_APP_SOCKET_SERVER_URL, {
      query: {
        roomId: this.props.slingId,
      }
    });

    this.socket.on('connect', () => {
      this.socket.emit('client.ready');
    });

    this.socket.on('server.initialState', ({ id, text: initialText }) => {
      this.setState({ id, initialText });
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

    this.socket.on('server.sync', ({ text, metadata }) => {
      this.synced = false;
      const cursorPosition = this.editor.getCursor();
      console.log('text = ', text);
      console.log('highlight = ');
      console.log('metadata = ', metadata);
      this.updateLine(text, metadata);
      this.editor.setCursor(cursorPosition);
    })

    /* ======= SOCKET LISTENING =======
    this.socket.on('server.highlight', ({ highlight }) => {
     
      console.log('after server highlight', { highlight })
    })*/

    this.socket.on('server.run', ({ stdout }) => {
      this.setState({ stdout });
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
/* SOCKET EMITTING HERE:
    console.log('function called here')
  this.socket.emit('client.highlight', {
    highlight
  })} */




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

  setEditorSize = throttle(() => {
    this.editor.setSize(null, `${window.innerHeight - 80}px`);
  }, 100);

  initializeEditor = (editor) => {
    // give the component a reference to the CodeMirror instance
    this.editor = editor;
    this.setEditorSize();
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
          <Button
            className="run-btn"
            text="Run Code"
            backgroundColor="red"
            color="white"
            onClick={this.runCode}
          />
          {/* <Button
            className="run-btn"
            text="HLTEST"
            backgroundColor="red"
            color="white"
            onClick={this.hlfunc}
          /> */}
          <StdOut 
            text={this.state.stdout}
          />
        </div>
      </div>
    );
  }
}

export default Sling;
