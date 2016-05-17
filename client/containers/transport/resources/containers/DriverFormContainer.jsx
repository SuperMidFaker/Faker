import React, { Component, PropTypes } from 'react';
import { Form } from 'ant-ui';
import { connect } from 'react-redux';
import DriverForm from '../components/DriverForm.jsx';
import { addDriver, editDriver } from '../../../../../universal/redux/reducers/transportResources';

@connect(state => ({drivers: state.transportResources.drivers}), { addDriver, editDriver })
@Form.formify()
export default class DriverFormContainer extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,    // @Form.formify创建的form对象
    params: PropTypes.object.isRequired,  // 用于获取:driver_id参数
    drivers: PropTypes.array.isRequired,  // 服务器返回的司机数组
    dispatch: PropTypes.func.isRequired,  // store.dispatch函数
    addDriver: PropTypes.func.isRequied,  // 增加车辆的actionCreator
    editDriver: PropTypes.func.isRquired, // 修改车辆信息的actionCreator
  }
  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  handleDriverAdd = (e) => {
    e.preventDefault();
    const { form } = this.props;
    const newDriverInfo = form.getFieldsValue();
    this.props.addDriver(newDriverInfo);
    this.context.router.goBack();
  }
  handleDriverEdit = (e) => {
    e.preventDefault();
    const { form, params } = this.props;
    const editDriverInfo = form.getFieldsValue();
    const editDriverId = parseInt(params.driver_id, 10);
    this.props.editDriver({driverId: editDriverId, driverInfo: editDriverInfo});
    this.context.router.goBack();
  }
  render() {
    const { form, params, drivers } = this.props;
    if (params.driver_id !== undefined) {
      const editDriverInfo = drivers.find(driver => driver.driver_id === parseInt(params.driver_id, 10));
      return (
        <DriverForm mode="edit"
                    form={form}
                    driver={editDriverInfo}
                    onSubmitBtnClicked={this.handleDriverEdit}/>
      );
    } else {
      return (
        <DriverForm mode="add"
                    form={form}
                    onSubmitBtnClicked={this.handleDriverAdd}/>
      );
    }
  }
}
