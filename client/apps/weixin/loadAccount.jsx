import React from 'react';
import { loadWelogixProfile } from 'common/reducers/weixin';
import connectFetch from 'client/common/decorators/connect-fetch';

function fetchData({ dispatch, cookie }) {
  return dispatch(loadWelogixProfile(cookie));
}

@connectFetch()(fetchData)

export default class WxLoadAccount extends React.Component {
  render() {
    return this.props.children;
  }
}
