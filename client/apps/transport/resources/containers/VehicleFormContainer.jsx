import React, { Component, PropTypes } from 'react';
import { Form } from 'antd';
import { connect } from 'react-redux';
import VehicleForm from '../components/VehicleForm.jsx';
import { addVehicle, editVehicle, validateVehicle } from 'common/reducers/transportResources';
import connectNav from 'client/common/decorators/connect-nav';

@connect(state => ({
  drivers: state.transportResources.drivers,
  cars: state.transportResources.cars,
  vehicleValidate: state.transportResources.vehicleValidate,
  tenantId: state.account.tenantId,
}), { addVehicle, editVehicle, validateVehicle })
@connectNav({
  depth: 3,
  text: '车辆管理',
  muduleName: 'transport',
})
@Form.create()
export default class VehicleFormContainer extends Component {
  static propTypes = {
    cars: PropTypes.array.isRequired,           // 服务器返回的车辆数组
    drivers: PropTypes.array.isRequired,        // 服务器返回的司机数组
    params: PropTypes.object.isRequired,        // :car_id参数
    form: PropTypes.object.isRequired,          // @Form.create的对象
    addVehicle: PropTypes.func.isRequired,      // 增加车辆的actionCreator
    editVehicle: PropTypes.func.isRequired,     // 修改车辆信息的actionCreator
    tenantId: PropTypes.number.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  handleCarSave = (e) => {
    e.preventDefault();
    const { form, tenantId } = this.props;
    const newCarInfo = form.getFieldsValue();
    this.props.addVehicle({ ...newCarInfo, tenant_id: tenantId }).then(() => {
      this.context.router.goBack();
    });
  }
  handleCarEdit = (e) => {
    e.preventDefault();
    const { form, params } = this.props;
    const editCarInfo = form.getFieldsValue();
    const carId = parseInt(params.car_id, 10);
    this.props.editVehicle({ carId, carInfo: editCarInfo }).then(() => {
      this.context.router.goBack();
    });
  }
  handleVehicleNumberBlur = (e) => {
    const vehicleNumber = e.target.value;
    const { tenantId } = this.props;
    this.props.validateVehicle(tenantId, vehicleNumber);
  }
  render() {
    const { cars, params, form, drivers, vehicleValidate } = this.props;
    if (params.car_id !== undefined) { // if this exits, represent edit mode
      const carId = parseInt(params.car_id, 10);
      const editCarInfo = cars.find(car => car.vehicle_id === carId);
      return (
        <VehicleForm mode="edit"
          form={form}
          car={editCarInfo}
          drivers={drivers}
          onSubmitBtnClicked={this.handleCarEdit}
        />
      );
    } else {
      return (
        <VehicleForm mode="add"
          form={form}
          drivers={drivers}
          vehicleValidate={vehicleValidate}
          onVehicleNumberBlur={this.handleVehicleNumberBlur}
          onSubmitBtnClicked={this.handleCarSave}
        />
      );
    }
  }
}
