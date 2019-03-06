const uuid = require('node-uuid');
require('dotenv').config();

module.exports = class MemoryClient {
  constructor() {
    this.RoomDatabase = {};
  }

  async createRoom(peerid, roomname, maxmember, pubmeta, primeta) {
    const roomid = uuid.v4();
    const token = uuid.v4().split('-').join('');
    const room = {
      roomid,
      roomname,
      hostpeerid: peerid,
      hosttoken: token,
      maxmember,
      peers: [],
      isclose: false,
      sec: 0,
      publicmetadata: pubmeta,
      privatemetadata: primeta,
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

    if (room == null || room.isclose) {
      return (404);
    }
    if (room.peers.length >= room.maxmember) {
      return (202);
    }
    const token = uuid.v4().split('-').join('');

    room.peers.push({ id: peerid, ip, token });
    const obj = {
      roomid,
      peers: room.peers,
      token,
      publicmetadata: room.publicmetadata,
      privatemetadata: room.privatemetadata,
    };
    return (obj);
  }

  async joinRandomRoom(peerid, ip) {
    const roomid = this.pickupRandomRoom();
    if (roomid === null) {
      return 404;
    }
    return this.joinRoom(peerid, roomid, ip);
  }

  async checkRoom(peerid, roomid, token) {
    const room = this.RoomDatabase[roomid];
    if (room === undefined) {
      return (404);
    } if (this.isJoinedPeer(peerid, roomid, token)) {
      const peers = [];
      Object.keys(room.peers).forEach((key) => {
        const value = this.room.peers[key];
        const obj = { id: value.id, ip: value.ip };
        peers.push(obj);
      }, this.RoomDatabase);

      const obj = {
        peers,
        publicmetadata: room.publicmetadata,
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
    Object.keys(room.peers).some((key) => {
      const value = this.room.peers[key];
      if (value.id === peerid && value.token === token) {
        result = true;
        return true;
      }
    }, room.peers);

    return result;
  }

  async getRooms() {
    const rooms = [];
    Object.keys(this.RoomDatabase).forEach((key) => {
      const value = this.RoomDatabase[key];
      const obj = {
        roomid: value.roomid,
        roomname: value.roomname,
        maxmember: value.maxmember,
        currentmember: value.peers.length || 0,
        isclose: value.isclose,
      };
      rooms.push(obj);
    }, this.RoomDatabase);
    return (rooms);
  }

  pickupRandomRoom() {
    if (this.RoomDatabase.length === 0 || this.RoomDatabase.length === undefined) {
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
