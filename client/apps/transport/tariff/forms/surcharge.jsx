import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { Card, Row, Col, Form, Button, Input, Radio, message } from 'antd';
// import Table from 'client/components/remoteAntTable';
import { TAX_MODE } from 'common/constants';
import { submitSurcharges } from 'common/reducers/transportTariff';
import ContentWrapper from '../../resources/components/ContentWrapper';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
// import containerMessages from 'client/apps/message.i18n';
// import globalMessages from 'client/common/root.i18n';

const formatMsg = format(messages);
// const formatContainerMsg = format(containerMessages);
// const formatGlobalMsg = format(globalMessages);

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    formdata: state.transportTariff.surcharge,
    tariffId: state.transportTariff.tariffId,
  }),
  { submitSurcharges }
)
@Form.create()
export default class SurchargeForm extends React.Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    formdata: PropTypes.object.isRequired,
    submitSurcharges: PropTypes.func.isRequired,
    tariffId: PropTypes.string.isRequired,
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  handleSave = () => {
    const formdata = {
      ...this.props.formdata,
      ...this.props.form.getFieldsValue(),
    };
    const prom = this.props.submitSurcharges(this.props.tariffId, formdata);
    prom.then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        message.info('保存成功', 5);
      }
    });
  }
  isDefaultAdvanceCharge(value) {
    return ['CCF', 'GZF', 'GJF', 'SGF', 'CQF', 'HWX', 'DJCDF', 'PZCYCDF', 'KDF', 'QIFY'].indexOf(value) >= 0;
  }
  renderInput(selected, field, initialMode, initialValue) {
    const { getFieldProps } = this.props.form;
    return (
      <Form horizontal>
       <Row>
         <Col span={17}>
            <FormItem hasFeedback>
              <RadioGroup {...getFieldProps(selected, initialMode)}>
                <RadioButton value={TAX_MODE.eachwaybill.key}>{TAX_MODE.eachwaybill.value}</RadioButton>
                <RadioButton value={TAX_MODE.chargeunit.key}>{TAX_MODE.chargeunit.value}</RadioButton>
              </RadioGroup>
            </FormItem>
          </Col>
          <Col span={7}>
            <FormItem>
            <Input addonAfter="元" placeholder="请输入金额" {
                ...getFieldProps(field, initialValue)
              } />
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const { formdata } = this.props;
    return (
      <ContentWrapper>
        <div className="panel-body" style={{ padding: '0 16px' }}>
          <Row>
            <Col span={6} style={{ padding: '0 6px 0 0' }}>
              <Card title="提货费">
                {this.renderInput('pickup.mode', 'pickup.value', { initialValue: formdata.pickup.mode }, { initialValue: formdata.pickup.value })}
              </Card>
            </Col>
            <Col span={6} style={{ padding: '0 6px 0 0' }}>
              <Card title="配送费">
                {this.renderInput('delivery.mode', 'delivery.value', { initialValue: formdata.delivery.mode }, { initialValue: formdata.delivery.value })}
              </Card>
            </Col>
            <Col span={6} style={{ padding: '0 6px 0 0' }}>
              <Card title="装货费">
                {this.renderInput('load.mode', 'load.value', { initialValue: formdata.load.mode }, { initialValue: formdata.load.value })}
              </Card>
            </Col>
            <Col span={6} style={{ padding: '0 6px 0 0' }}>
              <Card title="卸货费">
                {this.renderInput('unload.mode', 'unload.value', { initialValue: formdata.unload.mode }, { initialValue: formdata.unload.value })}
              </Card>
            </Col>
          </Row>
          <Row>
            <FormItem style={{ marginTop: 24 }}>
              <Button type="primary" htmlType="submit" onClick={this.handleSave}>保存</Button>
            </FormItem>
          </Row>
        </div>
      </ContentWrapper>
    );
  }
}

// const columns = [{
//       title: '序号',
//       dataIndex: 'no',
//       render(o, index) {
//         return index+1;
//       },
//     }, {
//       title: '费用类别',
//       dataIndex: 'category',
//     }, {
//       title: '费用名称',
//       dataIndex: 'fee_name',

//     }, {
//       title: '费用代码',
//       dataIndex: 'fee_code',

//     }, {
//       title: '费用类型',
//       dataIndex: 'fee_style',
//     }, {
//       title: '计费方式',
//       dataIndex: 'charge_mode',
//     }, {
//       title: '批次量',
//       dataIndex: 'lot_num',
//     }, {
//       title: '免计量',
//       dataIndex: 'free_num',
//     }, {
//       title: '计费单价',
//       dataIndex: 'unit_price',
//     }, {
//       title: '是否开票',
//       dataIndex: 'invoice_en',
//     }, {
//       title: '开票税率',
//       dataIndex: 'tax_rate',
//     }, {
//       title: '是否启用',
//       dataIndex: 'enabled',
//     }, {
//       title: '操作',
//     }];

//     const formItemLayout = {
//       labelCol: { span: 4 },
//       wrapperCol: { span: 24 - 4 },
//     };

// <Card title="垫付费用">
//   <Row>
//     <Col span={8}>
//       <FormItem label="合作伙伴" {...formItemLayout}>
//         <Input defaultValue={1} disabled/>
//       </FormItem>
//     </Col>
//     <Col span={8}>
//       <FormItem label="运输方式" {...formItemLayout}>
//         <Input defaultValue={1} disabled/>
//       </FormItem>
//     </Col>
//   </Row>
//   <Row>
//     <Table columns={columns} bordered
//     />
//   </Row>
// </Card>
