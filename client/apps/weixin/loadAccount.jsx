import React from 'react';
import { loadAccount } from 'common/reducers/account';
import connectFetch from 'client/common/decorators/connect-fetch';

function fetchData({ dispatch, cookie }) {
  return dispatch(loadAccount(cookie));
}

@connectFetch()(fetchData)

export default class WxLoadAccount extends React.Component {
  render() {
    return this.props.children;
  }
}
