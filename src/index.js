const express = require('express');
const bodyParser = require('body-parser');
const MemoryClient = require('./memoryclient');

// dotenv
require('dotenv').config();

// Datastore
let client;
if (process.env.REDIS_URL) {
  // Redis Now in Progress
} else {
  client = new MemoryClient();
}

// AppSetting
const Gamekey = process.env.GAMEKEY;
const Secretkey = process.env.SERCETKEY;


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
  res.send(200);
});

app.get(`/${Gamekey}/rooms`, (req, res, next) => {
  (async () => {
    const result = await client.getRooms();
    res.send(result);
  })().catch(next);
});

app.get(`/${Gamekey}/rooms/count`, (req, res, next) => {
  (async () => {
    const result = await client.getRoomCount();
    res.send((result));
  })().catch(next);
});

app.post(`/${Gamekey}/rooms/create`, async (req, res, next) => {
  (async () => {
    const { peerid } = req.body;
    const { roomname } = req.body;
    const { maxmember } = req.body;

    const result = await client.createRoom(peerid, roomname, maxmember);

    res.send(result);
  })().catch(next);
});

app.post(`/${Gamekey}/rooms/join`, (req, res, next) => {
  (async () => {
    const { peerid } = req.body;
    const { roomid } = req.body;
    const { IPEndPoint } = req.body;

    const result = await client.joinRoom(peerid, roomid, IPEndPoint);

    res.send(result);
  })().catch(next);
});

app.post(`/${Gamekey}/rooms/joinramdom`, (req, res, next) => {
  (async () => {
    const { peerid } = req.body;
    const { IPEndPoint } = req.body;

    const result = await client.joinRandomRoom(peerid, IPEndPoint);

    res.send(result);
  })().catch(next);
});

app.post(`/${Gamekey}/rooms/check`, (req, res, next) => {
  (async () => {
    const { peerid } = req.body;
    const { roomid } = req.body;

    const result = await client.checkRoom(peerid, roomid);

    res.send(result);
  })().catch(next);
});

app.post(`/${Gamekey}/rooms/close`, (req, res, next) => {
  (async () => {
    const { peerid } = req.body;
    const { roomid } = req.body;
    const { token } = req.body;

    const result = await client.closeRoom(peerid, roomid, token);

    res.send(result);
  })().catch(next);
});

app.listen(PORT, () => {
});

module.exports = app;
