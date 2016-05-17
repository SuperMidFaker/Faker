import React, { Component, PropTypes } from 'react';
import { Form } from 'ant-ui';
import { connect } from 'react-redux';
import DriverForm from '../components/DriverForm.jsx';

@connect(state => ({drivers: state.drivers}))
@Form.formify()
export default class DriverFormContainer extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,    // @Form.formify创建的form对象
    params: PropTypes.object.isRequired,  // 用于获取:driver_id参数
    drivers: PropTypes.array.isRequired,  // 服务器返回的司机数组
    dispatch: PropTypes.func.isRequired,  // store.dispatch函数
  }
  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  handleDriverAdd = (e) => {
    e.preventDefault();
    const { dispatch, form, drivers } = this.props;
    const newDriverInfo = form.getFieldsValue();
    newDriverInfo.id = newDriverInfo.key = drivers.length; // Todo: replace this when send to server
    dispatch({type: 'ADD_DRIVER', driver: newDriverInfo});
    this.context.router.goBack();
  }
  handleDriverEdit = (e) => {
    e.preventDefault();
    const { dispatch, form, params } = this.props;
    const editDriverInfo = form.getFieldsValue();
    const editDriverId = parseInt(params.driver_id, 2);
    editDriverInfo.id = editDriverInfo.key = editDriverId;
    dispatch({type: 'EDIT_DRIVER', driver: editDriverInfo, driverId: editDriverId});
    this.context.router.goBack();
  }
  render() {
    const { form, params, drivers } = this.props;
    if (params.driver_id !== undefined) {
      const editDriver = drivers.find(driver => driver.id === parseInt(params.driver_id, 2));
      return (
        <DriverForm mode="edit"
                    form={form}
                    driver={editDriver}
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
