import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Button, Col, Form, Modal, Row, message, Select, Radio } from 'antd';
import { toggleApplyInvoiceModal, createInvoice } from 'common/reducers/bssInvoice';
import { INVOICE_TYPE } from 'common/constants';
import { formatMsg, formatGlobalMsg } from '../message.i18n';


const { Option } = Select;
const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;


@injectIntl
@connect(
  state => ({
    visible: state.bssInvoice.applyInvoiceModal.visible,
    partners: state.partner.partners,
  }),
  {
    toggleApplyInvoiceModal, createInvoice,
  }
)
@Form.create()
export default class ApplyInvoiceModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    partners: [],
  }

  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  handleCancel = () => {
    this.props.toggleApplyInvoiceModal(false);
  }
  handleOk = () => {
    this.props.form.validateFields((errors) => {
      if (!errors) {
        const { beginDate, endDate } = this.state;
        const begin = moment(beginDate).format('YYYY-MM-DD HH:mm:ss');
        const end = moment(endDate).format('YYYY-MM-DD HH:mm:ss');
        const formVal = this.props.form.getFieldsValue();
        const templateId = Number.isNaN(formVal.template_id) ? null : Number(formVal.template_id);
        this.props.createBill({
          bill_title: formVal.bill_title,
          bill_type: formVal.bill_type,
          template_id: templateId,
          partner_id: Number(formVal.partner_id),
          start_date: begin,
          end_date: end,
        }).then((result) => {
          if (result.error) {
            message.error(result.error.message, 5);
          } else {
            this.props.toggleApplyInvoiceModal(false);
          }
        });
      }
    });
  }

  render() {
    const { visible, form: { getFieldDecorator } } = this.props;
    const {
      partners,
    } = this.state;
    const title = (<div>
      <span>{this.msg('applyInvoice')}</span>
      <div className="toolbar-right">
        <Button onClick={this.handleCancel}>{this.gmsg('cancel')}</Button>
        <Button type="primary" onClick={this.handleManualAllocSave}>{this.gmsg('save')}</Button>
      </div>
    </div>);
    return (
      <Modal
        maskClosable={false}
        title={title}
        width="100%"
        wrapClassName="fullscreen-modal"
        closable={false}
        visible={visible}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" className="layout-fixed-width">
          <Row gutter={24}>
            <Col span={12}>
              <FormItem label={this.msg('customer')}>
                {getFieldDecorator('partner_id', {
              rules: [{ required: true, message: '客户必选' }],
            })(<Select
              showSearch
              showArrow
              optionFilterProp="children"
              style={{ width: '100%' }}
              onChange={this.handlePartnerChange}
            >
              { partners.map(pt => (
                <Option
                  value={String(pt.id)}
                  key={String(pt.id)}
                >{pt.partner_code ? `${pt.partner_code} | ${pt.name}` : pt.name}
                </Option>))
              }
            </Select>)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label={this.msg('invoiceType')}>
                {getFieldDecorator('invoice_type', {
              rules: [{ required: true, message: '发票类型必选' }],
            })(<RadioGroup onChange={this.handleTypeSelect}>
              {
                INVOICE_TYPE.map(qt =>
                  <RadioButton value={qt.key} key={qt.key}>{qt.text}</RadioButton>)
              }
            </RadioGroup>)}
              </FormItem>
            </Col>
          </Row>
        </Form>

      </Modal>
    );
  }
}
