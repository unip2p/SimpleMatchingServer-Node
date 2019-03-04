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

// Express Settings
const app = express();

const PORT = process.env.PORT || 8080;

// Accept CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// bodyParser
app.use(bodyParser.json());

// Express GET
app.get('/', (req, res) => {
  res.send('Welcome to UniP2P Matching Server');
});

app.get('/status', (req, res) => {
  res.send(200);
});

app.post('/rooms', (req, res) => {
  const result = client.getRoomList();
  res.send(JSON.stringify(result));
});

app.get('/rooms/count', (req, res) => {
  const result = client.getRoomCount();
  res.json(JSON.stringify(result));
});

app.post('/rooms/create', (req, res) => {
  const { peerid } = req.body;
  const { roomname } = req.body;
  const { maxmember } = req.body;

  const result = client.createRoom(peerid, roomname, maxmember);

  res.send(JSON.stringify(result));
});

app.post('/rooms/join', (req, res) => {
  const { peerid } = req.body;
  const { roomid } = req.body;
  const { IPEndPoint } = req.body;

  const result = client.joinRoom(peerid, roomid, IPEndPoint);

  res.send(JSON.stringify(result));
});

app.post('/rooms/joinramdom', (req, res) => {
  const { peerid } = req.body;
  const { IPEndPoint } = req.body;

  const result = client.joinRandomRoom(peerid, IPEndPoint);

  res.send(JSON.stringify(result));
});

app.post('/rooms/check', (req, res) => {
  const { peerid } = req.body;
  const { roomid } = req.body;

  const result = client.checkRoom(peerid, roomid);

  res.send(JSON.stringify(result));
});

app.post('/rooms/close', (req, res) => {
  const { peerid } = req.body;
  const { roomid } = req.body;
  const { token } = req.body;

  const result = client.closeRoom(peerid, roomid, token);

  res.send(JSON.stringify(result));
});

app.listen(PORT, () => {
});
