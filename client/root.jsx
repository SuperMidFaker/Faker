import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { loadCorpByDomain } from '../universal/redux/reducers/corp-domain';
import { loadTranslation } from '../universal/redux/reducers/intl';
import { isLoaded } from '../reusable/common/redux-actions';
import connectFetch from '../reusable/decorators/connect-fetch';
import './root.less';

function fetchData({ state, dispatch, cookie, location }) {
  const promises = [];
  if (!isLoaded(state, 'corpDomain')) {
    // client side use location.query
    const query = location.query ||
      (location.search && require('query-string').parse(location.search.substring(1)));
    const prom = dispatch(loadCorpByDomain(cookie, query.subdomain));
    promises.push(prom);
  }
  if (!isLoaded(state, 'intl')) {
    // set initial locale on server render
    const prom = dispatch(loadTranslation(cookie, state.intl.locale));
    promises.push(prom);
  }
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@connect(
  state => ({
    locale: state.intl.locale,
    messages: state.intl.messages,
    isAuthed: state.auth.isAuthed
  })
)
export default class Root extends React.Component {
  static propTypes = {
    children: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    locale: PropTypes.string.isRequired,
    messages: PropTypes.object,
    isAuthed: PropTypes.bool.isRequired
  };

  componentWillReceiveProps(nextProps) {
    if (!this.props.isAuthed && nextProps.isAuthed) {
      const redirectUrl = this.props.location.query.next || '/';
      this.props.history.replaceState(null, redirectUrl);
    }
  }

  render() {
    const { locale, messages } = this.props;
    return (
      <IntlProvider key={locale}
        locale={locale}
        messages={messages}
      >
      {this.props.children}
      </IntlProvider>
    );
  }
}
