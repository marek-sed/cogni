import {createSession} from '../cognito.js';

export default function(req, res) {
  const session = req.body;
  console.log('joining game ', session);
  createSession(session);
  res.status(200).end();
}
