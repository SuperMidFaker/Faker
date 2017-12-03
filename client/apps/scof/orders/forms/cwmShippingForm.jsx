import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Form, Row, Col, Card, DatePicker, Input, Select, Radio } from 'antd';
import { setClientForm, loadFlowNodeData } from 'common/reducers/crmOrders';
import { uuidWithoutDash } from 'client/common/uuid';
import { CWM_SO_TYPES, CWM_SO_BONDED_REGTYPES } from 'common/constants';
import { Logixon } from 'client/components/FontIcon';
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
export default class CwmSoForm extends Component {
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
        ship_after_decl_days: null,
        expected_shipping_date: null,
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
    return (
      <Card title={<Logixon type="shipping" />} hoverable={false} bodyStyle={{ padding: 16 }}>
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
            <FormItem label="SO类型" {...formItemLayout}>
              <Select placeholder="SO类型" value={node.so_type} onChange={value => this.handleCommonFieldChange('so_type', value)}>
                {CWM_SO_TYPES.map(cat => <Option value={cat.value} key={cat.value}>{cat.text}</Option>)}
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
        <Row gutter={16}>
          {node.bonded &&
            <Col sm={24} lg={8}>
              <FormItem label="保税监管方式" {...formItemLayout}>
                <Select value={node.bonded_reg_type}
                  onChange={value => this.handleCommonFieldChange('bonded_reg_type', value)}
                >
                  {CWM_SO_BONDED_REGTYPES.map(cabr => <Option value={cabr.value} key={cabr.value}>{cabr.ftztext || cabr.text}</Option>)}
                </Select>
              </FormItem>
            </Col>
          }
          {node.bonded_reg_type === CWM_SO_BONDED_REGTYPES[0].value &&
          <Col sm={24} lg={8}>
            <FormItem label="预期出货日期" {...formItemLayout}>
              <Input addonBefore="晚于申报日期" addonAfter="天" value={node.ship_after_decl_days}
                onChange={ev => this.handleCommonFieldChange('ship_after_decl_days', ev.target.value)}
              />
            </FormItem>
          </Col>}
          {node.bonded_reg_type !== CWM_SO_BONDED_REGTYPES[0].value &&
          <Col sm={24} lg={8}>
            <FormItem label="预期出货日期" {...formItemLayout}>
              <DatePicker format="YYYY/MM/DD" style={{ width: '100%' }}
                value={node.expect_shipping_date && moment(node.expect_shipping_date)}
                onChange={expectDate => this.handleCommonFieldChange('expect_shipping_date', expectDate && expectDate.valueOf())}
              />
            </FormItem>
          </Col>
          }
        </Row>
      </Card>
    );
  }
}

