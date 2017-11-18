const startingText =
`function hello() {
  console.log('hello!');
}
hello();
`;

const highlight = [];
const userCount = 0;
/**
 *
 *  Rooms store
 *
 */
export default class Rooms {
  constructor(io) {
    this.io = io;
    this.store = new Map();
  }

  findOrCreate(roomId) {
    let room = this.store.get(roomId);
    if (!room) {
      room = new Map();
      room.set('id', roomId);
      room.set('text', startingText);
      room.set('highlight', highlight);
      room.set('userCount', userCount);
      this.store.set(roomId, room);
    }
    return room;
  }
}
