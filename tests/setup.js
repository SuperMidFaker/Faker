import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

if (typeof window !== 'undefined') {
  global.API_ROOTS = {
    default: 'http://localhost:3030/',
    mongo: 'http://localhost:3032/',
    self: 'http://localhost:',
  };
  global.__CLIENT__ = true;
  global.__DEVTOOLS__ = false;
  global.__DEV__ = true;
  jest.mock('superagent', () => ({
    resp: null,
    err: null,
    mockApiMap: {},
    attach: () => {},
    set: () => {},
    query: () => {},
    send: () => {},
    end(fn) { fn(this.err, this.resp); },
    get(url) {
      const data = this.mockApiMap[url];
      if (data.err) {
        this.err = data.err;
      } else {
        this.resp = data.resp;
      }
      return this;
    },
    post(url) {
      const data = this.mockApiMap[url];
      if (data.err) {
        this.err = data.err;
      } else {
        this.resp = data.resp;
      }
      return this;
    },
    mockApi(mockData, endpoint) {
      for (let i = 0; i < mockData.length; i++) {
        const data = mockData[i];
        if (!endpoint) {
          this.mockApiMap[`${global.API_ROOTS.default}${data.url}`] = { resp: data.resp, err: data.err };
        } else {
          this.mockApiMap[`${endpoint}${data.url}`] = { resp: data.resp, err: data.err };
        }
      }
    },
  }));
}
