import React, { Component, PropTypes } from 'react';
import { Form } from 'antd';
import { connect } from 'react-redux';
import DriverForm from '../components/DriverForm.jsx';
import { addDriver, editDriver } from 'common/reducers/transportResources';
import connectNav from 'client/common/decorators/connect-nav';

@connect(state => ({
  drivers: state.transportResources.drivers,
  tenantId: state.account.tenantId,
}), { addDriver, editDriver })
@connectNav({
  depth: 3,
  text: '司机管理',
  muduleName: 'transport',
})
@Form.create()
export default class DriverFormContainer extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,     // @Form.create的form对象
    params: PropTypes.object.isRequired,   // 用于获取:driver_id参数
    drivers: PropTypes.array.isRequired,   // 服务器返回的司机数组
    addDriver: PropTypes.func.isRequired,  // 增加车辆的actionCreator
    editDriver: PropTypes.func.isRequired, // 修改车辆信息的actionCreator
    tenantId: PropTypes.number.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  handleDriverAdd = (e) => {
    e.preventDefault();
    const { form, tenantId } = this.props;
    const newDriverInfo = form.getFieldsValue();
    this.props.addDriver({ ...newDriverInfo, tenant_id: tenantId }).then(() => {
      this.context.router.goBack();
    });
  }
  handleDriverEdit = (e) => {
    e.preventDefault();
    const { form, params } = this.props;
    const editDriverInfo = form.getFieldsValue();
    const editDriverId = parseInt(params.driver_id, 10);
    this.props.editDriver({ driverId: editDriverId, driverInfo: editDriverInfo }).then(() => {
      this.context.router.goBack();
    });
  }
  render() {
    const { form, params, drivers } = this.props;
    if (params.driver_id !== undefined) {
      const editDriverInfo = drivers.find(driver => driver.driver_id === parseInt(params.driver_id, 10));
      return (
        <DriverForm mode="edit"
          form={form}
          driver={editDriverInfo}
          onSubmitBtnClicked={this.handleDriverEdit}
        />
      );
    } else {
      return (
        <DriverForm mode="add"
          form={form}
          onSubmitBtnClicked={this.handleDriverAdd}
        />
      );
    }
  }
}
