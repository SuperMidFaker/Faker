import React, { Component, PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import { DECL_I_TYPE, DECL_E_TYPE, TRANS_MODE, TARIFF_KINDS } from 'common/constants';
import { Form, Select, Col, Row, Card } from 'antd';

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
    fieldInits: getFieldInits(state.cmsQuote.quoteData),
  }),
)
export default class FeesForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    partners: PropTypes.array.isRequired,
    clients: PropTypes.array.isRequired,
    fieldInits: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired,
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
  render() {
    const { form: { getFieldProps }, fieldInits } = this.props;
    const { coops, disBase } = this.state;
    const msg = key => formatMsg(this.props.intl, key);
    const DECL_TYPE = DECL_I_TYPE.concat(DECL_E_TYPE);
    return (
      <Card bodyStyle={{ padding: 16 }}>
        <Row>
          <Col sm={5}>
            <FormItem label={msg('tariffKinds')} {...formItemLayout}>
              <Select style={{ width: '80%' }} onSelect={this.handleKindSelect}
                {...getFieldProps('tariff_kind', {
                  rules: [{ required: true, message: '报价类型必选' }],
                  initialValue: fieldInits.tariff_kind,
                })}
              >
              {
                TARIFF_KINDS.map(qt =>
                  <Option value={qt.value} key={qt.value}>{qt.text}</Option>
                )
              }
              </Select>
            </FormItem>
          </Col>
          <Col sm={5}>
            <FormItem label={msg('partners')} {...formItemLayout}>
              <Select showSearch showArrow optionFilterProp="searched"
                style={{ width: '80%' }} disabled={disBase}
                {...getFieldProps('partner.name', {
                  rules: [{ required: true, message: '必选' }],
                  getValueFromEvent: this.handleClientChange,
                  initialValue: fieldInits.partner.name,
                })}
              >
              {
                coops.map(pt => (
                  <Option searched={`${pt.partner_code}${pt.name}`}
                    value={pt.partner_id} key={pt.partner_id}
                  >{pt.name}</Option>)
                )
              }
              </Select>
            </FormItem>
          </Col>
          <Col sm={5}>
            <FormItem label={msg('declareWay')} {...formItemLayout}>
              <Select multiple style={{ width: '80%' }} placeholder="不限"
                {...getFieldProps('decl_way_code', {
                  rules: [{ required: true, message: '报关类型必选', type: 'array' }],
                  initialValue: fieldInits.decl_way_code,
                })}
              >
              {
                DECL_TYPE.map(dw =>
                  <Option value={dw.key} key={dw.key}>{dw.value}</Option>
                )
              }
              </Select>
            </FormItem>
          </Col>
          <Col sm={5}>
            <FormItem label={msg('transMode')} {...formItemLayout}>
              <Select multiple style={{ width: '80%' }} placeholder="不限"
                {...getFieldProps('trans_mode', {
                  rules: [{ required: true, message: '运输方式必选', type: 'array' }],
                  initialValue: fieldInits.trans_mode,
                })}
              >
              {
                TRANS_MODE.map(tr =>
                  <Option value={tr.value} key={tr.value}>{tr.text}</Option>
                )
              }
              </Select>
            </FormItem>
          </Col>
          <Col sm={4}>
            <FormItem label={msg('remark')} {...formItemLayout}>
              <Select tags style={{ width: '80%' }}
                {...getFieldProps('remarks', {
                  initialValue: fieldInits.remarks,
                })}
              >
              </Select>
            </FormItem>
          </Col>
        </Row>
      </Card>
    );
  }
}
