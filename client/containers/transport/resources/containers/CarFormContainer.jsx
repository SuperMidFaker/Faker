import React, { Component, PropTypes } from 'react';
import { Form } from 'ant-ui';
import { connect } from 'react-redux';
import CarForm from '../components/CarForm.jsx';
import { addCar, editCar, loadDriverList } from '../../../../../universal/redux/reducers/transportResources';
import connectFetch from 'reusable/decorators/connect-fetch';

// TODO: fix display problem when eidt a car

function fetchData({dispatch}) {
  return dispatch(loadDriverList());
}

@connectFetch()(fetchData)
@connect(state => ({drivers: state.transportResources.drivers, cars: state.transportResources.cars}), { addCar, editCar })
@Form.formify()
export default class CarFormContainer extends Component {
  static propTypes = {
    cars: PropTypes.array.isRequired,      // 服务器返回的车辆数组
    drivers: PropTypes.array.isRequired,   // 服务器返回的司机数组
    params: PropTypes.object.isRequired,   // :car_id参数
    form: PropTypes.object.isRequired,     // @Form.formify创建的对象
    addCar: PropTypes.func.isRequired,     // 增加车辆的actionCreator
    editCar: PropTypes.func.isRequired,    // 修改车辆信息的actionCreator
  }
  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  handleCarSave = (e) => {
    e.preventDefault();
    const { form } = this.props;
    const newCarInfo = form.getFieldsValue();
    this.props.addCar(newCarInfo);
    this.context.router.goBack();
  }
  handleCarEdit = (e) => {
    e.preventDefault();
    const { form, params } = this.props;
    const editCarInfo = form.getFieldsValue();
    const carId = parseInt(params.car_id, 10);
    this.props.editCar({carId, carInfo: editCarInfo});
    this.context.router.goBack();
  }
  render() {
    const { cars, params, form, drivers } = this.props;
    if (params.car_id !== undefined) { // if this exits, represent edit mode
      const carId = parseInt(params.car_id, 10);
      const editCarInfo = cars.find(car => car.vehicle_id === carId);
      // const displayedCarInfo = transformRawCarDataToDisplayData(editCarInfo);
      return (
        <CarForm mode="edit"
                 form={form}
                 car={editCarInfo}
                 drivers={drivers}
                 onSubmitBtnClicked={this.handleCarEdit}/>
      );
    } else {
      return (
        <CarForm mode="add"
                 form={form}
                 drivers={drivers}
                 onSubmitBtnClicked={this.handleCarSave}/>
      );
    }
  }
}
