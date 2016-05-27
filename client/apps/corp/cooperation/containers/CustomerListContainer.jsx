import React from 'react';
import { connect } from 'react-redux';
import BaseList from '../components/BaseList';
import { inviteOnlPartner } from 'common/reducers/partner';

@connect(state => ({
  partnerlist: state.partner.partnerlist.data,
  partnerTenants: state.partner.recevieablePartnerTenants,
  tenantId: state.account.tenantId
}), { inviteOnlPartner })
export default class CustomerListContainer extends BaseList {
}
