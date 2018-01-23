import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { message, Button, Form, Input, Col, Icon, Switch } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { upsertOrderType } from 'common/reducers/sofOrderPref';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;

function ExtFieldFormItem(props) {
  const {
    ext, type, label, formData, onChange,
  } = props;
  function handleExtTitleChange(ev) {
    onChange(ext, 'title', ev.target.value);
  }
  function handleExtEnableChange(checked) {
    onChange(ext, 'enabled', checked);
  }
  function handleExtRequiredChange(checked) {
    onChange(ext, 'required', checked);
  }
  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 6 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 18 },
    },
  };
  return (
    <FormItem label={label} {...formItemLayout}>
      <Col span={16}>
        <FormItem>
          <Input placeholder="显示名称" addonBefore={<Icon type={type} />} value={formData.title} onChange={handleExtTitleChange} />
        </FormItem>
      </Col>
      <Col span={3} offset={1}>
        <FormItem>
          <Switch checkedChildren="启用" unCheckedChildren="关闭" checked={!!formData.enabled} onChange={handleExtEnableChange} />
        </FormItem>
      </Col>
      <Col span={4}>
        <FormItem>
          <Switch checkedChildren="必填" unCheckedChildren="可选" checked={!!formData.required} onChange={handleExtRequiredChange} />
        </FormItem>
      </Col>
    </FormItem>
  );
}

@injectIntl
@connect(
  state => ({
    orderType: state.sofOrderPref.orderTypeModal.orderType,
  }),
  { upsertOrderType }
)
export default class FieldsForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    orderType: PropTypes.shape({ id: PropTypes.number }),
  }
  state = {
    ext1_params: {},
    ext2_params: {},
    ext3_params: {},
    ext4_params: {},
    ext5_params: {},
    ext6_params: {},
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.orderType && nextProps.orderType.id) {
      this.setState({
        ext1_params: nextProps.orderType.ext1_params ?
          JSON.parse(nextProps.orderType.ext1_params) : {},
        ext2_params: nextProps.orderType.ext2_params ?
          JSON.parse(nextProps.orderType.ext2_params) : {},
        ext3_params: nextProps.orderType.ext3_params ?
          JSON.parse(nextProps.orderType.ext3_params) : {},
        ext4_params: nextProps.orderType.ext4_params ?
          JSON.parse(nextProps.orderType.ext4_params) : {},
        ext5_params: nextProps.orderType.ext5_params ?
          JSON.parse(nextProps.orderType.ext5_params) : {},
        ext6_params: nextProps.orderType.ext6_params ?
          JSON.parse(nextProps.orderType.ext6_params) : {},
      });
    } else {
      this.setState({
        ext1_params: {},
        ext2_params: {},
        ext3_params: {},
        ext4_params: {},
        ext5_params: {},
        ext6_params: {},
      });
    }
  }
  msg = formatMsg(this.props.intl)
  handleExtFieldChange = (ext, field, value) => {
    const state = { ...this.state };
    state[ext][field] = value;
    this.setState(state);
  }
  handleSave = () => {
    const { orderType } = this.props;
    if (!orderType.id) {
      message.error('订单类型未配置');
      return;
    }
    this.props.upsertOrderType({
      id: orderType.id,
      ext1_params: JSON.stringify(this.state.ext1_params),
      ext2_params: JSON.stringify(this.state.ext2_params),
      ext3_params: JSON.stringify(this.state.ext3_params),
      ext4_params: JSON.stringify(this.state.ext4_params),
      ext5_params: JSON.stringify(this.state.ext5_params),
      ext6_params: JSON.stringify(this.state.ext6_params),
    }).then((result) => {
      if (!result.error) {
        message.success('保存成功');
      }
    });
  }
  render() {
    return (
      <Form layout="horizontal">
        <ExtFieldFormItem label={this.msg('extField1')} type="form" ext="ext1_params" formData={this.state.ext1_params} onChange={this.handleExtFieldChange} />
        <ExtFieldFormItem label={this.msg('extField2')} type="form" ext="ext2_params" formData={this.state.ext2_params} onChange={this.handleExtFieldChange} />
        <ExtFieldFormItem label={this.msg('extField3')} type="form" ext="ext3_params" formData={this.state.ext3_params} onChange={this.handleExtFieldChange} />
        <ExtFieldFormItem label={this.msg('extField4')} type="form" ext="ext4_params" formData={this.state.ext4_params} onChange={this.handleExtFieldChange} />
        <ExtFieldFormItem label={this.msg('extField5')} type="calendar" ext="ext5_params" formData={this.state.ext5_params} onChange={this.handleExtFieldChange} />
        <ExtFieldFormItem label={this.msg('extField6')} type="calendar" ext="ext6_params" formData={this.state.ext6_params} onChange={this.handleExtFieldChange} />
        <FormItem>
          <Button type="primary" icon="save" onClick={this.handleSave}>{this.msg('save')}</Button>
        </FormItem>
      </Form>
    );
  }
}
