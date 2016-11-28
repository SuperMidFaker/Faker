import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import BrokerList from '../components/brokerList';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadPartners, changePartnerStatus, deletePartner } from 'common/reducers/partner';
import connectNav from 'client/common/decorators/connect-nav';
import { toggleCarrierModal } from 'common/reducers/transportResources';

const role = 'CSUP';

function fetchData({ dispatch, state, cookie }) {
  return dispatch(loadPartners(cookie, {
    tenantId: state.account.tenantId,
    role,
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
  muduleName: 'clearance',
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
      this.props.loadPartners(null, {
        tenantId: nextProps.tenantId,
        role,
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
    this.props.changePartnerStatus(id, 0, role);
  }
  handleDeleteBtnClick = (id) => {
    this.props.deletePartner(id, role);
  }
  handleResumeBtnClick = (id) => {
    this.props.changePartnerStatus(id, 1, role);
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
