import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form, Row, Col, Card, Icon, Input, Select, Radio } from 'antd';
import { TRANS_MODE, WRAP_TYPE, DECL_I_TYPE, DECL_E_TYPE } from 'common/constants';
import { setClientForm, loadFlowNodeData } from 'common/reducers/crmOrders';
import { intlShape, injectIntl } from 'react-intl';
import { uuidWithoutDash } from 'client/common/uuid';
import messages from '../message.i18n';
import { format } from 'client/common/i18n/helpers';
import AttchmentUpload from './attachmentUpload';

const formatMsg = format(messages);
const FormItem = Form.Item;
const Option = Select.Option;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const InputGroup = Input.Group;

@injectIntl
@connect(
  state => ({
    formRequires: state.crmOrders.formRequires,
    cmsQuotes: state.scofFlow.cmsQuotes,
  }),
  { setClientForm, loadFlowNodeData }
)
export default class ClearanceForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    index: PropTypes.number.isRequired,
    operation: PropTypes.oneOf(['view', 'edit', 'create']),
    formData: PropTypes.object.isRequired,
    formRequires: PropTypes.object.isRequired,
    shipment: PropTypes.shape({
      cust_shipmt_trans_mode: PropTypes.string.isRequired,
      cust_shipmt_mawb: PropTypes.string,
      cust_shipmt_hawb: PropTypes.string,
      cust_shipmt_bill_lading: PropTypes.string,
    }),
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
  handleUploadFiles = (fileList) => {
    const { index, formData } = this.props;
    this.props.setClientForm(index, { ...formData, files: fileList });
  }
  handleChange = (key, value) => {
    this.handleSetClientForm({ [key]: value });
  }
  handleShipmentRelate = () => {
    const { shipment } = this.props;
    if (shipment.cust_shipmt_trans_mode) {
      const related = {
        trans_mode: shipment.cust_shipmt_trans_mode,
        gross_wt: shipment.cust_shipmt_weight,
        wrap_type: shipment.cust_shipmt_wrap_type,
        pack_count: shipment.cust_shipmt_pieces,
        traf_name: shipment.cust_shipmt_vessel,
        voyage_no: shipment.cust_shipmt_voy,
      };
      if (related.trans_mode === '2') {
        related.bl_wb_no = shipment.cust_shipmt_bill_lading;
      } else if (related.trans_mode === '5') {
        related.bl_wb_no = [shipment.cust_shipmt_mawb || '', shipment.cust_shipmt_hawb || ''].join('_');
      }
      this.handleSetClientForm(related);
    }
  }
  render() {
    const { formData, formRequires, cmsQuotes } = this.props;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    };
    const node = formData.node;
    const declWays = node.kind === 'export' ? DECL_E_TYPE : DECL_I_TYPE;
    return (
      <Card extra={<a role="button" onClick={this.handleShipmentRelate}><Icon type="sync" /> 关联货运信息</a>} bodyStyle={{ paddingTop: 40 }}>
        <Row style={{ marginBottom: 8 }}>
          <Col sm={24} lg={8}>
            <FormItem label={this.msg('declareWay')} {...formItemLayout}>
              <RadioGroup value={node.decl_way_code} onChange={ev => this.handleChange('decl_way_code', ev.target.value)}>
                <RadioButton value={declWays[0].key}>{declWays[0].value}</RadioButton>
                <RadioButton value={declWays[1].key}>{declWays[1].value}</RadioButton>
              </RadioGroup>
            </FormItem>
          </Col>
          <Col sm={24} lg={8}>
            <FormItem label={this.msg('declCustoms')} {...formItemLayout}>
              <Select showSearch value={node.decl_port} onChange={value => this.handleChange('decl_port', value)}>
                {
                  formRequires.declPorts.map(dp => <Option value={dp.code} key={dp.code}>{dp.code}|{dp.name}</Option>)
                }
              </Select>
            </FormItem>
          </Col>
          <Col sm={24} lg={8}>
            <FormItem label={this.msg('quoteNo')} {...formItemLayout}>
              <Select allowClear value={node.quote_no} onChange={value => this.handleChange('quote_no', value)}>
                {
                  cmsQuotes.map(cq => <Option value={cq.quote_no} key={cq._id}>{cq.quote_no}</Option>)
                }
              </Select>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col sm={24} lg={8}>
            <FormItem label={this.msg('transferMode')} {...formItemLayout}>
              <Select value={node.trans_mode} onChange={value => this.handleChange('trans_mode', value)}>
                {TRANS_MODE.map(tr => <Option value={tr.value} key={tr.value}>{tr.text}</Option>)}
              </Select>
            </FormItem>
          </Col>
          <Col sm={24} lg={8}>
            <FormItem label="运输工具" {...formItemLayout}>
              { node.trans_mode === '2' ?
                <InputGroup compact>
                  <Input style={{ width: '60%' }} value={node.traf_name} onChange={ev => this.handleChange('traf_name', ev.target.value)} />
                  <Input style={{ width: '40%' }} placeholder="航次号" value={node.voyage_no} onChange={ev => this.handleChange('voyage_no', ev.target.value)} />
                </InputGroup>
                :
                <Input value={node.traf_name} onChange={ev => this.handleChange('traf_name', ev.target.value)} />}
            </FormItem>
          </Col>
          <Col sm={24} lg={8}>
            <FormItem label="提运单号" {...formItemLayout}>
              <Input value={node.bl_wb_no} onChange={ev => this.handleChange('bl_wb_no', ev.target.value)} />
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col sm={24} lg={8}>
            <FormItem label={this.msg('packageNum')} {...formItemLayout}>
              <InputGroup compact>
                <Input type="number" style={{ width: '50%' }} value={node.pack_count} onChange={e => this.handleChange('pack_count', e.target.value)} />
                <Select size="large" style={{ width: '50%' }} placeholder="选择包装方式"
                  onChange={value => this.handleChange('wrap_type', value)} value={node.wrap_type}
                >
                  {
                    WRAP_TYPE.map(wt =>
                      <Option value={wt.value} key={wt.value}>{wt.text}</Option>
                      )
                  }
                </Select>
              </InputGroup>
            </FormItem>
          </Col>
          <Col sm={24} lg={8}>
            <FormItem label={this.msg('delgGrossWt')} {...formItemLayout}>
              <Input value={node.gross_wt} addonAfter="千克" type="number"
                onChange={ev => this.handleChange('gross_wt', ev.target.value)}
              />
            </FormItem>
          </Col>
          <Col sm={24} lg={8}>
            <FormItem label="备注" {...formItemLayout}>
              <Input value={node.remark} onChange={ev => this.handleChange('remark', ev.target.value)} />
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col sm={24} lg={8}>
            <FormItem label={this.msg('customsBroker')} {...formItemLayout}>
              <Select allowClear showSearch value={node.customs_partner_id} onChange={value => this.handleChange('customs_partner_id', value)}>
                {
                  formRequires.customsBrokers.map(cb =>
                    <Option value={cb.partner_id} key={cb.partner_id}>{cb.partner_code}|{cb.name}</Option>
                  )
                }
              </Select>
            </FormItem>
          </Col>
          <Col sm={24} lg={8}>
            <FormItem label={this.msg('ciqBroker')} {...formItemLayout}>
              <Select allowClear showSearch value={node.ciq_partner_id} onChange={value => this.handleChange('ciq_partner_id', value)}>
                {
                  formRequires.ciqBrokers.map(cb =>
                    <Option value={cb.partner_id} key={cb.partner_id}>{cb.partner_code}|{cb.name}</Option>
                  )
                }
              </Select>
            </FormItem>
          </Col>
        </Row>
        <div style={{ marginTop: 20 }}>
          <AttchmentUpload files={formData.files} onFileListUpdate={this.handleUploadFiles} />
        </div>
      </Card>
    );
  }
}
