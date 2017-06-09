import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Collapse, Form, Input, Radio, Col, Row, Select } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import FlowTriggerTable from '../compose/flowTriggerTable';
import { CWM_ASN_TYPES, CWM_ASN_BONDED_REGTYPES } from 'common/constants';
import { formatMsg } from '../../message.i18n';

const FormItem = Form.Item;
const Panel = Collapse.Panel;
const Option = Select.Option;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

@injectIntl
@connect(
  state => ({
    recParams: state.scofFlow.cwmRecParams,
  }),
)
export default class CWMReceivingPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
  }
  msg = formatMsg(this.props.intl)
  render() {
    const { form: { getFieldDecorator, getFieldValue }, onNodeActionsChange, model, recParams } = this.props;
    return (
      <Collapse bordered={false} defaultActiveKey={['properties', 'events']}>
        <Panel header={this.msg('bizProperties')} key="properties">
          <Row gutter={16}>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('cwmWarehouse')}>
                {getFieldDecorator('whse_code', {
                  initialValue: model.warehouse,
                })(<Select showSearch allowClear optionFilterProp="children">
                  {recParams.whses.map(wh => <Option key={wh.code} value={wh.code}>{wh.code}|{wh.name}</Option>)}
                </Select>)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label="ASN类型">
                {getFieldDecorator('asn_type', {
                })(
                  <Select placeholder="ASN类型">
                    {CWM_ASN_TYPES.map(cat => <Option value={cat.value} key={cat.value}>{cat.text}</Option>)}
                  </Select>
                    )}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label="货物属性">
                {getFieldDecorator('bonded', {
                  initialValue: model.bonded,
                })(
                  <RadioGroup onChange={this.handleBondedChange}>
                    <RadioButton value={0}>非保税</RadioButton>
                    <RadioButton value={1}>保税</RadioButton>
                  </RadioGroup>
                    )}
              </FormItem>
            </Col>
            {
              getFieldValue('bonded') &&
              <Col sm={24} lg={8} >
                <FormItem label="保税入库类型">
                  {getFieldDecorator('bonded_reg_type', {
                    initialValue: model.bonded_reg_type,
                  })(
                    <RadioGroup>
                      {CWM_ASN_BONDED_REGTYPES.map(cabr => <RadioButton value={cabr.value} key={cabr.value}>{cabr.text}</RadioButton>)}
                    </RadioGroup>
                  )}
                </FormItem>
              </Col>
            }
            {
              getFieldValue('bonded_reg_type') === CWM_ASN_BONDED_REGTYPES[0].value &&
              <Col sm={24} lg={8} >
                <FormItem label="保税入库预期收货日期">
                  {getFieldDecorator('rec_after_decl_days', {
                    initialValue: model.rec_after_decl_days,
                  })(<Input addonBefore="晚于申报日期" addonAfter="天" />)}
                </FormItem>
              </Col>
            }
          </Row>
        </Panel>
        <Panel header={this.msg('bizEvents')} key="events">
          <FlowTriggerTable kind={model.kind} bizObj="cwmReceiving" onNodeActionsChange={onNodeActionsChange} />
        </Panel>
      </Collapse>
    );
  }
}
