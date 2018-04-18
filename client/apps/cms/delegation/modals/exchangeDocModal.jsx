import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { DatePicker, Form, Modal, Input } from 'antd';
import { toggleExchangeDocModal } from 'common/reducers/cmsDelegation';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    visible: state.cmsDelegation.exchangeDocModal.visible,
  }),
  { toggleExchangeDocModal }
)
export default class ExchangeDocModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
  }
  state = {
    entryNo: '',
  }
  handleCancel = () => {
    this.props.toggleExchangeDocModal(false);
  }
  handleOk = () => {
  }
  msg = formatMsg(this.props.intl)
  render() {
    const { visible } = this.props;
    const { validateStatus, entryNo } = this.state;
    let validate = null;
    if (entryNo.length === 18) {
      validate = { validateStatus };
    }
    return (
      <Modal
        maskClosable={false}
        title={this.msg('换单')}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <Form>
          <FormItem label="提单号" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }} hasFeedback={entryNo.length === 18} {...validate}>
            <Input onChange={this.handleEntryNoChange} value={this.state.entryNo} />
          </FormItem>
          <FormItem label="提货单号" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }} hasFeedback={entryNo.length === 18} {...validate}>
            <Input onChange={this.handleEntryNoChange} value={this.state.entryNo} />
          </FormItem>
          <FormItem label="换单日期" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
            <DatePicker
              onChange={this.handleStartDateChange}
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
              showTime
            />
          </FormItem>
          <FormItem label="换单费金额" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
            <Input onChange={this.handleEntryNoChange} />
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
