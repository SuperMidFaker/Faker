import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form, Row, Col, Card, Input, Select, Icon, InputNumber, Tooltip, Radio } from 'antd';
import { TRANS_MODE, DECL_I_TYPE, DECL_E_TYPE } from 'common/constants';
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

@injectIntl
@connect(
  state => ({
    formRequires: state.crmOrders.formRequires,
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
  render() {
    const { formData, formRequires } = this.props;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    };
    const node = formData.node;
    const declWays = node.kind === 'export' ? DECL_E_TYPE : DECL_I_TYPE;
    return (
      <Card>
        <Row style={{ marginBottom: 8 }}>
          {/* <Col sm={4}>
            <FormItem label="包装方式" {...formItemLayout}>
              <Select value={item.package} onChange={value => this.handleChange(k, 'package', value)}>
                {formRequires.packagings.map(
                  pk => <Option value={pk.package_code} key={pk.package_code}>{pk.package_name}</Option>
                )}
              </Select>
            </FormItem>
          </Col> */}
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
            <FormItem label={(
              <span>
                {this.msg('transferMode')}&nbsp;
                <Tooltip title={this.msg('tooltipTransferMode')}>
                  <Icon type="question-circle-o" />
                </Tooltip>
              </span>
            )} {...formItemLayout}
            >
              <Select value={node.trans_mode} onChange={value => this.handleChange('trans_mode', value)}>
                {
                    TRANS_MODE.map(tr =>
                      <Option value={tr.value} key={tr.value}>{tr.text}</Option>
                    )
                  }
              </Select>
            </FormItem>
          </Col>
          <Col sm={24} lg={8}>
            <FormItem label={this.msg('customsBroker')} {...formItemLayout}>
              <Select showSearch value={node.customs_partner_id} onChange={value => this.handleChange('customs_partner_id', value)}>
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
              <Select showSearch value={node.ciq_partner_id} onChange={value => this.handleChange('ciq_partner_id', value)}>
                {
                  formRequires.ciqBrokers.map(cb =>
                    <Option value={cb.partner_id} key={cb.partner_id}>{cb.partner_code}|{cb.name}</Option>
                  )
                }
              </Select>
            </FormItem>
          </Col>
          <Col sm={24} lg={8}>
            <FormItem label={this.msg('quoteNo')} {...formItemLayout}>
              <Select value={node.quote_no} />
            </FormItem>
          </Col>
          <Col sm={24} lg={8}>
            <FormItem label={this.msg('packageNum')} {...formItemLayout}>
              <InputNumber value={node.pack_count} min={1} max={100000}
                onChange={value => this.handleChange('pack_count', value)}
              />
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
          {/*
           <Col span={1} offset={1}>
            {formData.delgBills.length > 1 ?
              <Button type="ghost" shape="circle" onClick={() => this.handleRemoveRow(k)} icon="delete" />
            : null}
           </Col>
            */}
        </Row>
        {/*
        <div style={{ marginTop: 8 }}>
          <Button type="dashed" size="large" onClick={this.handleAddRow} icon="plus" style={{ width: '100%' }}>
            {this.msg('addMore')}
          </Button>
        </div>
        */}
        <div style={{ marginTop: 20 }}>
          <AttchmentUpload files={formData.files} onFileListUpdate={this.handleUploadFiles} />
        </div>
      </Card>
    );
  }
}
