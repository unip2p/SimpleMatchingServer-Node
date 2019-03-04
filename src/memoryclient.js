const uuid = require('node-uuid');
require('dotenv').config();

module.exports = class MemoryClient {
  constructor() {
    this.RoomDatabase = null;
  }

  async createRoom(peerid, roomname, maxmember) {
    const roomid = uuid.v4();
    const token = uuid.v4().split('-').join('');
    const room = {
      roomid,
      roomname,
      hostpeerid: peerid,
      hosttoken: token,
      maxmember,
      peers: [{
        id: '',
        ip: '',
      }],
      isclose: false,
    };
    this.RoomDatabase[roomid] = room;
    const obj = {
      roomid: room.roomid,
      token: room.hosttoken,
    };
    return obj;
  }

  async joinRoom(peerid, roomid, ip) {
    const room = this.RoomDatabase[roomid];

    if (room == null && room.isclose) {
      return (404);
    }
    if (room.peers.length >= room.maxmember) {
      return (202);
    }
    room.peers.push({ id: peerid, ip });
    const obj = {
      peers: room.peers,
    };
    return (obj);
  }

  async joinRandomRoom(peerid, ip) {
    const roomid = this.pickupRandomRoom();
    if (roomid === null) {
      return 404;
    }
    return this.joinRoom(peerid, this.pickupRandomRoom(), ip);
  }

  pickupRandomRoom() {
    const index = Math.floor(Math.random() * this.RoomDatabase.length);
    if (this.RoomDatabase[index].peers.length >= this.RoomDatabase[index].maxmember
    && !this.RoomDatabase[index].isclose) {
      return this.RoomDatabase[index].roomid;
    }
    return null;
  }

  async checkRoom(peerid, roomid) {
    const room = this.RoomDatabase[roomid];
    if (room == null) {
      return (404);
    } if (this.isJoinedPeer(peerid, roomid)) {
      const obj = {
        peers: room.peers,
        isclose: room.isclose,
      };
      return (obj);
    }
    return (404);
  }

  async closeRoom(peerid, roomid, token) {
    if (this.RoomDatabase[roomid].hostpeerid === peerid
     && this.RoomDatabase[roomid].hosttoken === token) {
      this.RoomDatabase[roomid].isclose = true;
      return 200;
    }
    return 203;
  }

  async isJoinedPeer(peerid, roomid) {
    const room = this.RoomDatabase[roomid];
    let result = false;
    room.peers.forEach((value) => {
      if (value.id === peerid) {
        result = true;
      }
    });
    return result;
  }

  async getRoomCount() {
    return { count: this.RoomDatabase.length };
  }

  async getRoomList() {
    let rooms;
    this.RoomDatabase.forEach((value) => {
      const obj = {
        roomid: value.roomid,
        roomname: value.roomname,
        maxmember: value.maxmember,
        currentmember: value.peers.length,
      };
      rooms.push(obj);
    });
    return (rooms);
  }
};
