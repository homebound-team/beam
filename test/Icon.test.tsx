import React from 'react';
import * as ReactDOM from 'react-dom';
import { Icon } from '../dist';

describe('Icon', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Icon icon="arrowLeft" />, div);
    ReactDOM.unmountComponentAtNode(div);
  });
});
