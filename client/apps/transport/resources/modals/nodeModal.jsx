import React, { Component, PropTypes } from 'react';
import { Form, Input, Modal, message } from 'antd';
import { connect } from 'react-redux';
import withPrivilege from 'client/common/decorators/withPrivilege';
import Cascader from 'client/components/region-cascade';
import { addNode, toggleNodeModal } from 'common/reducers/transportResources';

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};
@connect(state => ({
  tenantId: state.account.tenantId,
  visible: state.transportResources.nodeModal.visible,
  nodeType: state.transportResources.nodeType,
}), {
  addNode, toggleNodeModal,
})
@withPrivilege({
  module: 'transport', feature: 'resources',
  action: () => 'create',
})
@Form.create()
export default class NodeModal extends Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    form: PropTypes.object.isRequired,              // 对应于antd中的form对象
    addNode: PropTypes.func.isRequired,
    toggleNodeModal: PropTypes.func.isRequired,
    nodeType: PropTypes.number.isRequired,
  }
  state = {
    region: {
      province: '',
      city: '',
      district: '',
      street: '',
      region_code: '',
    },
  }
  handleAddNode = () => {
    const { form, nodeType, tenantId } = this.props;
    const { region } = this.state;
    if (!region.province && !region.city && !region.district && !region.street) {
      message.warn('区域必填');
    } else {
      const nodeInfoInForm = form.getFieldsValue();
      const nodeInfo = Object.assign({}, nodeInfoInForm, { ...region, type: nodeType, tenant_id: tenantId });
      this.props.addNode(nodeInfo).then((result) => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          this.handleCancel();
        }
      });
    }
  }
  handleCancel = () => {
    this.props.toggleNodeModal(false);
    this.props.form.resetFields();
  }
  handleRegionChange = (value) => {
    const [code, province, city, district, street] = value;
    const region = Object.assign({}, { region_code: code, province, city, district, street });
    this.setState({ region });
  }
  render() {
    const { form, visible } = this.props;
    const getFieldDecorator = form.getFieldDecorator;
    const regionValues = [];
    return (
      <Modal visible={visible} onOk={this.handleAddNode} onCancel={this.handleCancel}>
        <Form layout="horizontal">
          <FormItem label="名称:" required {...formItemLayout}>
            {getFieldDecorator('name')(<Input required />)}
          </FormItem>
          <FormItem label="外部代码:" {...formItemLayout}>
            {getFieldDecorator('node_code')(<Input />)}
          </FormItem>
          <FormItem label="区域" {...formItemLayout} required >
            <Cascader defaultRegion={regionValues} onChange={this.handleRegionChange} required />
          </FormItem>
          <FormItem label="具体地址:" {...formItemLayout}>
            {getFieldDecorator('addr')(<Input />)}
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
        </Form>
      </Modal>
    );
  }
}
