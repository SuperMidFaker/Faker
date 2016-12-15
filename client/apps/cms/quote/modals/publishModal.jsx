import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, message, Form, Select, DatePicker } from 'antd';
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
        const { loginId, loginName } = this.props;
        const prom = this.props.publishQuote(quoteData, loginName, loginId);
        prom.then((result) => {
          if (result.error) {
            message.error(result.error.message, 10);
          } else {
            message.info('发布成功', 5);
            this.props.closePublishModal();
            this.context.router.push('/clearance/billing/quote');
          }
        });
      }
    });
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  render() {
    const { form: { getFieldDecorator }, visible } = this.props;
    return (
      <Modal title={this.msg('publishQuote')} visible={visible}
        onOk={this.handleOk} onCancel={this.handleCancel}
      >
        <div>
          <FormItem label={this.msg('basementDateType')} {...formItemLayout}>
            {getFieldDecorator('tariff_kind', {
              rules: [{ required: true, message: '时间类型必选', type: 'number' }],
            })(
              <Select style={{ width: '100%' }} onSelect={this.handleKindSelect}>
                <Option value={1} key="accept">接单时间</Option>
                <Option value={2} key="clean">海关放行时间</Option>
              </Select>
            )}
          </FormItem>
          <FormItem label={this.msg('baseDate')} {...formItemLayout}>
            {getFieldDecorator('partner.name', {
              rules: [{ required: true, message: '必选', type: 'object' }],
            })(
              <DatePicker />
            )}
          </FormItem>
        </div>
      </Modal>
    );
  }
}

