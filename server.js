'use strict';

const isDevelopmentMode = true;

const express = require('express');
const https = require('https');
const http = require('http');
const socketIO = require('socket.io');
const favicon = require('serve-favicon');
const Game = require('./lib/Game.js');
const fs = require('fs');

const app = express();

let server = null;
let PORT_NO = null;
if( isDevelopmentMode ) {
  server = http.createServer( app );
  PORT_NO = 8000;
} else {
  const option = {
    key: fs.readFileSync('/etc/letsencrypt/live/tankbattleroyale.net/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/tankbattleroyale.net/cert.pem'),
    ca: fs.readFileSync('/etc/letsencrypt/live/tankbattleroyale.net/chain.pem')
  }
  server = https.createServer(option, app);
  PORT_NO = 443;
}

const io = socketIO( server );
PORT_NO = process.env.PORT || PORT_NO;

const game = new Game();
game.start( io )

app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(express.static( __dirname + '/public'));

server.listen(
    PORT_NO,
    () => {
	      if(!isDevelopmentMode) process.setuid(1001);
        console.log('Starting server on port %d', PORT_NO);
    }
);
