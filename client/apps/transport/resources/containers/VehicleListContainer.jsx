import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import VehicleList from '../components/VehicleList.jsx';
import { transformRawCarDataToDisplayData } from '../utils/dataMapping';
import { loadVehicleList, editVehicle } from 'common/reducers/transportResources';
import connectFetch from 'client/common/decorators/connect-fetch';

function fetchData({dispatch, state}) {
  return dispatch(loadVehicleList(state.account.tenantId));
}

@connectFetch()(fetchData)
@connect(state => ({
  cars: state.transportResources.cars,
}), { editVehicle })
export default class VehicleListContainer extends Component {
  static propTypes = {
    cars: PropTypes.array.isRequired,                 // 服务器返回的车辆数组
    loading: PropTypes.bool.isRequired,               // 加载状态
    editVehicle: PropTypes.func.isRequired,           // 停用和启用车辆的action creator
  }
  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  handleAddCarBtnClick = () => {
    this.context.router.push('/transport/resources/add_car');
  }
  handleStopCarBtnClick = (carId) => {
    this.props.editVehicle({carId, carInfo: {status: -1}});
  }
  handleResumeCarBtnClick = (carId) => {
    this.props.editVehicle({carId, carInfo: {status: 0}});
  }
  render() {
    const { cars } = this.props;
    const dataSource = cars.map(transformRawCarDataToDisplayData);
    return (
      <VehicleList dataSource={dataSource}
                   onStopCarBtnClick={this.handleStopCarBtnClick}
                   onResumeCarBtnClick={this.handleResumeCarBtnClick}
                   onAddCarBtnClick={this.handleAddCarBtnClick}/>
    );
  }
}
