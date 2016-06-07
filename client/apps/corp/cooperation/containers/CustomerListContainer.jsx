import BaseList from '../components/BaseList';
import { connect } from 'react-redux';
import { inviteOnlPartner, addPartner, editPartner, changePartnerStatus } from 'common/reducers/partner';

@connect(state => ({
  partnerlist: state.partner.partnerlist.data,
  partnerTenants: state.partner.recevieablePartnerTenants,
  tenantId: state.account.tenantId
}), { inviteOnlPartner, addPartner, editPartner, changePartnerStatus })
export default class CustomerListContainer extends BaseList {
  constructor() {
    super();
    this.type = 'CUS';
    this.partnerships = ['CUS'];
  }
}
