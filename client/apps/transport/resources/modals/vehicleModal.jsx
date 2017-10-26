import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Form, Select, Input, Modal } from 'antd';
import { loadVehicleParams, loadDriverList, toggleVehicleModal, validateVehicle, addVehicle,
editVehicle } from 'common/reducers/transportResources';
import withPrivilege from 'client/common/decorators/withPrivilege';

const FormItem = Form.Item;
const Option = Select.Option;

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

@connect(
  state => ({
    tenantId: state.account.tenantId,
    vehicleParams: state.transportResources.vehicleParams,
    visible: state.transportResources.vehicleModal.visible,
    operation: state.transportResources.vehicleModal.operation,
    vehicle: state.transportResources.vehicleModal.vehicle,
    drivers: state.transportResources.drivers,
    vehicleValidate: state.transportResources.vehicleValidate,
  }),
  { loadVehicleParams, loadDriverList, toggleVehicleModal, validateVehicle, addVehicle, editVehicle }
)
@withPrivilege({
  module: 'transport',
  feature: 'resources',
  action: props => props.mode === 'edit' ? 'edit' : 'create',
})
@Form.create()
export default class VehicleModal extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,              // 对应于antd中的form对象
    drivers: PropTypes.array,                       // 可选司机列表
    vehicleValidate: PropTypes.bool,                // 表示车牌号是否可用
    tenantId: PropTypes.number.isRequired,
    vehicleParams: PropTypes.shape({
      types: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.number.isRequired,
        text: PropTypes.string.isRequired,
      })),
      lenghts: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.number.isRequired,
        text: PropTypes.string.isRequired,
      })),
    }),
    validateVehicle: PropTypes.func,            // 车牌号改变执行的回调函数
    loadVehicleParams: PropTypes.func.isRequired,
    visible: PropTypes.bool.isRequired,
    operation: PropTypes.string.isRequired,         // mode='add' 表示新增车辆, mode='edit'表示编辑某个车辆信息
    vehicle: PropTypes.object.isRequired,
    loadDriverList: PropTypes.func.isRequired,
    toggleVehicleModal: PropTypes.func.isRequired,
    addVehicle: PropTypes.func.isRequired,
    editVehicle: PropTypes.func.isRequired,
  }
  componentDidMount() {
    this.props.loadVehicleParams(this.props.tenantId);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && nextProps.drivers.length === 0) {
      this.props.loadDriverList(this.props.tenantId);
    }
  }
  onVehicleNumberBlur = (e) => {
    const { tenantId } = this.props;
    this.props.validateVehicle(tenantId, e.target.value);
  }
  handleSave = () => {
    const { form, tenantId } = this.props;
    const newCarInfo = form.getFieldsValue();
    this.props.addVehicle({ ...newCarInfo, tenant_id: tenantId }).then(() => {
      this.handleCancel();
    });
  }
  handleEdit = () => {
    const { form, vehicle } = this.props;
    const editCarInfo = form.getFieldsValue();
    delete editCarInfo.vehicle_id;
    const carId = parseInt(vehicle.vehicle_id, 10);
    this.props.editVehicle({ carId, carInfo: editCarInfo }).then(() => {
      this.handleCancel();
    });
  }
  handleCancel = () => {
    this.props.form.resetFields();
    this.props.toggleVehicleModal(false);
  }
  handleOk = () => {
    const { operation } = this.props;
    if (operation === 'add') {
      this.handleSave();
    } else if (operation === 'edit') {
      this.handleEdit();
    }
  }
  render() {
    const { visible, operation, form, drivers, vehicleParams, vehicleValidate, vehicle } = this.props;
    const getFieldDecorator = form.getFieldDecorator;
    const driversOptions = drivers ? drivers.map(driver =>
      <Option value={driver.driver_id} key={driver.driver_id}>{driver.name}</Option>
    ) : '';
    const numberValidate = operation === 'edit' || vehicleValidate;
    return (
      <Modal maskClosable={false} visible={visible} onCancel={this.handleCancel} onOk={this.handleOk}>
        <Form layout="horizontal">
          <FormItem label="车牌号"
            required
            validateStatus={numberValidate ? '' : 'error'}
            help={numberValidate ? '' : '该车辆已存在'}
            {...formItemLayout}
          >
            {getFieldDecorator('plate_number', {
              initialValue: vehicle.plate_number,
            })(
              <Input required disabled={operation === 'edit'} onBlur={e => this.onVehicleNumberBlur(e)} />
            )}
          </FormItem>
          <FormItem label="挂车牌号" {...formItemLayout}>
            {getFieldDecorator('trailer_number', {
              initialValue: vehicle.trailer_number,
            })(<Input />)}
          </FormItem>
          <FormItem label="车型" required {...formItemLayout}>
            {getFieldDecorator('type', {
              initialValue: vehicle.type,
            })(<Select required>
              {
              vehicleParams.types.map(vt => <Option value={vt.value} key={vt.value}>{vt.text}</Option>)
            }
            </Select>)}
          </FormItem>
          <FormItem label="车长" required {...formItemLayout}>
            {getFieldDecorator('length', {
              initialValue: vehicle.length,
            })(<Select required>
              {
              vehicleParams.lengths.map(vlt => <Option value={vlt.value} key={vlt.value}>{vlt.text}</Option>)
            }
            </Select>)}
          </FormItem>
          <FormItem label="额定载重" required {...formItemLayout}>
            {getFieldDecorator('load_weight', {
              initialValue: vehicle.load_weight,
            })(<Input type="number" addonAfter="吨" required />)}
          </FormItem>
          <FormItem label="额定体积" {...formItemLayout}>
            {getFieldDecorator('load_volume', {
              initialValue: vehicle.load_volume,
            })(<Input type="number" addonAfter="立方米" />)}
          </FormItem>
          <FormItem label="车辆所有权" {...formItemLayout} required>
            {getFieldDecorator('vproperty', {
              initialValue: vehicle.vproperty,
            })(<Select required>
              <Option value={0}>社会协作车辆</Option>
              <Option value={1}>公司自有车辆</Option>
            </Select>)}
          </FormItem>
          <FormItem label="指派司机" {...formItemLayout}>
            {getFieldDecorator('driver_id', {
              initialValue: vehicle.driver_id,
            })(<Select>
              {drivers && driversOptions}
            </Select>)}
          </FormItem>
          <FormItem label="备注" {...formItemLayout}>
            {getFieldDecorator('remark', {
              initialValue: vehicle.remark,
            })(<Input.TextArea />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
