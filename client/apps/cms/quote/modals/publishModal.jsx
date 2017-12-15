import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Alert, Input, Modal, message, Form, Select, DatePicker } from 'antd';
import { closePublishModal, publishQuote } from 'common/reducers/cmsQuote';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const Option = Select.Option;
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    quoteData: state.cmsQuote.quoteData,
    loginId: state.account.loginId,
    loginName: state.account.username,
    visible: state.cmsQuote.publishModalVisible,
  }),
  { closePublishModal, publishQuote }
)
@Form.create()
export default class CreateQtModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    form: PropTypes.object.isRequired,
    quoteForm: PropTypes.object.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  handleCancel = () => {
    this.props.closePublishModal();
  }
  handleOk = () => {
    this.props.form.validateFields((errors) => {
      if (!errors) {
        const quoteData = {
          ...this.props.quoteData,
          ...this.props.quoteForm.getFieldsValue(),
          ...this.props.form.getFieldsValue(),
        };
        quoteData.basement_timestamp = quoteData.basement_date.valueOf();
        quoteData.basement_date = undefined;
        const { loginId, loginName } = this.props;
        const prom = this.props.publishQuote(quoteData, loginName, loginId);
        prom.then((result) => {
          if (result.error) {
            if (result.error.message === 'similar quote') {
              message.error('相同客户或供应商清关运输类型报价已发布', 10);
            } else {
              message.error(result.error.message, 10);
            }
          } else {
            message.info('发布成功', 5);
            this.props.closePublishModal();
            this.context.router.push('/clearance/billing/quote');
          }
        });
      }
    });
  }
  disabledBasementDate = current => current && current.valueOf() > Date.now()
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  render() {
    const { form: { getFieldDecorator }, visible } = this.props;
    return (
      <Modal maskClosable={false} title={this.msg('publishTitle')} visible={visible}
        onOk={this.handleOk} onCancel={this.handleCancel}
      >
        <Form layout="horizontal">
          <Alert message="报价发布后将按设置的生效时间起重新计费" type="info" showIcon />
          <FormItem label={this.msg('basementDateType')} {...formItemLayout}>
            {getFieldDecorator('basement_datetype', {
              rules: [{ required: true, message: '基准时间类型必选' }],
            })(<Select style={{ width: '100%' }}>
              <Option value="accept" key="accept1">接单时间</Option>
              <Option value="clean" key="clean2">海关放行时间</Option>
            </Select>)}
          </FormItem>
          <FormItem label={this.msg('basementDate')} {...formItemLayout}>
            {getFieldDecorator('basement_date', {
              rules: [{ required: true, message: '基准时间必选', type: 'object' }],
            })(<DatePicker showTime format="YYYY-MM-DD HH:mm" disabledDate={this.disabledBasementDate} />)}
          </FormItem>
          <FormItem label={this.msg('publishRemark')} {...formItemLayout}>
            {getFieldDecorator('publish_commit', {
              rules: [{ required: true, message: '备注必填' }],
            })(<Input.TextArea row={3} />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
