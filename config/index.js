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
]);

module.exports = config;
