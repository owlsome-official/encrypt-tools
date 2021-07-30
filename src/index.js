import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';

import './index.css';

import App from './App';
import reportWebVitals from './reportWebVitals';
import { BASENAME } from './utils/constants';

ReactDOM.render(
  <BrowserRouter basename={BASENAME}>
    <React.StrictMode>
      <Switch>
        <Route path="/" exact>
          <Redirect to="/encrypt" />
        </Route>
        <Route path="/:mode" children={<App />} />
      </Switch>
    </React.StrictMode>
  </BrowserRouter>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
