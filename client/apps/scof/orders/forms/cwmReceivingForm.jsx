import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Form, Row, Col, Card, DatePicker, Input, Select, Radio } from 'antd';
import { setClientForm, loadFlowNodeData } from 'common/reducers/crmOrders';
import { uuidWithoutDash } from 'client/common/uuid';
import { CWM_ASN_TYPES, CWM_ASN_BONDED_REGTYPES } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const FormItem = Form.Item;
const Option = Select.Option;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

@injectIntl
@connect(
  state => ({
    recParams: state.scofFlow.cwmParams,
  }),
  { setClientForm, loadFlowNodeData }
)
export default class CwmReceivingForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    index: PropTypes.number.isRequired,
    operation: PropTypes.oneOf(['view', 'edit', 'create']),
    formRequires: PropTypes.object.isRequired,
    formData: PropTypes.object.isRequired,
    setClientForm: PropTypes.func.isRequired,
  }
  componentDidMount() {
    const { formData } = this.props;
    const node = formData.node;
    if (!node.uuid && node.node_uuid) {
      this.props.loadFlowNodeData(node.node_uuid, node.kind).then((result) => {
        if (!result.error) {
          this.handleSetClientForm({ ...result.data, uuid: uuidWithoutDash() });
        }
      });
    }
  }
  msg = key => formatMsg(this.props.intl, key)
  handleSetClientForm = (data) => {
    const { index, formData } = this.props;
    const newData = { ...formData, node: { ...formData.node, ...data } };
    this.props.setClientForm(index, newData);
  }
  handleCommonFieldChange = (filed, value) => {
    this.handleSetClientForm({ [filed]: value });
  }
  handleBondedChange = (ev) => {
    if (ev.target.value) {
      this.handleSetClientForm({ bonded: ev.target.value });
    } else {
      this.handleSetClientForm({
        bonded: ev.target.value,
        bonded_reg_type: null,
        rec_after_decl_days: '',
        expected_receive_date: null,
      });
    }
  }

  render() {
    const { recParams, formData } = this.props;
    const node = formData.node;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    };
    const whseCode = node.t_whse_code || (node.whse_code ? `${node.wh_ent_tenant_id}-${node.whse_code}` : '');
    // todo required
    return (
      <Card hoverable={false} bodyStyle={{ padding: 16 }}>
        <Row gutter={16}>
          <Col sm={24} lg={8}>
            <FormItem label="仓库" {...formItemLayout} required>
              <Select showSearch allowClear optionFilterProp="children" value={whseCode}
                onChange={value => this.handleCommonFieldChange('t_whse_code', value)}
              >
                {recParams.whses.map(wh =>
                  <Option key={`${wh.wh_ent_tenant_id}-${wh.code}`} value={`${wh.wh_ent_tenant_id}-${wh.code}`}>{wh.code}|{wh.name}</Option>)}
              </Select>
            </FormItem>
          </Col>
          <Col sm={24} lg={8}>
            <FormItem label="供应商" {...formItemLayout}>
              <Input value={node.supplier} onChange={ev => this.handleCommonFieldChange('supplier', ev.target.value)} />
            </FormItem>
          </Col>
          <Col sm={24} lg={8}>
            <FormItem label="ASN类型" {...formItemLayout}>
              <Select placeholder="ASN类型" value={node.asn_type} onChange={value => this.handleCommonFieldChange('asn_type', value)}>
                {CWM_ASN_TYPES.map(cat => <Option value={cat.value} key={cat.value}>{cat.text}</Option>)}
              </Select>
            </FormItem>
          </Col>
          <Col sm={24} lg={8}>
            <FormItem label="货物属性" {...formItemLayout}>
              <RadioGroup onChange={this.handleBondedChange} value={node.bonded}>
                <RadioButton value={0}>非保税</RadioButton>
                <RadioButton value={1}>保税</RadioButton>
              </RadioGroup>
            </FormItem>
          </Col>
        </Row>
        <Row gutter={20}>
          {node.bonded &&
            <Col sm={24} lg={8}>
              <FormItem label="保税监管方式" {...formItemLayout}>
                <RadioGroup value={node.bonded_reg_type}
                  onChange={ev => this.handleCommonFieldChange('bonded_reg_type', ev.target.value)}
                >
                  {CWM_ASN_BONDED_REGTYPES.map(cabr => <RadioButton value={cabr.value} key={cabr.value}>{cabr.ftztext}</RadioButton>)}
                </RadioGroup>
              </FormItem>
            </Col>
          }
          {node.bonded_reg_type === CWM_ASN_BONDED_REGTYPES[0].value &&
          <Col sm={24} lg={8}>
            <FormItem label="保税入库预期收货日期" {...formItemLayout}>
              <Input addonBefore="晚于申报日期" addonAfter="天" value={node.rec_after_decl_days}
                onChange={ev => this.handleCommonFieldChange('rec_after_decl_days', ev.target.value)}
              />
            </FormItem>
          </Col>}
          {node.bonded_reg_type !== CWM_ASN_BONDED_REGTYPES[0].value &&
          <Col sm={24} lg={8}>
            <FormItem label="预期收货日期" {...formItemLayout}>
              <DatePicker format="YYYY/MM/DD" style={{ width: '100%' }}
                value={node.expect_receive_date && moment(node.expect_receive_date)}
                onChange={expectDate => this.handleCommonFieldChange('expect_receive_date', expectDate && expectDate.valueOf())}
              />
            </FormItem>
          </Col>
          }
        </Row>
      </Card>
    );
  }
}
