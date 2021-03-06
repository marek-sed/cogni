import React                   from 'react';
import { Route, IndexRoute }   from 'react-router';
import App                     from 'components/index';
import Join                    from 'components/join';
import Game                    from 'components/game';
import Progress                from 'components/progress.react.js';
import Setup                   from 'components/setup.react.js';

export default (
  <Route name="app" component={App} path="/">
      <IndexRoute component={Join}/>
      <Route path="game" component={Game} />
      <Route path="progress" components={Progress} />
      <Route path="setup" components={Setup} />
  </Route>
);
