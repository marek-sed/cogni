import {registerPlayer} from '../cognito.js';

export default function(req, res) {
  const {firstName, surname, game, role} = req.body;
  const error = registerPlayer(game, role, firstName, surname);
  if(error) {
    res.status(400).send(error).end();
  }

  res.status(200).end();
}
