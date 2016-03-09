import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { loadCorpByDomain, reloadByDomain } from '../universal/redux/reducers/corp-domain';
import { loadTranslation } from '../universal/redux/reducers/intl';
import { isLoaded } from '../reusable/common/redux-actions';
import connectFetch from '../reusable/decorators/connect-fetch';
import './root.less';

function fetchData({ state, dispatch, cookie, location }) {
  const promises = [];
  // client side use location.query
  const query = location.query ||
    (location.search && require('query-string').parse(location.search.substring(1)));
  if (!isLoaded(state, 'corpDomain')) {
    const promise = dispatch(loadCorpByDomain(cookie, {
      subdomain: query.subdomain
    }));
    promises.push(promise);
  } else if (query.subdomain !== state.account.subdomain) {
    // if the subdomain is changed, we redirect to login in component
    const promise = dispatch(reloadByDomain(cookie, {
      subdomain: query.subdomain
    }));
    promises.push(promise);
  }
  /*
  // fetch on server when authed
  if (!isLoaded(state, 'intl')) {
    // intl.locale set on server side request
    const promise = dispatch(loadTranslation(cookie, state.intl.locale));
    promises.push(promise);
  }
 */
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@connect(
  state => ({
    locale: state.intl.locale,
    messages: state.intl.messages,
    subdomain: state.account.subdomain,
    isAuthed: state.auth.isAuthed
  }),
  { loadTranslation }
)
export default class Root extends React.Component {
  static propTypes = {
    children: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    loadTranslation: PropTypes.func.isRequired,
    locale: PropTypes.string.isRequired,
    messages: PropTypes.object,
    subdomain: PropTypes.string,
    isAuthed: PropTypes.bool.isRequired
  };

  componentWillReceiveProps(nextProps) {
    console.log('root componentWillReceiveProps');
    if (!this.props.isAuthed && nextProps.isAuthed) {
      const redirectUrl = this.props.location.query.next || '/';
      this.props.history.replaceState(null, redirectUrl);
    } else if (this.props.isAuthed) {
      const unAuthed = !nextProps.isAuthed || this.props.subdomain !== nextProps.subdomain;
      console.log('this subdomain', this.props.subdomain, 'next', nextProps.subdomain);
      if (unAuthed) {
        const search = __DEV__ ? `&${nextProps.location.search.substring(1)}` : '';
        nextProps.history.replaceState(null, `/login?next=${encodeURIComponent(nextProps.location.pathname)}${search}`);
      }
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
