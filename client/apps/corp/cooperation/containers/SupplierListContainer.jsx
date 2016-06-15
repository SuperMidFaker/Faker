import BaseList from '../components/BaseList';
import { connect } from 'react-redux';
import { inviteOnlPartner, addPartner, editPartner, changePartnerStatus, deletePartner, invitePartner } from 'common/reducers/partner';
import { inviteOfflinePartner } from 'common/reducers/invitation';

@connect(state => ({
  partnerlist: state.partner.partnerlist,
  tenantId: state.account.tenantId,
}), {
  inviteOnlPartner, addPartner, editPartner,
  changePartnerStatus, deletePartner, inviteOfflinePartner, invitePartner
})
export default class SupplierListContainer extends BaseList {
  constructor() {
    super();
    this.type = 'SUP';
    this.partnerships = ['SUP'];
  }
}
