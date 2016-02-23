import React                from 'react';
import { render }           from 'react-dom';
import { Router, browserHistory } from 'react-router';
import { syncHistory, routeReducer } from 'react-router-redux';
import createLogger         from 'redux-logger';
import { Provider }         from 'react-redux';
import * as reducers        from 'reducers';
import routes               from 'routes';
import thunk                from 'redux-thunk';
import { createStore,
         combineReducers,
         applyMiddleware }  from 'redux';
import './reset.css';
import './style.css';
import './game.css';
import './progress.css';
import 'rc-slider/assets/index.css';


const logger = createLogger();
const reduxRouterMiddleware = syncHistory(browserHistory);
const reducer = combineReducers(reducers, routeReducer);
var createStoreWithMiddleware = applyMiddleware(
  reduxRouterMiddleware, logger, thunk)(createStore);
const store   = createStoreWithMiddleware(reducer);

console.log('reducer', reducers);
render(
  <Provider store={store}>
    <Router children={routes} history={browserHistory} />
  </Provider>,
  document.getElementById('mount')
);
