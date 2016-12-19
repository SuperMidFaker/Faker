import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Steps, Modal, message, Form, Select, DatePicker } from 'antd';
import { closeTrialModal, trialQuote } from 'common/reducers/cmsQuote';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const Option = Select.Option;
const Step = Steps.Step;
const RangePicker = DatePicker.RangePicker;
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
    visible: state.cmsQuote.trialModalVisible,
  }),
  { closeTrialModal, trialQuote }
)
@Form.create()
export default class TrialModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    form: PropTypes.object.isRequired,
    quoteForm: PropTypes.object.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    curStep: 1,
  }
  handleCancel = () => {
    this.props.closeTrialModal();
  }
  handleBeginTrial = () => {
    this.props.form.validateFields((errors) => {
      if (!errors) {
        const quoteData = {
          ...this.props.quoteData,
          ...this.props.quoteForm.getFieldsValue(),
          ...this.props.form.getFieldsValue(),
        };
        quoteData.basement_timestamp = quoteData.basement_date.valueOf();
        quoteData.basement_date = undefined;
        const prom = this.props.publishQuote(quoteData);
        prom.then((result) => {
          if (result.error) {
            message.error(result.error.message, 10);
          } else {
            this.props.closeTrialModal();
          }
        });
      }
    });
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  render() {
    const { form: { getFieldDecorator }, visible } = this.props;
    const { curStep } = this.state;
    let footer;
    if (curStep === 1) {
      footer = [
        <Button key="cancel" type="ghost" size="large" onClick={this.handleCancel}>取消</Button>,
        <Button key="start" size="large" onClick={this.handleBeginTrial}>开始</Button>,
      ];
    } else if (curStep === 2) {
      footer = [
        <Button key="cancel" type="ghost" size="large" onClick={this.handleCancel}>取消</Button>,
        <Button key="next" size="large" onClick={this.handleTrialNext}>下一步</Button>,
      ];
    } else if (curStep === 3) {
      footer = [
        <Button key="cancel" type="ghost" size="large" onClick={this.handleCancel}>取消</Button>,
        <Button key="download" size="large" onClick={this.handleDownload}>下载</Button>,
      ];
    }
    return (
      <Modal title={this.msg('trialTitle')} visible={visible}
        footer={footer}
      >
        <Steps current={curStep}>
          <Step title="选择范围" />
          <Step title="计算费用" />
          <Step title="下载结果" />
        </Steps>
        <Form horizontal>
          <FormItem label={this.msg('basementDateType')} {...formItemLayout}>
            {getFieldDecorator('basement_datetype', {
              rules: [{ required: true, message: '基准时间类型必选' }],
            })(
              <Select style={{ width: '100%' }}>
                <Option value="accept" key="accept1">接单时间</Option>
                <Option value="clean" key="clean2">海关放行时间</Option>
              </Select>
            )}
          </FormItem>
          <FormItem label={this.msg('basementDate')} {...formItemLayout}>
            {getFieldDecorator('basement_date', {
              rules: [{ required: true, message: '基准时间必选', type: 'object' }],
            })(
              <RangePicker showTime format="YYYY-MM-DD HH:mm" />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

