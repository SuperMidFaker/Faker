
import React from 'react';
import { IntlProvider, intlShape } from 'react-intl';
import { mount, shallow } from 'enzyme';

// You can pass your messages to the IntlProvider. Optional: remove if unneeded.
const messages = require('../public/assets/langs/zh.json'); // en.json

// Create the IntlProvider to retrieve context for wrapping around.
const intlProvider = new IntlProvider({ locale: 'zh', messages }, {});
const { intl } = intlProvider.getChildContext();

/**
 * When using React-Intl `injectIntl` on components, props.intl is required.
 */
function nodeWithIntlProp(node) {
  return React.cloneElement(node, { intl });
}

export function shallowWithIntl(node, { context } = {}) {
  return shallow(
    nodeWithIntlProp(node),
    {
      context: Object.assign({}, context, { intl }),

    }
  );
}

export function mountWithIntl(node, { context, childContextTypes } = {}) {
  return mount(
    nodeWithIntlProp(node),
    {
      context: Object.assign({}, context, { intl }),
      childContextTypes: Object.assign({}, { intl: intlShape }, childContextTypes),
    }
  );
}
