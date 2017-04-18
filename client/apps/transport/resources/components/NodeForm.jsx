import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form, Button, Input, Select } from 'antd';
import withPrivilege from 'client/common/decorators/withPrivilege';
import Cascader from 'client/components/region-cascade';

const FormItem = Form.Item;
const Option = Select.Option;

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

@connect(state => ({
  partners: state.shipment.partners.concat([{
    partner_code: '',
    name: '公用',
    partner_id: -1,
  }]),
}), { })
@withPrivilege({
  module: 'transport', feature: 'resources',
  action: props => props.mode === 'edit' ? 'edit' : 'create',
})
export default class NodeForm extends Component {
  static propTypes = {
    mode: PropTypes.string.isRequired,              // mode='add' 表示新增车辆, mode='edit'表示编辑某个车辆信息
    onSubmitBtnClick: PropTypes.func.isRequired,    // 创建按钮点击时执行的回调函数
    form: PropTypes.object.isRequired,              // 对应于antd中的form对象
    node: PropTypes.object,                         // 编辑的节点信息, 只有在mode='edit'时才需要
    onRegionChange: PropTypes.func.isRequired,      // 区域级联选项改变时执行的回调函数
    region: PropTypes.array,                        // 可选,编辑模式下才需要,表示区域信息对象,用于Cascader控件的展示信息
    changeRegion: PropTypes.func,                   // 可选,编辑模式下更改当前被选中的省市区
    partners: PropTypes.array.isRequired,
  }
  componentDidMount() {
    const { node, form, mode, region, changeRegion } = this.props;
    const setFieldsValue = form.setFieldsValue;
    if (mode === 'edit') {
      setFieldsValue(node);
      const [province, city, district, street] = region;
      changeRegion({ province, city, district, street });
    }
  }
  render() {
    const { mode, form, onSubmitBtnClick, onRegionChange, region, partners } = this.props;
    const getFieldDecorator = form.getFieldDecorator;
    const regionValues = region || [];
    return (
      <Form horizontal onSubmit={onSubmitBtnClick} className={mode === 'edit' ? 'form-edit-content offset-right-col' : ''} style={this.props.style}>
        <FormItem label="名称:" required {...formItemLayout}>
          {getFieldDecorator('name')(<Input required />)}
        </FormItem>
        <FormItem label="关联方:" required {...formItemLayout}>
          {getFieldDecorator('ref_partner_id')(
            <Select id="select"
              showSearch
              placeholder=""
              optionFilterProp="children"
              notFoundContent=""
            >
              {
                partners.map(pt => (
                  <Option searched={`${pt.partner_code}${pt.name}`}
                    value={pt.partner_id} key={pt.partner_id}
                  >
                    {pt.partner_code ? `${pt.partner_code} | ${pt.name}` : pt.name}
                  </Option>)
                )
              }
            </Select>
            )}
        </FormItem>
        <FormItem label="外部代码:" {...formItemLayout}>
          {getFieldDecorator('node_code')(<Input />)}
        </FormItem>
        <FormItem label="区域" {...formItemLayout}>
          <Cascader defaultRegion={regionValues} onChange={onRegionChange} />
        </FormItem>
        <FormItem label="具体地址:" required {...formItemLayout}>
          {getFieldDecorator('addr')(<Input required />)}
        </FormItem>
        <FormItem label="联系人:" {...formItemLayout} required>
          {getFieldDecorator('contact')(<Input />)}
        </FormItem>
        <FormItem label="手机号:" {...formItemLayout} required>
          {getFieldDecorator('mobile')(<Input required />)}
        </FormItem>
        <FormItem label="邮箱:" {...formItemLayout}>
          {getFieldDecorator('email')(<Input />)}
        </FormItem>
        <FormItem label="备注:" {...formItemLayout}>
          {getFieldDecorator('remark')(<Input type="textarea" />)}
        </FormItem>
        {mode === 'edit' && (
          <FormItem wrapperCol={{ span: 16, offset: 6 }} style={{ marginTop: 24 }}>
            <Button type="primary" htmlType="submit">{mode === 'add' ? '创建' : '修改'}</Button>
          </FormItem>)}
      </Form>
    );
  }
}
