import makeConfig from '../reusable/domains/bootstrap/make-universal-config';
const port = 3022;

const config = makeConfig(port, __dirname, 'wewms');

export default config;
