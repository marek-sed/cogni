import {registerPlayer} from '../cognito.js';

export default function(req, res) {
  const {firstName, surname, game, role} = req.body;
  console.log('joining game ', game);
  const error = registerPlayer(game, role, firstName, surname);
  if(error) {
    res.status(400).send({error: error}).end();
  }

  res.status(200).end();
}
