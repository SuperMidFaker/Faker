const config = new Map();
const env = process.env.NODE_ENV = (process.env.NODE_ENV || 'development').trim();

config.set('AK_WELOGIX_WEB', 'h9mZgQCfWCsEf9axutFUlgPhgbVGmng5');
config.set('AK_WELOGIX_SERVER', 'KSQ06zaqrY8d05PKkaolmFhSMYVLw4YX');

export default config;
