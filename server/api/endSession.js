import {endSession} from '../cognito.js';

export default function(req, res) {
  console.log('ending session ');
  endSession();
  res.status(200).end();
}
