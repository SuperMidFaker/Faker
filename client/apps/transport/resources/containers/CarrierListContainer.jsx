import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import CarrierList from '../components/CarrierList';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadPartners, changePartnerStatus, deletePartner } from 'common/reducers/partner';
import connectNav from 'client/common/decorators/connect-nav';
import { toggleCarrierModal } from 'common/reducers/transportResources';
import { PARTNER_ROLES, PARTNER_BUSINESSE_TYPES } from 'common/constants';

const role = PARTNER_ROLES.VEN;
const businessType = PARTNER_BUSINESSE_TYPES.transport;

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
}), {
  changePartnerStatus, deletePartner, toggleCarrierModal, loadPartners,
})
@connectNav({
  depth: 2,
  moduleName: 'transport',
})
export default class DriverListContainer extends Component {
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
  state = {
    searchText: '',
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
  handleEditBtnClick = (carrier) => {
    this.props.toggleCarrierModal(true, 'edit', carrier);
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
  handleSearch = (searchText) => {
    this.setState({ searchText });
  }
  render() {
    const { partners } = this.props;
    const dataSource = partners.filter((item) => {
      if (this.state.searchText) {
        const reg = new RegExp(this.state.searchText);
        return reg.test(item.name) || reg.test(item.partner_code) || reg.test(item.partner_unique_code);
      }
      return true;
    });
    return (
      <CarrierList
        dataSource={dataSource}
        onAddBtnClicked={this.handleAddBtnClick}
        onEditBtnClick={this.handleEditBtnClick}
        onStopBtnClick={this.handleStopBtnClick}
        onDeleteBtnClick={this.handleDeleteBtnClick}
        onResumeBtnClick={this.handleResumeBtnClick}
        onSearch={this.handleSearch}
        searchText={this.state.searchText}
      />
    );
  }
}
