import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form, Row, Col, Card, Input, Select, InputNumber } from 'antd';
import { DECL_I_TYPE, DECL_E_TYPE } from 'common/constants';
import { setClientForm, loadFlowNodeData } from 'common/reducers/crmOrders';
import { intlShape, injectIntl } from 'react-intl';
import { uuidWithoutDash } from 'client/common/uuid';
import messages from '../message.i18n';
import { format } from 'client/common/i18n/helpers';
import AttchmentUpload from './attachmentUpload';

const formatMsg = format(messages);
const FormItem = Form.Item;
const Option = Select.Option;

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
    if (!formData.uuid && formData.node_uuid) {
      this.props.loadFlowNodeData(formData.node_uuid, formData.kind).then((result) => {
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
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    };
    const declWays = formData.kind === 'export' ? DECL_E_TYPE : DECL_I_TYPE;
    return (
      <Card>
        <Row key={formData.uuid} style={{ marginBottom: 8 }}>
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
            <FormItem label={this.msg('packageNum')} {...formItemLayout}>
              <InputNumber value={formData.pack_count} min={1} max={100000} style={{ width: '100%' }}
                onChange={value => this.handleChange('pack_count', value)}
              />
            </FormItem>
          </Col>
          <Col sm={24} lg={8}>
            <FormItem label={this.msg('delgGrossWt')} {...formItemLayout}>
              <Input value={formData.gross_wt} addonAfter="千克" type="number"
                onChange={ev => this.handleChange('gross_wt', ev.target.value)}
              />
            </FormItem>
          </Col>
          <Col sm={24} lg={8}>
            <FormItem label={this.msg('declCustoms')} {...formItemLayout}>
              <Select value={formData.decl_port} onChange={value => this.handleChange('decl_port', value)}>
                {
                  formRequires.declPorts.map(dp => <Option value={dp.code} key={dp.code}>{dp.code}|{dp.name}</Option>)
                }
              </Select>
            </FormItem>
          </Col>
          <Col sm={24} lg={8}>
            <FormItem label={this.msg('declareWay')} {...formItemLayout}>
              <Select value={formData.decl_way_code} onChange={value => this.handleChange('decl_way_code', value)}>
                {declWays.map(dw =>
                  <Option value={dw.key} key={dw.key}>{dw.value}</Option>)
                }
              </Select>
            </FormItem>
          </Col>
          <Col sm={24} lg={8}>
            <FormItem label={this.msg('customsBroker')} {...formItemLayout}>
              <Select value={formData.customs_parnter_id} onChange={value => this.handleChange('customs_parnter_id', value)}>
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
              <Select value={formData.ciq_partner_id} onChange={value => this.handleChange('ciq_partner_id', value)}>
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
              <Select value={formData.quote_no} />
            </FormItem>
          </Col>
          <Col sm={24} lg={16}>
            <FormItem label="备注" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
              <Input value={formData.remark} onChange={ev => this.handleChange('remark', ev.target.value)} />
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
