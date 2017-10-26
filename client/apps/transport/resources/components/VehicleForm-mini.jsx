import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Select, Input, Modal, message } from 'antd';
import { connect } from 'react-redux';
import { addVehicle, validateVehicle, loadVehicleParams } from 'common/reducers/transportResources';
import { loadVehicles } from 'common/reducers/transportDispatch';

const FormItem = Form.Item;
const Option = Select.Option;

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

@connect(
  state => ({
    tenantId: state.account.tenantId,
    vehicles: state.transportDispatch.vehicles,
    vehicleValidate: state.transportResources.vehicleValidate,
    vehicleParams: state.transportResources.vehicleParams,
  }),
  { addVehicle, validateVehicle, loadVehicles, loadVehicleParams }
)
class VehicleFormMini extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,              // 对应于antd中的form对象
    vehicleValidate: PropTypes.bool,                // 表示车牌号是否可用
    onVehicleNumberBlur: PropTypes.func,            // 车牌号改变执行的回调函数
    vehicles: PropTypes.object.isRequired,              // 对应于antd中的form对象
    car: PropTypes.object,                          // 编辑的车辆信息, 只有在mode='edit'时才需要
    loadVehicleParams: PropTypes.func.isRequired,
  };
  state = {
    visible: false,
  }
  componentDidMount() {
    this.props.loadVehicleParams(this.props.tenantId);
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
    this.props.addVehicle({ ...newCarInfo, tenant_id: tenantId }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 5);
      } else {
        this.props.loadVehicles(null, {
          tenantId,
          pageSize: vehicles.pageSize,
          current: 1,
        }).then((addResult) => {
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
    const { form, vehicleValidate, vehicleParams } = this.props;
    const getFieldDecorator = form.getFieldDecorator;
    return (
      <Modal maskClosable={false} visible={this.state.visible} title="新增车辆"
        onOk={this.handleCarSave} onCancel={this.handleCancel}
      >
        <Form className="">
          <FormItem label="车牌号:" required {...formItemLayout}
            validateStatus={vehicleValidate ? '' : 'error'}
            help={vehicleValidate ? '' : '该车辆已存在'}
          >
            {getFieldDecorator('plate_number')(<Input required onBlur={this.handleVehicleNumberBlur} />)}
          </FormItem>
          <FormItem label="车型:" required {...formItemLayout}>
            {getFieldDecorator('type')(<Select required>
              {
              vehicleParams.types.map(vt => <Option value={vt.value} key={vt.value}>{vt.text}</Option>)
            }
            </Select>)}
          </FormItem>
          <FormItem label="车长:" required {...formItemLayout}>
            {getFieldDecorator('length')(<Select required>
              {
              vehicleParams.lengths.map(vlt => <Option value={vlt.value} key={vlt.value}>{vlt.text}</Option>)
            }
            </Select>)}
          </FormItem>
          <FormItem label="额定载重:" required {...formItemLayout}>
            {getFieldDecorator('load_weight')(<Input type="number" addonAfter="吨" required />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default Form.create()(VehicleFormMini);
