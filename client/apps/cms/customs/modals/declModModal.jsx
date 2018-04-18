import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Select, DatePicker, Form, Modal, Input } from 'antd';
import { CMS_DECL_MOD_TYPE } from 'common/constants';
import { toggleDeclModModal } from 'common/reducers/cmsCustomsDeclare';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;
const { Option } = Select;

@injectIntl
@connect(
  state => ({
    visible: state.cmsCustomsDeclare.declModModal.visible,
  }),
  { toggleDeclModModal }
)
export default class DeclModModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
  }
  state = {
    entryNo: '',
  }
  handleCancel = () => {
    this.props.toggleDeclModModal(false);
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
        title={this.msg('declMod')}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <Form>
          <FormItem label="海关编号" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }} hasFeedback={entryNo.length === 18} {...validate}>
            <Input onChange={this.handleEntryNoChange} value={this.state.entryNo} disabled />
          </FormItem>
          <FormItem label="修撤业务类型" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
            <Select
              allowClear
              onChange={this.handleStartDateChange}
              style={{ width: '100%' }}
            >
              {CMS_DECL_MOD_TYPE.map(item => (
                <Option key={item.value} value={item.value}>
                  {item.text}
                </Option>))}
            </Select>
          </FormItem>
          <FormItem label="操作日期" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
            <DatePicker
              onChange={this.handleFinishDateChange}
              format="YYYY-MM-DD"
              style={{ width: '100%' }}
            />
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
