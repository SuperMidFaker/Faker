import React, { Component, PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import { submitQuotes } from 'common/reducers/cmsQuote';
import { DECL_I_TYPE, DECL_E_TYPE, TRANS_MODE, TARIFF_KINDS, INVOICE_TYPE } from 'common/constants';
import { Card, Form, Select, Col, Row, Button, message } from 'antd';

const formatMsg = format(messages);
const Option = Select.Option;
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};
function getFieldInits(quoteData) {
  const init = {};
  if (quoteData) {
    init.tariff_kind = quoteData.tariff_kind || '';
    init.invoice_type = quoteData.invoice_type;
    init.partner = quoteData.partner || {};
    [
      'decl_way_code', 'trans_mode', 'remarks',
    ].forEach((qd) => {
      init[qd] = quoteData[qd] || [];
    });
  }
  return init;
}
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    partners: state.cmsQuote.partners,
    clients: state.cmsQuote.clients,
    loginId: state.account.loginId,
    loginName: state.account.username,
    quoteData: state.cmsQuote.quoteData,
    fieldInits: getFieldInits(state.cmsQuote.quoteData),
  }),
  { submitQuotes }
)
export default class FeesForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    partners: PropTypes.array.isRequired,
    clients: PropTypes.array.isRequired,
    fieldInits: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired,
    action: PropTypes.string.isRequired,
    submitQuotes: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    addFee: {},
    addedit: false,
    coops: [],
    disBase: false,
  };
  handleClientChange = (value) => {
    if (typeof value === 'string') {
      return value;
    }
    const selPartnerId = Number(value);
    const partners = this.state.coops.filter(cl => cl.partner_id === selPartnerId);
    if (partners.length === 1) {
      const partner = partners[0];
      return partner.name;
    }
    return value;
  }
  handleKindSelect = (value) => {
    const tariffKind = value;
    if (tariffKind === 'sales') {
      this.setState({ coops: this.props.clients, disBase: false });
    } else if (tariffKind === 'cost') {
      this.setState({ coops: this.props.partners, disBase: false });
    } else {
      this.setState({ disBase: true });
    }
  }
  handleSave = () => {
    const quoteData = {
      ...this.props.quoteData,
      ...this.props.form.getFieldsValue(),
    };
    if (quoteData.partner.name) {
      const coops = this.props.partners.concat(this.props.clients);
      const selpartners = coops.filter(
        pt => pt.name === quoteData.partner.name);
      quoteData.partner.id = selpartners[0].partner_id;
    }
    quoteData.tenantId = this.props.tenantId;
    quoteData.valid = true;
    quoteData.modifyById = this.props.loginId;
    quoteData.modifyBy = this.props.loginName;
    quoteData.modify_count = (this.props.quoteData.modify_count || 0) + 1;
    const prom = this.props.submitQuotes(quoteData);
    prom.then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        message.info('保存成功', 5);
      }
    });
  }
  render() {
    const { form: { getFieldDecorator }, fieldInits, action } = this.props;
    const { coops, disBase } = this.state;
    const msg = key => formatMsg(this.props.intl, key);
    const DECL_TYPE = DECL_I_TYPE.concat(DECL_E_TYPE);
    return (
      <Card title={(action === 'edit') && <span>{this.props.quoteData.quote_no}</span>} bodyStyle={{ padding: 24 }}
        extra={(action === 'edit') && <Button size="small" type="primary" style={{ marginLeft: 40 }} icon="save" onClick={this.handleSave} >{msg('save')}</Button>}
      >
        <Row>
          <Col sm={8} md={8}>
            <FormItem label={msg('tariffKinds')} {...formItemLayout}>
              {getFieldDecorator('tariff_kind', {
                rules: [{ required: true, message: '报价类型必选' }],
                initialValue: fieldInits.tariff_kind,
              })(
                <Select style={{ width: '100%' }} onSelect={this.handleKindSelect} >
                  {
                  TARIFF_KINDS.map(qt =>
                    <Option value={qt.value} key={qt.value}>{qt.text}</Option>
                  )
                }
                </Select>
              )}
            </FormItem>
          </Col>
          <Col sm={8} md={12}>
            <FormItem label={msg('declareWay')} labelCol={{ span: 3 }} wrapperCol={{ span: 21 }}>
              {getFieldDecorator('decl_way_code', {
                rules: [{ required: true, message: '报关类型必选', type: 'array' }],
                initialValue: fieldInits.decl_way_code,
              })(
                <Select multiple style={{ width: '100%' }} placeholder="不限" >
                  {
                  DECL_TYPE.map(dw =>
                    <Option value={dw.key} key={dw.key}>{dw.value}</Option>
                  )
                }
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col sm={8} md={8}>
            <FormItem label={msg('partners')} {...formItemLayout}>
              {getFieldDecorator('partner.name', {
                rules: [{ required: true, message: '必选' }],
                getValueFromEvent: this.handleClientChange,
                initialValue: fieldInits.partner.name,
              })(
                <Select showSearch showArrow optionFilterProp="searched"
                  style={{ width: '100%' }} disabled={disBase}
                >
                  {
                  coops.map(pt => (
                    <Option searched={`${pt.partner_code}${pt.name}`}
                      value={pt.partner_id} key={pt.partner_id}
                    >{pt.partner_unique_code ? `${pt.partner_unique_code} | ${pt.name}` : pt.name}</Option>)
                  )
                }
                </Select>
              )}
            </FormItem>
          </Col>
          <Col sm={8} md={12}>
            <FormItem label={msg('transMode')} labelCol={{ span: 3 }} wrapperCol={{ span: 21 }} >
              {getFieldDecorator('trans_mode', {
                rules: [{ required: true, message: '运输方式必选', type: 'array' }],
                initialValue: fieldInits.trans_mode,
              })(
                <Select multiple style={{ width: '100%' }} placeholder="不限" >
                  {
                  TRANS_MODE.map(tr =>
                    <Option value={tr.value} key={tr.value}>{tr.text}</Option>
                  )
                }
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col sm={8} md={8}>
            <FormItem label={msg('invoiceType')} {...formItemLayout} >
              {getFieldDecorator('invoice_type', {
                rules: [{ required: true, message: '开票类型必选', type: 'number' }],
                initialValue: fieldInits.invoice_type,
              })(
                <Select style={{ width: '100%' }} >
                  {
                  INVOICE_TYPE.map(inv =>
                    <Option value={inv.value} key={inv.value}>{inv.text}</Option>
                  )
                }
                </Select>
              )}
            </FormItem>
          </Col>
          <Col sm={8} md={12}>
            <FormItem label={msg('remark')} labelCol={{ span: 3 }} wrapperCol={{ span: 21 }}>
              {getFieldDecorator('remarks', {
                initialValue: fieldInits.remarks,
              })(<Select tags style={{ width: '100%' }} />)}
            </FormItem>
          </Col>
        </Row>
      </Card>
    );
  }
}
