import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import CarList from '../components/CarList.jsx';
import { transformRawCarDataToDisplayData } from '../utils/dataMapping';
import { loadCarList } from '../../../../../universal/redux/reducers/transportResources';
import connectFetch from 'reusable/decorators/connect-fetch';

function fetchData({dispatch}) {
  return dispatch(loadCarList());
}

@connectFetch()(fetchData)
@connect(state => ({cars: state.transportResources.cars, selectedMenuItemKey: state.transportResources.selectedMenuItemKey}))
export default class CarListContainer extends Component {
  static propTypes = {
    cars: PropTypes.array.isRequired,                 // 服务器返回的车辆数组
    selectedMenuItemKey: PropTypes.string.isRequired, // 当先选中的menuItem key
  }
  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  handleAddCarBtnClicked = () => {
    this.context.router.push('/transport/resources/add_car');
  }
  render() {
    const dataSource = this.props.cars.map(transformRawCarDataToDisplayData);
    return (
      <CarList dataSource={dataSource}
               visible={this.props.selectedMenuItemKey === '0'}
               onAddCarBtnClicked={this.handleAddCarBtnClicked}/>
    );
  }
}
