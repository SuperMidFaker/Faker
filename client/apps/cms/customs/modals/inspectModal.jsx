import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Switch, Col, DatePicker, Form, Modal, Input } from 'antd';
import { toggleInspectModal } from 'common/reducers/cmsCustomsDeclare';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    visible: state.cmsCustomsDeclare.inspectModal.visible,
  }),
  { toggleInspectModal }
)
export default class InspectModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
  }
  state = {
    entryNo: '',
  }
  handleCancel = () => {
    this.props.toggleInspectModal(false);
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
        title={this.msg('查验')}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <Form>
          <FormItem label="海关编号" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }} hasFeedback={entryNo.length === 18} {...validate}>
            <Input onChange={this.handleEntryNoChange} value={this.state.entryNo} />
          </FormItem>
          <FormItem label="查验下达日期" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
            <DatePicker
              onChange={this.handleStartDateChange}
              format="YYYY-MM-DD"
              style={{ width: '100%' }}
            />
          </FormItem>
          <FormItem label="查验完成日期" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
            <DatePicker
              onChange={this.handleFinishDateChange}
              format="YYYY-MM-DD"
              style={{ width: '100%' }}
            />
          </FormItem>
          <FormItem label="海关查验" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
            <Col span={6}>
              <Switch checkedChildren="是" unCheckedChildren="否" />
            </Col>
            <Col span={18}>
              <Input placeholder="收费金额" onChange={this.handleEntryNoChange} addonAfter="元" />
            </Col>
          </FormItem>
          <FormItem label="质检查验" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
            <Col span={6}>
              <Switch checkedChildren="是" unCheckedChildren="否" />
            </Col>
            <Col span={18}>
              <Input placeholder="收费金额" onChange={this.handleEntryNoChange} addonAfter="元" />
            </Col>
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
