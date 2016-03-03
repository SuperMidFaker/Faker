import { FormattedMessage } from 'react-intl'
export function polyfill(runFn) {
  // https://github.com/emmenko/redux-react-router-async-example/blob/master/lib/index.js
  // https://github.com/babotech/react-intlable/blob/master/src/ready.js
  document.addEventListener(`DOMContentLoaded`, () => {
    if (!global.Intl) {
      return require.ensure([`intl`], (require) => {
        // require('intl').default
        runFn();
      });
    }
    runFn();
  });
}

export const Msg = (props) => <FormattedMessage {...messages[ props.s ]} values={props.values}/>
