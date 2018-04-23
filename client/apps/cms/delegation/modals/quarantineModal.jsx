import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Switch, Form, Modal, Input } from 'antd';
import { toggleQuarantineModal } from 'common/reducers/cmsDelegation';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    visible: state.cmsDelegation.quarantineModal.visible,
  }),
  { toggleQuarantineModal }
)
export default class QuarantineModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
  }
  handleCancel = () => {
    this.props.toggleQuarantineModal(false);
  }
  handleOk = () => {
  }
  msg = formatMsg(this.props.intl)
  render() {
    const { visible } = this.props;
    return (
      <Modal
        maskClosable={false}
        title={this.msg('检疫查验')}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <Form>
          <FormItem label="检疫查验" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
            <Switch checkedChildren="是" unCheckedChildren="否" />
          </FormItem>
          <FormItem label="收费金额" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
            <Input onChange={this.handleEntryNoChange} addonAfter="元" />
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
