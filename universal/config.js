import makeConfig from '../reusable/domains/bootstrap/make-universal-config';
const port = 3022;

const config = makeConfig(port, __dirname, 'welogix');
config.set('vendor_dependencies', [
  'query-string',
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
