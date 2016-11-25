import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form, Row, Col, Card, Input, Button, Select, InputNumber, Switch } from 'antd';
import { DECL_I_TYPE } from 'common/constants';
import { setClientForm } from 'common/reducers/crmOrders';
import { intlShape, injectIntl } from 'react-intl';
import messages from '../message.i18n';
import { format } from 'client/common/i18n/helpers';
import AttchmentUpload from './attachmentUpload';
const formatMsg = format(messages);
const FormItem = Form.Item;
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    formData: state.crmOrders.formData,

  }),
  { setClientForm }
)

export default class ClearanceForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    operation: PropTypes.oneOf(['view', 'edit', 'create']),
    formData: PropTypes.object.isRequired,
    setClientForm: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }

  msg = key => formatMsg(this.props.intl, key)

  handleUploadFiles = (fileList) => {
    this.props.setClientForm({ files: fileList });
  }
  handleClientChange = (value) => {
    const ccbNeedExchange = value ? 1 : 0;
    this.props.setClientForm({ ccb_need_exchange: ccbNeedExchange });
    return value;
  }
  handleAddRow = () => {
    const delgBill = {
      decl_way_code: '',
      manual_no: '',
      pack_count: 1,
      gross_wt: 0,
    };
    const delgBills = [...this.props.formData.delgBills];
    delgBills.push(delgBill);
    this.props.setClientForm({ delgBills });
  }
  handleRemoveRow(k) {
    const delgBills = [...this.props.formData.delgBills];
    delgBills.splice(k, 1);
    this.props.setClientForm({ delgBills });
  }
  handleChange = (k, key, value) => {
    const delgBills = [...this.props.formData.delgBills];
    delgBills[k][key] = value;
    this.props.setClientForm({ delgBills });
  }
  render() {
    const { formData } = this.props;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    };
    const formItems = formData.delgBills.map((item, k) => {
      return (
        <Row key={k} style={{ marginBottom: 8 }}>
          <Col sm={6}>
            <FormItem label={this.msg('declareWay')} {...formItemLayout}>
              <Select value={item.decl_way_code} onChange={value => this.handleChange(k, 'decl_way_code', value)}>
                {DECL_I_TYPE.map(dw =>
                  <Option value={dw.key} key={dw.key}>{dw.value}</Option>)
                }
              </Select>
            </FormItem>
          </Col>
          <Col sm={6}>
            <FormItem label={this.msg('manualNo')} {...formItemLayout}>
              <Input value={item.manual_no} onChange={e => this.handleChange(k, 'manual_no', e.target.value)} />
            </FormItem>
          </Col>
          <Col sm={5}>
            <FormItem label={this.msg('packageNum')} {...formItemLayout}>
              <InputNumber value={item.pack_count} min={1} max={100000} style={{ width: '100%' }}
                onChange={value => this.handleChange(k, 'pack_count', value)}
              />
            </FormItem>
          </Col>
          <Col sm={5}>
            <FormItem label={this.msg('delgGrossWt')} {...formItemLayout}>
              <Input value={item.gross_wt} addonAfter="千克" type="number"
                onChange={e => this.handleChange(k, 'gross_wt', e.target.value)}
              />
            </FormItem>
          </Col>
          <Col span={1} offset={1}>
            {formData.delgBills.length > 1 ?
              <Button type="ghost" shape="circle" onClick={() => this.handleRemoveRow(k)} icon="delete" />
            : null
          }
          </Col>
        </Row>
      );
    });
    return (
      <Card>
        <Row>
          <Col sm={8}>
            <FormItem label="是否需要换单" {...formItemLayout}>
              <Switch onChange={this.handleClientChange} checked={formData.ccb_need_exchange === 1} />
            </FormItem>
          </Col>
        </Row>
        {formItems}
        <div style={{ marginTop: 8 }}>
          <Button type="dashed" size="large" onClick={this.handleAddRow} icon="plus" style={{ width: '100%' }}>
            {this.msg('addMore')}
          </Button>
        </div>
        <div style={{ marginTop: 20 }}>
          <AttchmentUpload files={formData.files} onFileListUpdate={this.handleUploadFiles} />
        </div>
      </Card>
    );
  }
}
