import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, message } from 'antd';
import { connect } from 'react-redux';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { addNode, toggleNodeModal } from 'common/reducers/transportResources';
import NodeForm from '../components/NodeForm';

@connect(state => ({
  tenantId: state.account.tenantId,
  visible: state.transportResources.nodeModal.visible,
  nodeType: state.transportResources.nodeType,
  partners: state.shipment.partners,
}), {
  addNode, toggleNodeModal,
})
@withPrivilege({
  module: 'transport',
  feature: 'resources',
  action: () => 'create',
})
@Form.create()
export default class NodeModal extends Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    form: PropTypes.object.isRequired, // 对应于antd中的form对象
    addNode: PropTypes.func.isRequired,
    toggleNodeModal: PropTypes.func.isRequired,
    nodeType: PropTypes.number.isRequired,
    partners: PropTypes.array.isRequired,
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
    const nodeInfoInForm = form.getFieldsValue();
    if (!region.province && !region.city && !region.district && !region.street) {
      message.warn('区域必填');
    } else if (nodeInfoInForm.ref_partner_id === undefined) {
      message.warn('关联方必填');
    } else {
      const refPartner = this.props.partners.find(item => item.partner_id === nodeInfoInForm.ref_partner_id);
      const nodeInfo = Object.assign({}, nodeInfoInForm, {
        ...region, type: nodeType, tenant_id: tenantId, ref_partner_name: refPartner ? refPartner.name : '',
      });
      this.props.addNode(nodeInfo).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
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
    const region = Object.assign({}, {
      region_code: code, province, city, district, street,
    });
    this.setState({ region });
  }
  render() {
    const { form, visible } = this.props;
    return (
      <Modal maskClosable={false} visible={visible} onOk={this.handleAddNode} onCancel={this.handleCancel}>
        <NodeForm mode="add"
          form={form}
          onRegionChange={this.handleRegionChange}
          onSubmitBtnClick={this.handleAddNode}
        />
      </Modal>
    );
  }
}
