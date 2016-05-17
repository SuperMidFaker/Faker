import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import CarList from '../components/CarList.jsx';
import { transformRawCarDataToDisplayData } from '../utils/dataMapping';

@connect(state => ({cars: state.cars || []}))
export default class CarListContainer extends Component {
  static propTypes = {
    cars: PropTypes.array.isRequired,   // 服务器返回的车辆数组
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
      <CarList dataSource={dataSource} onAddCarBtnClicked={this.handleAddCarBtnClicked}/>
    );
  }
}
