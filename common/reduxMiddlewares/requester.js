/* eslint no-console:0 */
import superagent from 'superagent';

function apiRequestPromise(initialReq) {
  const requests = [];
  ['get', 'post', 'patch', 'del', 'put'].forEach((method) => {
    requests[method] = (endpoint, option) => {
      let furl = endpoint;
      if (endpoint.indexOf('http') === -1) {
        let rootUrl = API_ROOTS.default;
        if (option.origin) {
          rootUrl = API_ROOTS[option.origin];
        }
        if (!rootUrl) {
          console.error('API_ROOT not exist');
        }
        furl = `${rootUrl}${endpoint}`;
      }
      return new Promise((resolve, reject) => {
        const request = superagent[method](furl);
        // cross domain ajax request
        request.withCredentials();
        if (option && option.field) {
          request.field(option.field.key, option.field.value);
        }
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
        if (initialReq) {
          request.set('cookie', initialReq.get('cookie'));
          request.set('referer', initialReq.get('referer') || 'https://dummy.welogix.cn');
        }
        request.end((err, resp) => {
          if (err || !resp.body || resp.body.status !== 200) {
            console.log('api mw err', JSON.stringify(err), 'body', resp && resp.body);
            if (err && err.crossDomain === true) {
              return reject(new Error('网络断开/无法连接到服务器'));
            }
            if (resp && resp.body && resp.body.status === 401) {
              // 在浏览器端验证api请求验证错误时跳转至login页面
              if (!(typeof document === 'undefined' ||
                    typeof window === 'undefined' ||
                      !window.location)) {
                const originLoc = window.location;
                window.location.href =
                  `/login?next=${encodeURIComponent(originLoc.pathname)}`;
              }
            }
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
export default function thunkOrClientApiMiddleware(initialReq) {
  const requests = apiRequestPromise(initialReq);
  return ({ dispatch, getState }) => next => (action) => {
    if (typeof action === 'function') {
      return action(dispatch, getState);
    }
    const caller = action[CLIENT_API];
    if (typeof caller === 'undefined') {
      return next(action);
    }

    const {
      endpoint, method, types, ...rest
    } = caller;

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
    return requests[method](endpoint, { ...rest }).then((result) => {
      next({ ...rest, result, type: SUCCESS });
      return { error: null, data: result.data };
    }).catch((error) => {
      next({ ...rest, error, type: FAILURE });
      return { error: { message: error.message || error.msg } };
    });
  };
}
