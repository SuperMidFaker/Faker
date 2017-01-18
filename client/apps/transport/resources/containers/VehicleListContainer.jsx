import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import VehicleList from '../components/VehicleList';
import { transformRawCarDataToDisplayData } from '../utils/dataMapping';
import { loadVehicleList, editVehicle } from 'common/reducers/transportResources';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';

function fetchData({ dispatch, state }) {
  return dispatch(loadVehicleList(state.account.tenantId));
}

@connectFetch()(fetchData)
@connect(state => ({
  cars: state.transportResources.cars,
}), { editVehicle })
@connectNav({
  depth: 2,
  moduleName: 'transport',
})
export default class VehicleListContainer extends Component {
  static propTypes = {
    cars: PropTypes.array.isRequired,                 // 服务器返回的车辆数组
    editVehicle: PropTypes.func.isRequired,           // 停用和启用车辆的action creator
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    searchText: '',
  }
  handleAddCarBtnClick = () => {
    this.context.router.push('/transport/resources/vehicle/add');
  }
  handleStopCarBtnClick = (carId) => {
    this.props.editVehicle({ carId, carInfo: { status: -1 } });
  }
  handleResumeCarBtnClick = (carId) => {
    this.props.editVehicle({ carId, carInfo: { status: 0 } });
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
        onSearch={this.handleSearch}
        searchText={this.state.searchText}
      />
    );
  }
}
