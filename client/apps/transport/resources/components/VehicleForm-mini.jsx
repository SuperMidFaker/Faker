import React, { Component, PropTypes } from 'react';
import { Form, Select, Input, Modal, message } from 'antd';
import { VEHICLE_TYPES, VEHICLE_LENGTH_TYPES } from 'common/constants';
import { connect } from 'react-redux';
import { addVehicle, validateVehicle } from 'common/reducers/transportResources';
import { loadVehicles } from 'common/reducers/transportDispatch';

const FormItem = Form.Item;
const Option = Select.Option;

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

@connect(state => ({
  tenantId: state.account.tenantId,
  vehicles: state.transportDispatch.vehicles,
  vehicleValidate: state.transportResources.vehicleValidate,

}), { addVehicle, validateVehicle, loadVehicles })

class VehicleFormMini extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,              // 对应于antd中的form对象
    vehicleValidate: PropTypes.bool,                // 表示车牌号是否可用
    onVehicleNumberBlur: PropTypes.func,            // 车牌号改变执行的回调函数
    vehicles: PropTypes.object.isRequired,              // 对应于antd中的form对象
    car: PropTypes.object,                          // 编辑的车辆信息, 只有在mode='edit'时才需要
  };
  state = {
    visible: false,
  }
  componentDidMount() {

  }
  componentWillReceiveProps(nextProps) {
    this.setState({ visible: nextProps.visible });
  }
  handleCancel = () => {
    this.setState({ visible: false });
  }
  handleCarSave = () => {
    const { form, tenantId, vehicles } = this.props;
    const newCarInfo = form.getFieldsValue();
    this.props.addVehicle({ ...newCarInfo, tenant_id: tenantId }).then(result => {
      if (result.error) {
        message.error(result.error.message, 5);
      } else {
        this.props.loadVehicles(null, {
          tenantId,
          pageSize: vehicles.pageSize,
          current: 1,
        }).then(addResult => {
          this.setState({ visible: false });
          if (addResult.error) {
            message.error(addResult.error.message, 5);
          }
        });
      }
    });
  }
  handleVehicleNumberBlur = (e) => {
    const vehicleNumber = e.target.value;
    const { tenantId } = this.props;
    this.props.validateVehicle(tenantId, vehicleNumber);
  }
  render() {
    const { form, vehicleValidate } = this.props;
    const getFieldProps = form.getFieldProps;
    return (
      <Modal visible={this.state.visible} title="新增车辆"
        onOk={this.handleCarSave} onCancel={this.handleCancel}
      >
        <Form className="">
          <FormItem label="车牌号:" required {...formItemLayout}
            validateStatus={vehicleValidate ? '' : 'error'}
            help={vehicleValidate ? '' : '该车辆已存在'}
          >
            <Input {...getFieldProps('plate_number')} required onBlur={this.handleVehicleNumberBlur} />
          </FormItem>
          <FormItem label="车型:" required {...formItemLayout}>
            <Select {...getFieldProps('type')} required>
            {
              VEHICLE_TYPES.map(vt => <Option value={vt.value} key={vt.value}>{vt.text}</Option>)
            }
            </Select>
          </FormItem>
          <FormItem label="车长:" required {...formItemLayout}>
            <Select {...getFieldProps('length')} required>
            {
              VEHICLE_LENGTH_TYPES.map(vlt => <Option value={vlt.value} key={vlt.value}>{vlt.text}</Option>)
            }
            </Select>
          </FormItem>
          <FormItem label="额定载重:" required {...formItemLayout}>
            <Input type="number" {...getFieldProps('load_weight')} addonAfter="吨" required />
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default Form.create()(VehicleFormMini);
