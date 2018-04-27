import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Switch, Form, Modal, Input } from 'antd';
import { toggleQuarantineModal, updateQuarantineAmount } from 'common/reducers/cmsDelegation';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    visible: state.cmsDelegation.quarantineModal.visible,
  }),
  { toggleQuarantineModal, updateQuarantineAmount }
)
@Form.create()
export default class QuarantineModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
  }
  state = {
    checked: false,
  }
  handleCancel = () => {
    this.props.toggleQuarantineModal(false);
    this.setState({
      checked: false,
    });
  }
  handleOk = () => {
    this.props.form.validateFields((errors, values) => {
      if (!errors) {
        this.props.updateQuarantineAmount(
          this.props.delgNo,
          values.quarantine_amount,
        ).then((result) => {
          if (!result.error) {
            this.handleCancel();
            this.props.handleReload();
          }
        });
      }
    });
  }
  msg = formatMsg(this.props.intl)
  handleSwitch = (checked) => {
    this.setState({
      checked,
    });
  }
  render() {
    const { visible, form: { getFieldDecorator } } = this.props;
    const { checked } = this.state;
    return (
      <Modal
        maskClosable={false}
        title={this.msg('检疫查验')}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        destroyOnClose
      >
        <Form>
          <FormItem label="检疫查验" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
            <Switch checkedChildren="是" unCheckedChildren="否" checked={checked} onChange={this.handleSwitch} />
          </FormItem>
          <FormItem label="收费金额" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
            {getFieldDecorator('quarantine_amount', {
              rules: [{ required: true, message: '金额必填' }],
            })(<Input addonAfter="元" disabled={!checked} />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
