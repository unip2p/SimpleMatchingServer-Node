const uuid = require('node-uuid');
require('dotenv').config();

module.exports = class MemoryClient {
  constructor() {
    this.RoomDatabase = {};
  }

  async createRoom(peerid, name, max, pubmeta) {
    const roomid = uuid.v4();
    const token = uuid.v4().split('-').join('');
    const room = {
      roomid,
      roomname: name,
      hostpeerid: peerid,
      hosttoken: token,
      maxmember: max,
      peers: [],
      isclose: false,
      sec: 0,
      publicmetadata: pubmeta,
    };
    this.RoomDatabase[roomid] = room;
    const obj = {
      roomid: room.roomid,
      token: room.hosttoken,
    };
    return obj;
  }

  async joinRoom(peerid, roomid, ip, meta) {
    const room = this.RoomDatabase[roomid];

    if (room == null || room === undefined || room.isclose) {
      return (404);
    }
    if (room.peers.length >= room.maxmember) {
      return (202);
    }
    const token = uuid.v4().split('-').join('');

    room.peers.push({
      id: peerid, ip, token, metadata: meta,
    });
    const obj = {
      roomid,
      peers: room.peers,
      token,
      publicmetadata: room.publicmetadata,
    };
    return (obj);
  }

  async joinRandomRoom(peerid, ip, metadata) {
    const roomid = this.pickupRandomRoom();
    if (roomid === null) {
      return 404;
    }
    return this.joinRoom(peerid, roomid, ip, metadata);
  }

  async checkRoom(peerid, roomid, token) {
    const room = this.RoomDatabase[roomid];
    if (room === undefined) {
      return (404);
    } if (this.isJoinedPeer(peerid, roomid, token)) {
      const peers = [];
      room.peers.forEach((value) => {
        const obj = { id: value.id, ip: value.ip };
        peers.push(obj);
      });
      const obj = {
        peers,
        isclose: room.isclose,
      };
      return (obj);
    }
    return (404);
  }

  async closeRoom(peerid, roomid, token) {
    if (this.RoomDatabase[roomid] === undefined) {
      return 404;
    }
    if (this.RoomDatabase[roomid].hostpeerid === peerid
     && this.RoomDatabase[roomid].hosttoken === token) {
      this.RoomDatabase[roomid].isclose = true;
      return 200;
    }
    return 203;
  }

  async isJoinedPeer(peerid, roomid, token) {
    const room = this.RoomDatabase[roomid];
    let result = false;
    room.peers.forEach((value) => {
      if (value.id === peerid && value.token === token) {
        result = true;
      }
    });

    return result;
  }

  async getRooms() {
    const rooms = [];
    Object.keys(this.RoomDatabase).forEach((key) => {
      const value = this.RoomDatabase[key];
      if (value.isclose === false) {
        const obj = {
          roomid: value.roomid,
          roomname: value.roomname,
          maxmember: value.maxmember,
          currentmember: value.peers.length || 0,
          publicmetadata: value.publicmetadata,
        };
        rooms.push(obj);
      }
    }, this.RoomDatabase);
    return (rooms);
  }

  pickupRandomRoom() {
    if (this.RoomDatabase.length === 0 || this.RoomDatabase === undefined) {
      return null;
    }
    while (this.RoomDatabase.length !== 0) {
      const index = Math.floor(Math.random() * this.RoomDatabase.length);
      const peercount = this.RoomDatabase[index].peers.length || 0;
      if (peercount >= this.RoomDatabase[index].maxmember && !this.RoomDatabase[index].isclose) {
        return this.RoomDatabase[index].roomid;
      }
    }
    return null;
  }

  tickRooms(destroySec) {
    Object.keys(this.RoomDatabase).forEach((key) => {
      this.RoomDatabase[key].sec += 1;
      if (this.RoomDatabase[key].sec >= destroySec) {
        delete this.RoomDatabase[key];
      }
    }, this.RoomDatabase);
  }
};
