import React, { Component, PropTypes } from 'react';
import { Form, Button, Input } from 'antd';
import Cascader from 'client/components/region-cascade';

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

export default class CarForm extends Component {
  componentDidMount() {
    const { node, form, mode, region, changeRegion } = this.props;
    const setFieldsValue = form.setFieldsValue;
    if (mode === 'edit') {
      setFieldsValue(node);
      const [code, province, city, district, street] = region;
      changeRegion({ province, city, district, region_code: code, street });
    }
  }
  render() {
    const { mode, form, onSubmitBtnClick, onRegionChange, region } = this.props;
    const getFieldProps = form.getFieldProps;
    const regionValues = region || [];
    return (
      <Form horizontal onSubmit={onSubmitBtnClick} className="form-edit-content offset-right-col" style={this.props.style}>
        <FormItem label="名称:" required {...formItemLayout}>
          <Input {...getFieldProps('name')} required />
        </FormItem>
        <FormItem label="外部代码:" {...formItemLayout}>
          <Input {...getFieldProps('node_code')} />
        </FormItem>
        <FormItem label="区域" {...formItemLayout}>
          <Cascader region={regionValues} onChange={onRegionChange} />
        </FormItem>
        <FormItem label="具体地址:" required {...formItemLayout}>
          <Input {...getFieldProps('addr')} required />
        </FormItem>
        <FormItem label="联系人:" {...formItemLayout} required>
          <Input {...getFieldProps('contact')} />
        </FormItem>
        <FormItem label="手机号:" {...formItemLayout} required>
          <Input {...getFieldProps('mobile')} required />
        </FormItem>
        <FormItem label="邮箱:" {...formItemLayout}>
          <Input {...getFieldProps('email')} />
        </FormItem>
        <FormItem label="备注:" {...formItemLayout}>
          <Input type="textarea" {...getFieldProps('remark')} />
        </FormItem>
        <FormItem wrapperCol={{ span: 16, offset: 6 }} style={{ marginTop: 24 }}>
          <Button type="primary" htmlType="submit">{mode === 'add' ? '创建' : '修改'}</Button>
        </FormItem>
      </Form>
    );
  }
}

CarForm.propTypes = {
  mode: PropTypes.string.isRequired,              // mode='add' 表示新增车辆, mode='edit'表示编辑某个车辆信息
  onSubmitBtnClick: PropTypes.func.isRequired,    // 创建按钮点击时执行的回调函数
  form: PropTypes.object.isRequired,              // 对应于antd中的form对象
  node: PropTypes.object,                         // 编辑的节点信息, 只有在mode='edit'时才需要
  onRegionChange: PropTypes.func.isRequired,      // 区域级联选项改变时执行的回调函数
  region: PropTypes.array,                        // 可选,编辑模式下才需要,表示区域信息对象,用于Cascader控件的展示信息
  changeRegion: PropTypes.func,                   // 可选,编辑模式下更改当前被选中的省市区
};
