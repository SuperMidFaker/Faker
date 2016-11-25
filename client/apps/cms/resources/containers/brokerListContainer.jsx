import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import BrokerList from '../components/brokerList';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadPartners, changePartnerStatus, deletePartner } from 'common/reducers/partner';
import connectNav from 'client/common/decorators/connect-nav';
import { toggleCarrierModal } from 'common/reducers/transportResources';

function fetchData({ dispatch, state, cookie }) {
  return dispatch(loadPartners(cookie, {
    tenantId: state.account.tenantId,
  }));
}

@connectFetch()(fetchData)
@connect(state => ({
  partnerlist: state.partner.partnerlist,
}), { changePartnerStatus, deletePartner, toggleCarrierModal })
@connectNav({
  depth: 2,
  muduleName: 'clearance',
})
export default class ProviderListContainer extends Component {
  static propTypes = {
    partnerlist: PropTypes.array.isRequired,
    changePartnerStatus: PropTypes.func.isRequired,
    deletePartner: PropTypes.func.isRequired,
    toggleCarrierModal: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  handleEditBtnClick = (id, name, code, partnerUniqueCode, partnerships) => {
    this.props.toggleCarrierModal(true, 'edit', { id, name, code, partnerUniqueCode, partnerships });
  }
  handleAddBtnClick = () => {
    this.props.toggleCarrierModal(true, 'add');
  }
  handleStopBtnClick = (id) => {
    this.props.changePartnerStatus(id, 0);
  }
  handleDeleteBtnClick = (id) => {
    this.props.deletePartner(id, ['CCB', 'CIB', 'ICB']);
  }
  handleResumeBtnClick = (id) => {
    this.props.changePartnerStatus(id, 1);
  }
  render() {
    const { partnerlist } = this.props;
    const dataSource = partnerlist.filter(partner => partner.partnerships.some(
      ps => ['CCB', 'CIB', 'ICB'].indexOf(ps) >= 0)
    );
    return (
      <BrokerList
        dataSource={dataSource}
        onAddBtnClicked={this.handleAddBtnClick}
        onEditBtnClick={this.handleEditBtnClick}
        onStopBtnClick={this.handleStopBtnClick}
        onDeleteBtnClick={this.handleDeleteBtnClick}
        onResumeBtnClick={this.handleResumeBtnClick}
      />
    );
  }
}
