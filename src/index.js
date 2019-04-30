const crypto = require('crypto');
const express = require('express');
const bodyParser = require('body-parser');
const { CronJob } = require('cron');
const MemoryClient = require('./memoryclient');

// dotenv
require('dotenv').config();

// datastore
let client;
if (process.env.REDIS_URL) {
  // Redis in progress
} else {
  client = new MemoryClient();
}

// App Setting
const Gamekey = process.env.GAMEKEY || undefined;
function GameKeyPath() {
  if (Gamekey === undefined) {
    return '';
  }

  return `/${Gamekey}`;
}

const Secretkey = process.env.SERCETKEY || '';
const RoomRefreshSec = process.env.ROOMREFRESHTIME || 3;
const RoomDestorySec = process.env.ROOMDESTORYTIME || 1200;

// Security
function calcHash(data, hash) {
  if (Secretkey === '') {
    return true;
  }
  let result;
  const pass = crypto.pbkdf2Sync(data, Secretkey, 1000, 32);
  const key = Buffer.from(pass).toString('base64');
  if (key === hash) {
    result = true;
  } else {
    result = false;
  }
  return result;
}

// Express Settings
const app = express();

const PORT = process.env.PORT || 3000;

// Accept CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// bodyParser
app.use(bodyParser.json());


app.get(`${GameKeyPath()}`, (req, res) => {
  res.send('Welcome to UniP2P Matching Server!!');
});

app.get(`${GameKeyPath()}/status`, (req, res) => {
  res.sendStatus(200);
});

let roomsCache = {};

function refreshRooms() {
  (async () => {
    roomsCache = await client.getRooms();
  })().catch();
}

const roomsjob = new CronJob({
  cronTime: `*/${RoomRefreshSec} * * * * *`,
  onTick() {
    refreshRooms();
  },
});

const roomcounterjob = new CronJob({
  cronTime: '* * * * * *',
  onTick() {
    client.tickRooms(RoomDestorySec);
  },
});

app.get(`${GameKeyPath()}/rooms`, (req, res, next) => {
  (async () => {
    if (roomsCache.length === 0) {
      res.sendStatus(404);
    } else {
      res.send(roomsCache);
    }
  })().catch(next);
});

app.post(`${GameKeyPath()}/rooms/create`, async (req, res, next) => {
  (async () => {
    const { peerid } = req.body;
    const { roomname } = req.body;
    const { maxmember } = req.body;
    const { metadata } = req.body;
    const { hash } = req.body;

    if (calcHash(`${peerid}${roomname}${maxmember}${metadata}`, hash)) {
      const result = await client.createRoom(peerid, roomname, maxmember, metadata);
      res.send(result);
    } else {
      res.sendStatus(403);
    }
  })().catch(next);
});

app.post(`${GameKeyPath()}/rooms/join`, (req, res, next) => {
  (async () => {
    const { peerid } = req.body;
    const { roomid } = req.body;
    const { ip } = req.body;
    const { localport } = req.body;
    const { metadata } = req.body;
    const { hash } = req.body;

    if (calcHash(`${peerid}${roomid}${ip}${localport}${metadata}`, hash)) {
      const result = await client.joinRoom(peerid, roomid, ip, localport, metadata);
      res.send(result);
    } else {
      res.sendStatus(403);
    }
  })().catch(next);
});

app.post(`${GameKeyPath()}/rooms/joinramdom`, (req, res, next) => {
  (async () => {
    const { peerid } = req.body;
    const { ip } = req.body;
    const { localport } = req.body;
    const { metadata } = req.body;
    const { hash } = req.body;

    if (calcHash(`${peerid}${ip}${localport}${metadata}`, hash)) {
      const result = await client.joinRandomRoom(peerid, ip, localport, metadata);
      res.send(result);
    } else {
      res.sendStatus(403);
    }
  })().catch(next);
});

app.post(`${GameKeyPath()}/rooms/check`, (req, res, next) => {
  (async () => {
    const { peerid } = req.body;
    const { roomid } = req.body;
    const { token } = req.body;
    const { hash } = req.body;

    if (calcHash(`${peerid}${roomid}${token}`, hash)) {
      const result = await client.checkRoom(peerid, roomid, token);
      res.send(result);
    } else {
      res.sendStatus(403);
    }
  })().catch(next);
});

app.post(`${GameKeyPath()}/rooms/close`, (req, res, next) => {
  (async () => {
    const { peerid } = req.body;
    const { roomid } = req.body;
    const { token } = req.body;
    const { hash } = req.body;

    if (calcHash(`${peerid}${
      roomid}${token}`, hash)) {
      const result = await client.closeRoom(peerid, roomid, token);
      res.sendStatus(result);
    } else {
      res.sendStatus(403);
    }
  })().catch(next);
});

app.listen(PORT, () => {
  refreshRooms();
  roomsjob.start();
  roomcounterjob.start();
});


module.exports = app;
