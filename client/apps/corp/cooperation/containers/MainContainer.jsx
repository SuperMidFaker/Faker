import React, { Component } from 'react';
import Main from '../components/Main';
import { loadPartners } from 'common/reducers/partner';
import connectFetch from 'client/common/decorators/connect-fetch';

function fetchData({ state, dispatch, cookie }) {
  return dispatch(loadPartners(cookie, {
    tenantId: state.account.tenantId,
    pageSize: state.partner.partnerlist.pageSize,
    currentPage: state.partner.partnerlist.current
  }));
}

@connectFetch()(fetchData)
export default class MainContainer extends Component {
  render() {
    return (
      <Main />
    );
  }
}
