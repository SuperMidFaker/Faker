import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Steps, Modal, Form, Select, DatePicker, Progress } from 'antd';
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
    trialBegin: state.cmsQuote.trialBegin,
  }),
  { closeTrialModal, trialQuote }
)
@Form.create()
export default class TrialModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    trialBegin: PropTypes.bool.isRequired,
    form: PropTypes.object.isRequired,
    quoteForm: PropTypes.object.isRequired,
  }
  state = {
    curStep: 0,
    progressPercent: 0,
    progressStatus: 'active',
    trialFilename: '',
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.trialBegin === true && this.props.trialBegin === false) {
      this.setState({
        curStep: 1,
        progressPercent: 30,
      });
    }
  }
  handleCancel = () => {
    this.props.closeTrialModal();
    this.setState({
      curStep: 0,
      progressPercent: 0,
      progressStatus: 'active',
    });
  }
  handleBeginTrial = () => {
    this.props.form.validateFields((errors) => {
      if (!errors) {
        const quoteData = {
          ...this.props.quoteData,
          ...this.props.quoteForm.getFieldsValue(),
          ...this.props.form.getFieldsValue(),
        };
        quoteData.basement_range_start = quoteData.basement_date[0].valueOf();
        quoteData.basement_range_end = quoteData.basement_date[1].valueOf();
        quoteData.basement_date = undefined;
        const prom = this.props.trialQuote(quoteData);
        prom.then((result) => {
          if (result.error) {
            this.setState({ progressStatus: 'exception', progressPercent: 70 });
          } else {
            this.setState({
              progressStatus: 'success',
              progressPercent: 100,
              trialFilename: result.data.filename,
              trialFileurl: result.data.fileurl,
            });
          }
        });
      }
    });
  }
  handleTrialNext = () => {
    this.setState({
      curStep: 2,
    });
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  render() {
    const { form: { getFieldDecorator }, visible } = this.props;
    const {
      curStep, progressStatus, progressPercent, trialFilename, trialFileurl,
    } = this.state;
    let footer;
    let stepContent;
    if (curStep === 0) {
      footer = [
        <Button key="cancel" type="ghost" onClick={this.handleCancel}>取消</Button>,
        <Button key="start" type="primary" onClick={this.handleBeginTrial}>开始</Button>,
      ];
      stepContent = (
        <Form layout="horizontal">
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
              rules: [{ required: true, message: '基准时间必选', type: 'array' }],
            })(<RangePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />)}
          </FormItem>
        </Form>
      );
    } else if (curStep === 1) {
      footer = [
        <Button key="cancel" type="ghost" onClick={this.handleCancel}>取消</Button>,
        <Button key="next" type="primary" onClick={this.handleTrialNext} disabled={!trialFilename}>下一步</Button>,
      ];
      stepContent = (
        <Progress type="circle" percent={progressPercent} status={progressStatus} width={80} />
      );
    } else if (curStep === 2) {
      footer = [
        <Button key="cancel" type="ghost" onClick={this.handleCancel}>取消</Button>,
        <a href={trialFileurl} target="_blank" rel="noopener noreferrer">
          <Button key="download" type="primary" >下载</Button>
        </a>,
      ];
      stepContent = trialFilename;
    }
    return (
      <Modal maskClosable={false} title={this.msg('trialTitle')} visible={visible} footer={footer} closable={false}>
        <Steps current={curStep}>
          <Step title="选择范围" />
          <Step title="计算费用" />
          <Step title="下载结果" />
        </Steps>
        <div style={{
          marginTop: '20px',
          border: '1px dashed #e9e9e9',
          borderRadius: '6px',
          textAlign: 'center',
          paddingTop: '10px',
          paddingRight: '10px',
          minHeight: '60px',
        }}
        >
          {stepContent}
        </div>
      </Modal>
    );
  }
}

