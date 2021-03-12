import * as ReactDOM from 'react-dom';
import { Icon } from 'src/';

describe('Icon', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Icon icon="x" />, div);
    ReactDOM.unmountComponentAtNode(div);
  });
});
