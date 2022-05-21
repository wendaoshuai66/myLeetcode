import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './app';

const Debug = () => {
    ReactDOM.render(<><App /></>, document.querySelector('.doc'))
}
export default Debug(); 