const makeConfig = require('./makeConfig');

const port = !Number.isNaN(Number(process.env.PORT)) ? parseInt(process.env.PORT, 10) : 3022;

const config = makeConfig(port, __dirname, 'welogix');
config.set('vendor_dependencies', [
  'babel-polyfill', // TODO https://github.com/ant-design/ant-design/issues/3400
  'antd',
  'react',
  'react-dom',
  'react-intl',
  'react-redux',
  'react-router',
  'redux',
  'serialize-javascript',
  'superagent',
  'moment',
  'bizcharts',
  'braft-editor',
  'browser-audio',
  'codemirror',
  'echarts',
  'currency-formatter',
  'detect-browser',
  'jsbarcode',
  'socket.io-client',
  'xlsx',
  'file-saver',
  'immutability-helper',
  'rc-queue-anim',
  'rc-tween-one',
  'react-codemirror2',
  'react-dnd',
  'react-dnd-html5-backend',
  'react-fittext',
  'react-resizable',
]);

module.exports = config;
