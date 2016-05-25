import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import CarList from '../components/CarList.jsx';
import { transformRawCarDataToDisplayData } from '../utils/dataMapping';
import { loadCarList, editCar } from 'common/reducers/transportResources';
import connectFetch from 'client/common/decorators/connect-fetch';
import { addUniqueKeys } from '../utils/dataMapping';

function fetchData({dispatch, state}) {
  return dispatch(loadCarList(state.account.tenantId));
}

@connectFetch()(fetchData)
@connect(state => ({
  cars: state.transportResources.cars,
  selectedMenuItemKey: state.transportResources.selectedMenuItemKey,
}), { editCar })
export default class CarListContainer extends Component {
  static propTypes = {
    cars: PropTypes.array.isRequired,                 // 服务器返回的车辆数组
    selectedMenuItemKey: PropTypes.string.isRequired, // 当先选中的menuItem key
    loading: PropTypes.bool.isRequired,               // 加载状态
    editCar: PropTypes.func.isRequired,               // 停用和启用车辆的action creator
  }
  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  handleAddCarBtnClick = () => {
    this.context.router.push('/transport/resources/add_car');
  }
  handleStopCarBtnClick = (carId) => {
    this.props.editCar({carId, carInfo: {status: -1}});
  }
  handleResumeCarBtnClick = (carId) => {
    this.props.editCar({carId, carInfo: {status: 0}});
  }
  render() {
    const { cars, selectedMenuItemKey } = this.props;
    const dataSource = cars.map(transformRawCarDataToDisplayData);
    return (
      <CarList dataSource={addUniqueKeys(dataSource)}
               onStopCarBtnClick={this.handleStopCarBtnClick}
               onResumeCarBtnClick={this.handleResumeCarBtnClick}
               onAddCarBtnClick={this.handleAddCarBtnClick}/>
    );
  }
}
