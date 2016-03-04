import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
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
    const promise = dispatch(loadCorpByDomain(cookie, {
      subdomain: query.subdomain
    }));
    promises.push(promise);
  }
  if (!isLoaded(state, 'intl')) {
    // intl.locale set on server side request
    const promise = dispatch(loadTranslation(cookie, state.intl.locale));
    promises.push(promise);
  }
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@connect(
  state => ({
    subdomain: state.account.subdomain,
    isAuthed: state.auth.isAuthed
  })
)
export default class Root extends React.Component {
  static propTypes = {
    children: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    subdomain: PropTypes.string.isRequired,
    isAuthed: PropTypes.bool.isRequired
  };

  componentWillReceiveProps(nextProps) {
    if (!this.props.isAuthed && nextProps.isAuthed) {
      const redirectUrl = this.props.location.query.next || '/';
      this.props.history.replaceState(null, redirectUrl);
    } else if (this.props.isAuthed) {
      // todo
      const unAuthed = !nextProps.isAuthed || this.props.subdomain !== nextProps.subdomain;
      if (unAuthed) {
        const search = __DEV__ ? `&${nextProps.location.search.substring(1)}` : '';
        nextProps.history.replaceState(null, `/login?next=${encodeURIComponent(nextProps.location.pathname)}${search}`);
      }
    }
  }

  render() {
    return this.props.children;
  }
}
