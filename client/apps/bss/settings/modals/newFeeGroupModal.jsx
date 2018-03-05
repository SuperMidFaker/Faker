import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, Modal, Input, message } from 'antd';
import { toggleNewFeeGroupModal, addFeeGroup, loadFeeGroups } from 'common/reducers/bssSettings';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 14 },
};

@injectIntl
@connect(
  state => ({
    visible: state.bssSettings.visibleNewFeeGModal,
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
  }),
  { toggleNewFeeGroupModal, addFeeGroup, loadFeeGroups }
)
export default class NewFeeGroupModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
  }
  state = {
    groupCode: '',
    groupName: '',
  }
  msg = formatMsg(this.props.intl)
  handleCancel = () => {
    this.props.toggleNewFeeGroupModal(false);
  }
  handleOk = () => {
    const { groupCode, groupName } = this.state;
    const { tenantId, loginId } = this.props;
    this.props.addFeeGroup({
      groupCode,
      groupName,
      tenantId,
      loginId,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 5);
      } else {
        this.props.toggleNewFeeGroupModal(false);
        this.props.loadFeeGroups({ tenantId });
      }
    });
  }

  render() {
    const { visible } = this.props;
    const { groupCode, groupName } = this.state;
    return (
      <Modal
        maskClosable={false}
        title={this.msg('newFeeGroup')}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <Form>
          <FormItem label="分组代码" {...formItemLayout} >
            <Input onChange={e => this.setState({ groupCode: e.target.value })} value={groupCode} />
          </FormItem>
          <FormItem label="分组名称" {...formItemLayout}>
            <Input onChange={e => this.setState({ groupName: e.target.value })} value={groupName} />
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
