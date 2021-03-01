import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Icon } from '../.';

const App = () => {
  return (
    <div>
      <Icon icon="bell" />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
