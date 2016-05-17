import React, { Component, PropTypes } from 'react';
import { Form } from 'ant-ui';
import { connect } from 'react-redux';
import CarForm from '../components/CarForm.jsx';

@connect(state => ({drivers: state.drivers}))
@Form.formify()
export default class CarFormContainer extends Component {
  static propTypes = {
    cars: PropTypes.array.isRequired,      // 服务器返回的车辆数组
    drivers: PropTypes.array.isRequired,   // 服务器返回的司机数组
    params: PropTypes.object.isRequired,   // :car_id参数
    form: PropTypes.object.isRequired,     // @Form.formify创建的对象
    dispatch: PropTypes.object.isRequired, // store.dispatch函数
  }
  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  handleCarSave = (e) => {
    e.preventDefault();
    const newCarInfo = this.props.form.getFieldsValue();
    newCarInfo.id = newCarInfo.key = this.props.cars.length; // TODO: replace this when send data to server
    this.props.dispatch({type: 'ADD_CAR', car: newCarInfo});
    this.context.router.goBack();
  }
  handleCarEdit = (e) => {
    e.preventDefault();
    const { form, dispatch, params } = this.props;
    const editCarInfo = form.getFieldsValue();
    const carId = parseInt(params.car_id, 2);
    dispatch({type: 'EDIT_CAR', car: editCarInfo, carId});
    this.context.router.goBack();
  }
  render() {
    const { cars, params, form, drivers } = this.props;

    if (params.car_id !== undefined) { // if this exits, represent edit mode
      const carId = parseInt(params.car_id, 2);
      const editCar = cars.find(car => car.id === carId);
      return (
        <CarForm mode="edit"
                 form={form}
                 car={editCar}
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
