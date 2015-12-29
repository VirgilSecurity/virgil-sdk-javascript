import _ from 'lodash';

window.Module = window.Module || {};
window.Module.onRuntimeInitialized = _.noop;

require('script!./virgil-emscripten');

export default window.Module;
