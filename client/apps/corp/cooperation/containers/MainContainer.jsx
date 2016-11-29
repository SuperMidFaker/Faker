import React, { Component } from 'react';
import { loadPartners } from 'common/reducers/partner';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import withPrivilege from 'client/common/decorators/withPrivilege';
import InvitationListContainer from '../containers/InvitationListContainer';

function fetchData({ state, dispatch, cookie }) {
  return dispatch(loadPartners(cookie, {
    tenantId: state.account.tenantId,
    role: '',
    businessType: '',
  }));
}

@connectFetch()(fetchData)

@connectNav({
  depth: 1,
  text: '协作网络',
  muduleName: 'corp',
})
@withPrivilege({ module: 'corp', feature: 'partners' })
export default class MainContainer extends Component {

  render() {
    return (
      <InvitationListContainer />
    );
  }
}
