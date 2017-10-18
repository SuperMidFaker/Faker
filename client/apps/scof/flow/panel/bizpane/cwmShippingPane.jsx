import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Collapse, Form, Col, Row, Radio, Select, Input } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import FlowTriggerTable from '../compose/flowTriggerTable';
import { CWM_SO_TYPES, CWM_SO_BONDED_REGTYPES } from 'common/constants';
import { formatMsg } from '../../message.i18n';

const FormItem = Form.Item;
const Panel = Collapse.Panel;
const Option = Select.Option;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

@injectIntl
@connect(
  state => ({
    shipParams: state.scofFlow.cwmParams,
  })
)
export default class CWMShippingPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
  }
  msg = formatMsg(this.props.intl)
  handleBondedChange = (ev) => {
    if (!ev.target.value) {
      this.props.form.setFieldsValue({
        bonded_reg_type: null,
        ship_after_decl_days: '',
      });
    }
  }
  render() {
    const { form: { getFieldDecorator, getFieldValue }, model, shipParams } = this.props;
    return (
      <Collapse bordered={false} defaultActiveKey={['properties', 'events']}>
        <Panel header={this.msg('bizProperties')} key="properties">
          <Row gutter={16}>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('cwmWarehouse')}>
                {getFieldDecorator('whse_code', {
                  initialValue: `${model.wh_ent_tenant_id}-${model.whse_code}`,
                })(<Select showSearch allowClear optionFilterProp="children">
                  {shipParams.whses.map(wh =>
                    <Option key={`${wh.wh_ent_tenant_id}-${wh.code}`} value={`${wh.wh_ent_tenant_id}-${wh.code}`}>{wh.code}|{wh.name}</Option>)}
                </Select>)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label="SO类型">
                {getFieldDecorator('so_type', {
                  initialValue: model.so_type,
                })(
                  <Select placeholder="SO类型">
                    {CWM_SO_TYPES.map(cat => <Option value={cat.value} key={cat.value}>{cat.text}</Option>)}
                  </Select>
                    )}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label="货物属性">
                {getFieldDecorator('bonded', {
                  initialValue: model.bonded,
                  onChange: this.handleBondedChange,
                })(
                  <RadioGroup>
                    <RadioButton value={0}>非保税</RadioButton>
                    <RadioButton value={1}>保税</RadioButton>
                  </RadioGroup>
                    )}
              </FormItem>
            </Col>
            {
              getFieldValue('bonded') &&
              <Col sm={24} lg={10}>
                <FormItem label="保税监管方式">
                  {getFieldDecorator('bonded_reg_type', {
                    initialValue: model.bonded_reg_type,
                  })(
                    <RadioGroup>
                      {CWM_SO_BONDED_REGTYPES.map(cabr => <RadioButton value={cabr.value} key={cabr.value}>{cabr.ftztext}</RadioButton>)}
                    </RadioGroup>
                  )}
                </FormItem>
              </Col>
            }
            {
              getFieldValue('bonded_reg_type') === CWM_SO_BONDED_REGTYPES[0].value &&
              <Col sm={24} lg={8} >
                <FormItem label="保税预期出库日期">
                  {getFieldDecorator('ship_after_decl_days', {
                    initialValue: model.ship_after_decl_days,
                  })(<Input addonBefore="晚于申报日期" addonAfter="天" />)}
                </FormItem>
              </Col>
            }
          </Row>
        </Panel>
        <Panel header={this.msg('bizEvents')} key="events">
          <FlowTriggerTable kind={model.kind} bizObj="cwmShipping" />
        </Panel>
      </Collapse>
    );
  }
}
