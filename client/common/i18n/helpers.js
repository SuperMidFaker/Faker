export function polyfill(runAppFn) {
  // https://github.com/emmenko/redux-react-router-async-example/blob/master/lib/index.js
  // https://github.com/babotech/react-intlable/blob/master/src/ready.js
  document.addEventListener('DOMContentLoaded', () => {
    if (!global.Intl) {
      require.ensure([
        'intl',
        'intl/locale-data/jsonp/zh.js',
        'intl/locale-data/jsonp/en.js',
      ], require => {
        require('intl');
        require('intl/locale-data/jsonp/zh.js');
        require('intl/locale-data/jsonp/en.js');
        runAppFn();
      });
    } else {
      runAppFn();
    }
  });
}

export function format(messages) {
  return (intl, descriptor, values) => {
    if (!messages[descriptor]) {
      return descriptor;
    }
    return intl.formatMessage(messages[descriptor], values);
  };
}
