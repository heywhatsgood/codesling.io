import { debounce } from 'lodash';

/**
 *
 *  Server emissions
 *
 */
// let connections = 0
export const serverInitialState = ({ client, room }) => {
  client.emit('server.initialState', {
    id: client.id,
    text: room.get('text'),
    userCount: room.get('userCount'),
  });
};

export const serverChanged = ({ io, client, room }, metadata) => {
  const roomId = room.get('id');
  client
    .to(roomId)
    .emit('server.changed', { metadata });
};

export const serverHighlight = ({ io, client, room }, userColor) => {
 const roomId = room.get('id');
 const highlight = room.get('highlight')
  client
    .to(roomId)
    .emit('server.highlight', { highlight, userColor });
};

export const serverSync = debounce(({ io, client, room }, metadata) => {
  const roomId = room.get('id');
  const text = room.get('text');
 
  client
    .to(roomId)
    .emit('server.sync', { metadata, text });
}, 200);

export const serverLeave = ({ io, room }) => {
  io
    .in(room.get('id'))
    .emit('server.leave', {userCount: room.get('userCount')});
};

export const serverRun = ({ io, room }, stdout) => {
  io
    .in(room.get('id'))
    .emit('server.run', { stdout });
};

export const serverMessage = ({ io, room }, message) => {
  io
    .in(room.get('id'))
    .emit('server.message', message);
};
