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
    formRequires: state.crmOrders.formRequires,
  }),
  { setClientForm }
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
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }

  msg = key => formatMsg(this.props.intl, key)
  handleSetClientForm = (data) => {
    const { index, formData } = this.props;
    const newData = { ...formData, ...data };
    this.props.setClientForm(index, newData);
  }
  handleUploadFiles = (fileList) => {
    this.handleSetClientForm({ files: fileList });
  }
  handleCommonFieldChange = (filed, value) => {
    const delgBills = this.props.formData.delgBills.map((item) => {
      return {
        ...item,
        [filed]: value,
      };
    });
    this.handleSetClientForm({ delgBills });
    return value;
  }
  handleAddRow = () => {
    const delgBill = {
      decl_way_code: '',
      pack_count: 1,
      gross_wt: 0,
      ccb_need_exchange: 0,
      remark: '',
      package: '',
    };
    const delgBills = [...this.props.formData.delgBills];
    const lastPos = delgBills.length - 1;
    delgBill.package = delgBills[lastPos].package;
    delgBill.ccb_need_exchange = delgBills[lastPos].ccb_need_exchange;
    delgBills.push(delgBill);
    this.handleSetClientForm({ delgBills });
  }
  handleRemoveRow(k) {
    const delgBills = [...this.props.formData.delgBills];
    delgBills.splice(k, 1);
    this.handleSetClientForm({ delgBills });
  }
  handleChange = (k, key, value) => {
    const delgBills = [...this.props.formData.delgBills];
    delgBills[k][key] = value;
    this.handleSetClientForm({ delgBills });
  }
  render() {
    const { formData, formRequires } = this.props;
    const formItemLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 17 },
    };
    const formItems = formData.delgBills.map((item, k) => {
      return (
        <Row key={k} style={{ marginBottom: 8 }}>
          <Col sm={5}>
            <FormItem label={this.msg('declareWay')} {...formItemLayout}>
              <Select value={item.decl_way_code} onChange={value => this.handleChange(k, 'decl_way_code', value)}>
                {DECL_I_TYPE.map(dw =>
                  <Option value={dw.key} key={dw.key}>{dw.value}</Option>)
                }
              </Select>
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
          <Col sm={7}>
            <FormItem label="备注" {...formItemLayout}>
              <Input value={item.remark} onChange={e => this.handleChange(k, 'remark', e.target.value)} />
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
          <Col sm={5}>
            <FormItem label="包装方式" {...formItemLayout}>
              <Select value={formData.delgBills[0].package} onChange={value => this.handleCommonFieldChange('package', value)}>
                {formRequires.packagings.map(
                  pk => <Option value={pk.package_code} key={pk.package_code}>{pk.package_name}</Option>
                )}
              </Select>
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="是否需要换单" {...formItemLayout}>
              <Switch onChange={value => this.handleCommonFieldChange('ccb_need_exchange', value ? 1 : 0)} checked={formData.delgBills[0].ccb_need_exchange} />
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
