
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Input, Modal, Form, Alert } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
import { closeBatchMoveModal, batchMove } from 'common/reducers/cwmTransition';
import LocationSelect from 'client/apps/cwm/common/locationSelect';

const formatMsg = format(messages);
const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    visible: state.cwmTransition.batchMoveModal.visible,
  }),
  { closeBatchMoveModal, batchMove }
)
export default class BatchMoveModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    data: PropTypes.array.isRequired,
  }
  state = {
  }
  msg = key => formatMsg(this.props.intl, key);
  handleCancel = () => {
    this.props.closeBatchMoveModal();
    this.setState({
      location: '',
    });
  }

  handleSubmit = () => {
  }
  render() {
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 12 },
    };
    return (
      <Modal title="批量移库" onCancel={this.handleCancel} visible={this.props.visible} onOk={this.handleSubmit} okText="创建移库单">
        <Alert message="已选择 项 库存数量总计" type="info" />
        <FormItem {...formItemLayout} label="目标库位">
          <LocationSelect style={{ width: 160 }} onSelect={this.handleLocationChange} value={this.state.location} showSearch />
        </FormItem>
        <FormItem {...formItemLayout} label="移库原因" >
          <Input />
        </FormItem>
      </Modal>
    );
  }
}
