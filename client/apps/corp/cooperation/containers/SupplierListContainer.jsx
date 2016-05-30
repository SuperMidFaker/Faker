import React from 'react';
import { connect } from 'react-redux';
import BaseList from '../components/BaseList';
import { inviteOnlPartner, addPartner } from 'common/reducers/partner';

@connect(state => ({
  partnerlist: state.partner.partnerlist.data,
  partnerTenants: state.partner.recevieablePartnerTenants,
  tenantId: state.account.tenantId
}), { inviteOnlPartner, addPartner })
export default class SupplierListContainer extends BaseList {
  constructor() {
    super();
    this.type = 'SUP';
    this.partnerships = ['SUP'];
  }
}
