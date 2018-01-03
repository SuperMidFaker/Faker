import React, { Component } from 'react';
import { Alert, Modal, Form, Input } from 'antd';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { togglePermitItemModal, addPermitModel, loadPermitModels } from 'common/reducers/cmsPermit';

const FromItem = Form.Item;

@connect(
  state => ({
    visible: state.cmsPermit.permitItemModal.visible,
  }),
  { togglePermitItemModal, addPermitModel, loadPermitModels }
)
export default class PermitItemModal extends Component {
  static propTypes = {
    permitId: PropTypes.number.isRequired,
  }
  state = {
    model: '',
  }
  handleCancel = () => {
    this.props.togglePermitItemModal(false);
  }
  handleChange = (e) => {
    this.setState({
      model: e.target.value,
    });
  }
  handleOk = () => {
    const { permitId } = this.props;
    const { model } = this.state;
    this.props.addPermitModel(permitId, model).then((result) => {
      if (!result.error) {
        this.props.loadPermitModels(permitId);
        this.handleCancel();
      }
    });
  }
  render() {
    const { visible } = this.props;
    const { model } = this.state;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    return (
      <Modal title="添加型号系列" visible={visible} onCancel={this.handleCancel} onOk={this.handleOk}>
        <Alert message="若无特定型号可填写星号: *" type="info" />
        <FromItem label="型号" {...formItemLayout}>
          <Input value={model} placeholder="例: MODEL-1234XXX (X代表字母、数字或空白)" onChange={this.handleChange} />
        </FromItem>
      </Modal>
    );
  }
}
