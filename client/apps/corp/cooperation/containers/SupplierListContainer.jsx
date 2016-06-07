import BaseList from '../components/BaseList';
import { connect } from 'react-redux';
import { inviteOnlPartner, addPartner, changePartnerStatus } from 'common/reducers/partner';

@connect(state => ({
  partnerlist: state.partner.partnerlist.data,
  partnerTenants: state.partner.recevieablePartnerTenants,
  tenantId: state.account.tenantId
}), { inviteOnlPartner, addPartner, changePartnerStatus })
export default class SupplierListContainer extends BaseList {
  constructor() {
    super();
    this.type = 'SUP';
    this.partnerships = ['SUP'];
  }
}
