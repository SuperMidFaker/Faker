import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import BrokerList from '../components/brokerList';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadPartners, changePartnerStatus, deletePartner } from 'common/reducers/partner';
import connectNav from 'client/common/decorators/connect-nav';
import { toggleCarrierModal } from 'common/reducers/transportResources';
import { PARTNER_ROLES, PARTNER_BUSINESSE_TYPES } from 'common/constants';
const role = PARTNER_ROLES.SUP;
const businessType = PARTNER_BUSINESSE_TYPES.clearance;
function fetchData({ dispatch, state }) {
  return dispatch(loadPartners({
    tenantId: state.account.tenantId,
    role,
    businessType,
  }));
}

@connectFetch()(fetchData)
@connect(state => ({
  loaded: state.partner.loaded,
  partners: state.partner.partners,
  tenantId: state.account.tenantId,
}), { changePartnerStatus, deletePartner, toggleCarrierModal, loadPartners })
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
export default class ProviderListContainer extends Component {
  static propTypes = {
    tenantId: PropTypes.number.isRequired,
    loaded: PropTypes.bool.isRequired,
    partners: PropTypes.array.isRequired,
    changePartnerStatus: PropTypes.func.isRequired,
    deletePartner: PropTypes.func.isRequired,
    toggleCarrierModal: PropTypes.func.isRequired,
    loadPartners: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  componentWillReceiveProps(nextProps) {
    if (!nextProps.loaded) {
      this.props.loadPartners({
        tenantId: nextProps.tenantId,
        role,
        businessType,
      });
    }
  }
  handleEditBtnClick = (partner) => {
    this.props.toggleCarrierModal(true, 'edit', partner);
  }
  handleAddBtnClick = () => {
    this.props.toggleCarrierModal(true, 'add');
  }
  handleStopBtnClick = (id) => {
    this.props.changePartnerStatus(id, 0, role, businessType);
  }
  handleDeleteBtnClick = (id) => {
    this.props.deletePartner(id, role, businessType);
  }
  handleResumeBtnClick = (id) => {
    this.props.changePartnerStatus(id, 1, role, businessType);
  }
  render() {
    return (
      <BrokerList
        dataSource={this.props.partners}
        onAddBtnClicked={this.handleAddBtnClick}
        onEditBtnClick={this.handleEditBtnClick}
        onStopBtnClick={this.handleStopBtnClick}
        onDeleteBtnClick={this.handleDeleteBtnClick}
        onResumeBtnClick={this.handleResumeBtnClick}
      />
    );
  }
}
