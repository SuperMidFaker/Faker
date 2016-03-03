import React from 'react'
import { defineMessages, FormattedMessage } from 'react-intl'

const messages = defineMessages({  // i18n strings for this component - https://goo.gl/abldHf
  welcome: {
    id: 'home.welcome',
    defaultMessage: 'Welcome to {page}'
  },
  today: {
    id: 'home.today',
    defaultMessage: '"Locale demo" - Today\'s'
  },
  rateMeh: {
    id: 'home.rateMeh',
    defaultMessage: 'Meh'
  },
  rateOk: {
    id: 'home.rateOk',
    defaultMessage: 'Ok'
  },
  rateGreat: {
    id: 'home.rateGreat',
    defaultMessage: 'Great!'
  }
})

