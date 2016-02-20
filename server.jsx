import http                      from 'http';
import express                   from 'express';
import path                      from 'path';
import Server                    from 'socket.io';
import bodyParser                from 'body-parser';
import join                      from './server/api/join';
import mongoose                  from 'mongoose';
import {assignSocketTo, connectProgress}          from './server/cognito.js';

const app = express();

if (process.env.NODE_ENV !== 'production') {
  require('./webpack.dev').default(app);
}

app.use(express.static(path.join(__dirname, 'dist')));

app.use(bodyParser.json());

app.post('/join', join);

app.use('/', (req, res) => {
      const HTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Cognito</title>
          <link href='https://fonts.googleapis.com/css?family=Roboto:700,500,400,300' rel='stylesheet' type='text/css'>
        </head>
        <body>
          <div id="mount"></div>
          <script type="application/javascript" src="/bundle.js"></script>
        </body>
      </html>
      `;

    res.end(HTML);
});

const httpServer = http.Server(app);
const io = new Server(httpServer);

/* mongoose.connect('mongodb://marek:cognito@ds055915.mongolab.com:55915/cognito'); */
mongoose.connect('mongodb://localhost/cognito', () => {
  console.log('connected to mongodb');
});
const db = mongoose.connection;

io.on('connection', socket => {
  const {gameId, role} = socket.handshake.query;
  if(role === 'progress') {
    connectProgress(socket);
  }
  else {
    assignSocketTo(gameId, role, socket, db);
  }
});

export default httpServer;
