import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { loadCorpByDomain } from '../universal/redux/reducers/corp-domain';
import { isLoaded } from '../reusable/common/redux-actions';
import connectFetch from '../reusable/decorators/connect-fetch';
import './root.less';

function fetchData({ state, dispatch, cookie, location }) {
  if (!isLoaded(state, 'corpDomain')) {
    // client side use location.query
    const query = location.query ||
      (location.search && require('query-string').parse(location.search.substring(1)));
    return dispatch(loadCorpByDomain(cookie, {
      subdomain: query.subdomain
    }));
  }
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
