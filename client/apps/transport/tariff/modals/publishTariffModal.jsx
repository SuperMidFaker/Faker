import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, message, Input, Modal, DatePicker, Select, Alert } from 'antd';
import { publishTariff, showPublishTariffModal } from 'common/reducers/transportTariff';
import { TARIFF_KINDS } from 'common/constants';
const FormItem = Form.Item;
const Option = Select.Option;


@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    visible: state.transportTariff.publishTariffModal.visible,
    agreement: state.transportTariff.agreement,
    loginName: state.account.username,
  }),
  { publishTariff, showPublishTariffModal }
)
@Form.create()
export default class PublishTariffModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    tariffForm: PropTypes.object.isRequired,
    tenantId: PropTypes.number.isRequired,
    visible: PropTypes.bool.isRequired,
    publishTariff: PropTypes.func.isRequired,
    showPublishTariffModal: PropTypes.func.isRequired,
    agreement: PropTypes.object.isRequired,
    loginName: PropTypes.string.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }

  handleOk = () => {
    this.props.form.validateFields((errors) => {
      if (!errors) {
        const formData = this.props.form.getFieldsValue();
        const tariffFormData = this.props.tariffForm.getFieldsValue();
        const { effectiveType, effectiveDate, publishCommit } = formData;
        const { partnerPermission, adjustCoefficient } = tariffFormData;
        const { id, quoteNo } = this.props.agreement;
        const { tenantId, loginName } = this.props;

        this.props.publishTariff({
          tariffId: id,
          loginName,
          quoteNo, tenantId, effectiveType, effectiveDate, publishCommit, partnerPermission, adjustCoefficient,
        }).then((result) => {
          if (result.error) {
            message.error(result.error.message);
          } else {
            message.info('发布成功');
            this.handleCancel();
            this.context.router.push('/transport/billing/tariff?kind=all&status=current');
          }
        });
      }
    });
  }
  handleCancel = () => {
    this.props.showPublishTariffModal(false);
  }

  render() {
    const { form: { getFieldDecorator } } = this.props;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    };
    return (
      <Modal title="发布" onCancel={this.handleCancel} onOk={this.handleOk}
        visible={this.props.visible} maskClosable={false}
      >
        <Form className="row" >
          <Alert message="报价发布后将按设置的生效时间起重新计费" type="info" showIcon />
          <FormItem label="基准日期类型" {...formItemLayout}>
            {getFieldDecorator('effectiveType', {
              rules: [{ required: true, message: '基准日期类型必选', type: 'number' }],
            })(<Select >
              {
                TARIFF_KINDS.map(
                  (tk, idx) =>
                    <Option value={idx} key={tk.value}>{TARIFF_KINDS[idx].text}</Option>
                )
              }
            </Select>)}
          </FormItem>
          <FormItem label="生效起始时间" {...formItemLayout}>
            {getFieldDecorator('effectiveDate', {
              rules: [{ required: true, message: '生效起始时间必选', type: 'object' }],
            })(
              <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
            )}
          </FormItem>
          <FormItem label="备注" {...formItemLayout}>
            {getFieldDecorator('publishCommit', {
              rules: [{ required: true, message: '备注必填' }],
            })(
              <Input type="textarea" row={3} />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
