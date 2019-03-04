const crypto = require('crypto');
const express = require('express');
const bodyParser = require('body-parser');
const { CronJob } = require('cron');
const MemoryClient = require('./memoryclient');

// dotenv
require('dotenv').config();

// Datastore
let client;
if (process.env.REDIS_URL) {
  // Redis in progress
} else {
  client = new MemoryClient();
}

// AppSetting
const Gamekey = process.env.GAMEKEY || '';
const Secretkey = process.env.SERCETKEY || '';
const RoomDestorySec = process.env.ROOMTIME || 1200;

// Security
function calcHash(data, hash) {
  if (Secretkey === '') {
    return true;
  }
  let result;
  crypto.pbkdf2(data, Secretkey, 1000, 256, 'sha256', (err, key) => {
    if (!err) {
      if (key === hash) {
        result = true;
      } else {
        result = false;
      }
    } else {
      result = false;
    }
  });
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

// Express GET
app.get(`/${Gamekey}`, (req, res) => {
  res.send(`Welcome to UniP2P Matching Server GameID:${Gamekey}`);
});

app.get(`/${Gamekey}/status`, (req, res) => {
  res.sendStatus(200);
});

function refreshRooms() {
  this.roomsCache = client.getRooms();
}

const roomsjob = new CronJob({
  cronTime: '*/3 * * * * *',
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


app.get(`/${Gamekey}/rooms`, (req, res, next) => {
  (async () => {
    res.send(this.roomsCache);
  })().catch(next);
});

app.get(`/${Gamekey}/rooms/count`, (req, res, next) => {
  (async () => {
    if (this.roomsCache === undefined) {
      res.send({ count: 0 });
    } else {
      res.send({ count: this.roomsCache.length });
    }
  })().catch(next);
});

app.post(`/${Gamekey}/rooms/create`, async (req, res, next) => {
  (async () => {
    const { peerid } = req.body;
    const { roomname } = req.body;
    const { maxmember } = req.body;
    const { hash } = req.body;

    if (calcHash(`${peerid}${roomname}${maxmember}`, hash)) {
      const result = await client.createRoom(peerid, roomname, maxmember);
      res.send(result);
    } else {
      res.sendStatus(403);
    }
  })().catch(next);
});

app.post(`/${Gamekey}/rooms/join`, (req, res, next) => {
  (async () => {
    const { peerid } = req.body;
    const { roomid } = req.body;
    const { IPEndPoint } = req.body;
    const { hash } = req.body;

    if (calcHash(`${peerid}${roomid}${IPEndPoint}`, hash)) {
      const result = await client.joinRoom(peerid, roomid, IPEndPoint);
      res.send(result);
    } else {
      res.sendStatus(403);
    }
  })().catch(next);
});

app.post(`/${Gamekey}/rooms/joinramdom`, (req, res, next) => {
  (async () => {
    const { peerid } = req.body;
    const { IPEndPoint } = req.body;
    const { hash } = req.body;

    if (calcHash(`${peerid}${IPEndPoint}`, hash)) {
      const result = await client.joinRandomRoom(peerid, IPEndPoint);
      res.send(result);
    } else {
      res.sendStatus(403);
    }
  })().catch(next);
});

app.post(`/${Gamekey}/rooms/check`, (req, res, next) => {
  (async () => {
    const { peerid } = req.body;
    const { roomid } = req.body;
    const { hash } = req.body;

    if (calcHash(`${peerid}${roomid}`, hash)) {
      const result = await client.checkRoom(peerid, roomid);
      res.send(result);
    } else {
      res.sendStatus(403);
    }
  })().catch(next);
});

app.post(`/${Gamekey}/rooms/close`, (req, res, next) => {
  (async () => {
    const { peerid } = req.body;
    const { roomid } = req.body;
    const { token } = req.body;
    const { hash } = req.body;

    if (calcHash(`${peerid}${roomid}${token}`, hash)) {
      const result = await client.closeRoom(peerid, roomid, token);
      res.send(result);
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
