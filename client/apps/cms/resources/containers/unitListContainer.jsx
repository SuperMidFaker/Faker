import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import UnitList from '../components/unitList';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadBusinessUnits, deleteBusinessUnit, toggleBusinessUnitModal } from 'common/reducers/cmsResources';
import connectNav from 'client/common/decorators/connect-nav';

function fetchData({ dispatch, state, cookie }) {
  return dispatch(loadBusinessUnits(cookie, state.account.tenantId));
}

@connectFetch()(fetchData)
@connect(state => ({
  loaded: state.cmsResources.loaded,
  businessUnits: state.cmsResources.businessUnits,
  tenantId: state.account.tenantId,
}), { loadBusinessUnits, deleteBusinessUnit, toggleBusinessUnitModal })
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
export default class UnitListContainer extends Component {
  static propTypes = {
    tenantId: PropTypes.number.isRequired,
    loaded: PropTypes.bool.isRequired,
    businessUnits: PropTypes.array.isRequired,
    loadBusinessUnits: PropTypes.func.isRequired,
    deleteBusinessUnit: PropTypes.func.isRequired,
    toggleBusinessUnitModal: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  componentWillReceiveProps(nextProps) {
    if (!nextProps.loaded) {
      this.props.loadBusinessUnits(null, nextProps.tenantId);
    }
  }
  handleEditBtnClick = (businessUnit) => {
    this.props.toggleBusinessUnitModal(true, 'edit', businessUnit);
  }
  handleAddBtnClick = (type) => {
    this.props.toggleBusinessUnitModal(true, 'add', { relation_type: type });
  }
  handleDeleteBtnClick = (id) => {
    this.props.deleteBusinessUnit(id);
  }

  render() {
    return (
      <UnitList
        dataSource={this.props.businessUnits}
        onAddBtnClicked={this.handleAddBtnClick}
        onEditBtnClick={this.handleEditBtnClick}
        onDeleteBtnClick={this.handleDeleteBtnClick}
      />
    );
  }
}
