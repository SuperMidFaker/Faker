import makeConfig from '../reusable/domains/bootstrap/make-universal-config';
const port = process.env.PORT || 3022;

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
