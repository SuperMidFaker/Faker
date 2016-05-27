import React from 'react';
import { connect } from 'react-redux';
import BaseList from '../components/BaseList';
import { loadPartners, inviteOnlPartner } from 'common/reducers/partner';
import connectFetch from 'client/common/decorators/connect-fetch';

function fetchData({ state, dispatch, cookie }) {
  return dispatch(loadPartners(cookie, {
    tenantId: state.account.tenantId,
    pageSize: state.partner.partnerlist.pageSize,
    currentPage: state.partner.partnerlist.current
  }));
}

@connectFetch()(fetchData)
@connect(state => ({
  partnerlist: state.partner.partnerlist.data,
  partnerTenants: state.partner.partnerTenants,
  tenantId: state.account.tenantId
}), { inviteOnlPartner })
export default class CustomerListContainer extends BaseList {
}
