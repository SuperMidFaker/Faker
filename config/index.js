const makeConfig = require('./makeConfig');
const port = !isNaN(process.env.PORT) ? parseInt(process.env.PORT, 10) : 3022;

const config = makeConfig(port, __dirname, 'welogix');
config.set('vendor_dependencies', [
  'antd',
  'echarts',
  'react',
  'react-dom',
  'react-intl',
  'react-dropzone',
  'react-redux',
  'react-router',
  'redux',
  'serialize-javascript',
  'superagent',
  'react-weui',
]);

module.exports = config;
