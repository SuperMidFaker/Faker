import superagent from 'superagent';

function apiRequestPromise() {
  const requests = [];
  ['get', 'post', 'patch', 'del', 'put'].forEach((method) => {
    requests[method] = (endpoint, option) => {
      // 访问其他应用api时直接传入全路径
      const furl = (endpoint.indexOf('http') !== 0) ? __API_ROOT__ + endpoint : endpoint;
      return new Promise((resolve, reject) => {
        const request = superagent[method](furl);
        if (option && option.files) {
          option.files.forEach((file) => {
            request.attach(file.name, file);
          });
        }
        if (option && option.header) {
          request.set(option.header);
        }
        if (option && option.params) {
          request.query(option.params);
        }
        if (option && option.data) {
          request.send(option.data);
        }
        if (option && option.cookie) {
          request.set('cookie', option.cookie);
        }
        request.end((err, resp) => {
          if (err || !resp.body || resp.body.status !== 200) {
            /* eslint-disable no-console */
            console.log('api mw err', err, 'body', resp && resp.body);
            /* eslint-enable no-console */
            return reject((resp && resp.body) || err);
          }
          return resolve(resp.body);
        });
      });
    };
  });
  return requests;
}

export const CLIENT_API = Symbol('client');
export default function thunkOrClientApiMiddleware() {
  const requests = apiRequestPromise();
  return ({ dispatch, getState }) => {
    return next => action => {
      if (typeof action === 'function') {
        return action(dispatch, getState);
      }
      const caller = action[CLIENT_API];
      if (typeof caller === 'undefined') {
        return next(action);
      }

      const { endpoint, method, types, ...rest } = caller;

      if (typeof endpoint !== 'string') {
        throw new Error('Specify a string endpoint URL.');
      }
      if (!Array.isArray(types) || types.length !== 3) {
        throw new Error('Expected an array of three action types.');
      }
      if (!types.every(type => typeof type === 'string')) {
        throw new Error('Expected action types to be strings.');
      }

      const [REQUEST, SUCCESS, FAILURE] = types;
      next({ ...rest, type: REQUEST });
      return requests[method](endpoint, { ...rest }).then(
        result => {
          next({ ...rest, result, type: SUCCESS });
          return { error: null, data: result.data };
        }
      ).catch(error => {
        next({ ...rest, error, type: FAILURE });
        return { error: { message: error.message || error.msg } };
      });
    };
  };
}
