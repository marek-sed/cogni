import {createSession} from '../cognito.js';

export default function(req, res) {
  const session = req.body;
  console.log('joining game ', session);
  const result = createSession(session);
  res.status(200).send(result).end();
}
