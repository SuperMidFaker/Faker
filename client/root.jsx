import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import connectFetch from '../reusable/decorators/connect-fetch';
import './root.less';

function fetchData(/* {state, dispatch, cookie, subdomain} */) {
  const promises = [];
  return promises;
}

@connectFetch()(fetchData)
@connect(
  state => ({
    isAuthed: state.auth.isAuthed,
    userType: state.auth.userType
  })
)
export default class Root extends React.Component {
  static propTypes = {
    children: PropTypes.object.isRequired,
    history: PropTypes.object,
    location: PropTypes.object,
    isAuthed: PropTypes.bool
  };

  componentWillReceiveProps(nextProps) {
    if (!this.props.isAuthed && nextProps.isAuthed) {
      const redirectUrl = this.props.location.query.next || '/';
      this.props.history.replaceState(null, redirectUrl);
    } else if (this.props.isAuthed && !nextProps.isAuthed) {
      this.props.history.pushState(null, '/login');
    }
  }

  render() {
    return this.props.children;
  }
}
