import makeConfig from '../reusable/domains/bootstrap/make-universal-config';
var port = 3022;
if (!isNaN(process.env.PORT)) {
  port = parseInt(process.env.PORT, 10);
}

const config = makeConfig(port, __dirname, 'welogix');
config.set('vendor_dependencies', [
  'ant-ui',
  'react',
  'react-dom',
  'react-intl',
  'react-dropzone',
  'react-redux',
  'react-router',
  'redux',
  'serialize-javascript',
  'superagent'
]);

export default config;
