import React, { Component, PropTypes } from 'react';
import { Form } from 'ant-ui';
import { connect } from 'react-redux';
import CarForm from '../components/CarForm.jsx';
import { addCar, editCar } from 'common/reducers/transportResources';
import connectNav from 'client/common/connect-nav';
import { setNavTitle } from 'common/reducers/navbar';

@connectNav((props, dispatch, router) => {
  dispatch(setNavTitle({
    depth: 3,
    text: '车辆信息',
    muduleName: 'transport',
    withModuleLayout: false,
    goBackFn: () => router.goBack()
  }));
})
@connect(state => ({
  drivers: state.transportResources.drivers,
  cars: state.transportResources.cars,
  tenantId: state.account.tenantId
}), { addCar, editCar })
@Form.formify()
export default class CarFormContainer extends Component {
  static propTypes = {
    cars: PropTypes.array.isRequired,      // 服务器返回的车辆数组
    drivers: PropTypes.array.isRequired,   // 服务器返回的司机数组
    params: PropTypes.object.isRequired,   // :car_id参数
    form: PropTypes.object.isRequired,     // @Form.formify创建的对象
    addCar: PropTypes.func.isRequired,     // 增加车辆的actionCreator
    editCar: PropTypes.func.isRequired,    // 修改车辆信息的actionCreator
    tenantId: PropTypes.number.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  handleCarSave = (e) => {
    e.preventDefault();
    const { form, tenantId } = this.props;
    const newCarInfo = form.getFieldsValue();
    this.props.addCar({...newCarInfo, tenant_id: tenantId});
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
