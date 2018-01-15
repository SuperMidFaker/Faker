import React, { Component } from 'react';
import { Alert, Modal, Form, Input } from 'antd';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { togglePermitItemModal, addPermitModel, loadPermitModels } from 'common/reducers/cmsPermit';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const FromItem = Form.Item;
@injectIntl
@connect(
  state => ({
    visible: state.cmsPermit.permitItemModal.visible,
  }),
  { togglePermitItemModal, addPermitModel, loadPermitModels }
)
export default class PermitItemModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    permitId: PropTypes.number.isRequired,
  }
  state = {
    model: '',
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  handleCancel = () => {
    this.props.togglePermitItemModal(false);
    this.setState({
      model: '',
    });
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
      <Modal title={this.msg('addModel')} visible={visible} onCancel={this.handleCancel} onOk={this.handleOk}>
        <Alert message="若无特定型号可填写星号: *" type="info" />
        <FromItem label={this.msg('model')} {...formItemLayout}>
          <Input value={model} placeholder="例: MODEL-1234XXX (X代表字母、数字或空白)" onChange={this.handleChange} />
        </FromItem>
      </Modal>
    );
  }
}
