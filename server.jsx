import http                      from 'http';
import express                   from 'express';
import path                      from 'path';
import Server                    from 'socket.io';
import bodyParser                from 'body-parser';
import join                      from './server/api/join';
import createSession             from './server/api/createSession.js';
import {assignSocketTo, connectProgress, getSession, endSession}          from './server/cognito.js';

const app = express();

if (process.env.NODE_ENV !== 'production') {
  require('./webpack.dev').default(app);
}

app.use(express.static(path.join(__dirname, 'dist')));

app.use(bodyParser.json());

app.post('/join', join);
app.post('/createSession', createSession);
app.post('/endSession', endSession);
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
          <script>
            window.__SESSION_INFO__ = ${JSON.stringify(getSession())};
          </script>
          <script type="application/javascript" src="/bundle.js"></script>
        </body>
      </html>
      `;

    res.end(HTML);
  });

const httpServer = http.Server(app);
const io = new Server(httpServer);

io.on('connection', socket => {
  const {gameId, role} = socket.handshake.query;
  if(role === 'progress') {
    connectProgress(socket);
  }
  else {
    assignSocketTo(gameId, role, socket);
  }
});

export default httpServer;
