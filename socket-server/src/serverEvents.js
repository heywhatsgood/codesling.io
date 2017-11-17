import { debounce } from 'lodash';

/**
 *
 *  Server emissions
 *
 */
export const serverInitialState = ({ client, room }) => {
  client.emit('server.initialState', {
    id: client.id,
    text: room.get('text'),
  });
};

export const serverChanged = ({ io, client, room }, metadata) => {
  const roomId = room.get('id');
  client
    .to(roomId)
    .emit('server.changed', { metadata });
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
    .emit('server.leave');
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
