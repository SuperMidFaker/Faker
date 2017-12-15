import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import VehicleList from '../components/VehicleList';
import { transformRawCarDataToDisplayData } from '../utils/dataMapping';
import { loadVehicleList, editVehicle, toggleVehicleModal, removeVehicle } from 'common/reducers/transportResources';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';

function fetchData({ dispatch, state }) {
  return dispatch(loadVehicleList(state.account.tenantId));
}

@connectFetch()(fetchData)
@connect(state => ({
  loaded: state.transportResources.loaded,
  loading: state.transportResources.loading,
  cars: state.transportResources.cars,
  tenantId: state.account.tenantId,
}), {
  editVehicle, toggleVehicleModal, loadVehicleList, removeVehicle,
})
@connectNav({
  depth: 2,
  moduleName: 'transport',
})
export default class VehicleListContainer extends Component {
  static propTypes = {
    loaded: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
    tenantId: PropTypes.number.isRequired,
    cars: PropTypes.array.isRequired, // 服务器返回的车辆数组
    editVehicle: PropTypes.func.isRequired, // 停用和启用车辆的action creator
    toggleVehicleModal: PropTypes.func.isRequired,
    loadVehicleList: PropTypes.func.isRequired,
    removeVehicle: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    searchText: '',
  }
  componentWillReceiveProps(nextProps) {
    if (!nextProps.loaded && !nextProps.loading) {
      this.props.loadVehicleList(nextProps.tenantId);
    }
  }
  handleAddCarBtnClick = () => {
    this.props.toggleVehicleModal(true, 'add');
  }
  handleStopCarBtnClick = (carId) => {
    this.props.editVehicle({ carId, carInfo: { status: -1 } });
  }
  handleResumeCarBtnClick = (carId) => {
    this.props.editVehicle({ carId, carInfo: { status: 0 } });
  }
  handleEditVehicle = (vehicleId) => {
    const { cars } = this.props;
    const vehicle = cars.find(car => car.vehicle_id === vehicleId);
    this.props.toggleVehicleModal(true, 'edit', vehicle);
  }
  handleRemoveVehicle = (carId) => {
    this.props.removeVehicle(carId);
  }
  handleSearch = (searchText) => {
    this.setState({ searchText });
  }
  render() {
    const { cars } = this.props;
    const dataSource = cars.map(transformRawCarDataToDisplayData).filter((car) => {
      if (this.state.searchText) {
        const reg = new RegExp(this.state.searchText);
        return reg.test(car.plate_number) || reg.test(car.trailer_number) || reg.test(car.driver_name);
      } else {
        return true;
      }
    });
    return (
      <VehicleList dataSource={dataSource}
        onStopCarBtnClick={this.handleStopCarBtnClick}
        onResumeCarBtnClick={this.handleResumeCarBtnClick}
        onAddCarBtnClick={this.handleAddCarBtnClick}
        onEditVehicleBtnClick={this.handleEditVehicle}
        onRemoveVehicle={this.handleRemoveVehicle}
        onSearch={this.handleSearch}
        searchText={this.state.searchText}
      />
    );
  }
}
