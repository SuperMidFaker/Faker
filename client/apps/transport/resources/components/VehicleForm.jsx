import React, { Component, PropTypes } from 'react';
import { Form, Button, Select, Input } from 'ant-ui';
import ContentWrapper from './ContentWrapper';
import { VEHICLE_TYPES, VEHICLE_LENGTH_TYPES } from 'common/constants';

const FormItem = Form.Item;
const Option = Select.Option;

const formItemLayout = {
  labelCol: {span: 6},
  wrapperCol: {span: 14}
};

export default class VehicleForm extends Component {
  componentDidMount() {
    const { car, form, mode } = this.props;
    const setFieldsValue = form.setFieldsValue;
    if (mode === 'edit') {
      setFieldsValue(car);
    }
  }
  render() {
    const { mode, form, drivers, onSubmitBtnClicked, vehicleValidate, onVehicleNumberBlur } = this.props;
    const getFieldProps = form.getFieldProps;
    const driversOptions = drivers ? drivers.map(driver =>
      <Option value={driver.driver_id} key={driver.driver_id}>{driver.name}</Option>
    ) : '';

    return (
      <ContentWrapper>
        <Form horizontal onSubmit={onSubmitBtnClicked} className="form-edit-content offset-right-col">
          <FormItem label="车牌号:"
                    required
                    validateStatus={vehicleValidate ? '' : 'error'}
                    help={vehicleValidate ? '' : '该车辆已存在'}
            {...formItemLayout}>
            <Input {...getFieldProps('plate_number')} required disabled={mode === 'edit'} onBlur={(e) => onVehicleNumberBlur(e)}/>
          </FormItem>
          <FormItem label="挂车牌号:" {...formItemLayout}>
            <Input {...getFieldProps('trailer_number')}/>
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
            <Input type="number" {...getFieldProps('load_weight')} addonAfter="吨" required/>
          </FormItem>
          <FormItem label="额定体积:" {...formItemLayout}>
            <Input type="number" {...getFieldProps('load_volume')} addonAfter="立方米" />
          </FormItem>
          <FormItem label="车辆所有权:" {...formItemLayout} required>
            <Select {...getFieldProps('vproperty')} required>
              <Option value={0}>社会协作车辆</Option>
              <Option value={1}>公司自有车辆</Option>
            </Select>
          </FormItem>
          <FormItem label="指派司机:" {...formItemLayout}>
            <Select {...getFieldProps('driver_id')}>
              { drivers && driversOptions }
            </Select>
          </FormItem>
          <FormItem label="备注:" {...formItemLayout}>
            <Input type="textarea" {...getFieldProps('remark')}/>
          </FormItem>
          <FormItem wrapperCol={{span: 16, offset: 6}} style={{marginTop: 24}}>
            <Button type="primary" htmlType="submit" disabled={!vehicleValidate}>{mode === 'add' ? '创建' : '修改'}</Button>
          </FormItem>
        </Form>
      </ContentWrapper>
    );
  }
}

VehicleForm.propTypes = {
  mode: PropTypes.string.isRequired,              // mode='add' 表示新增车辆, mode='edit'表示编辑某个车辆信息
  onSubmitBtnClicked: PropTypes.func.isRequired,  // 创建按钮点击时执行的回调函数
  form: PropTypes.object.isRequired,              // 对应于antd中的form对象
  drivers: PropTypes.array,                       // 可选司机列表
  car: PropTypes.object,                          // 编辑的车辆信息, 只有在mode='edit'时才需要
  vehicleValidate: PropTypes.bool,                // 表示车牌号是否可用
  onVehicleNumberBlur: PropTypes.func,            // 车牌号改变执行的回调函数
};
