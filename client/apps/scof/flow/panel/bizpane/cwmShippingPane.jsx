import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Collapse, Form, Col, Row, Radio, Select } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { CWM_SO_TYPES, CWM_SO_BONDED_REGTYPES } from 'common/constants';
import FlowTriggerTable from '../compose/flowTriggerTable';
import { formatMsg } from '../../message.i18n';

const FormItem = Form.Item;
const { Panel } = Collapse;
const { Option } = Select;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

@injectIntl
@connect(state => ({
  shipParams: state.scofFlow.cwmParams,
}))
export default class CWMShippingPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.shape({ getFieldDecorator: PropTypes.func }).isRequired,
  }
  msg = formatMsg(this.props.intl)
  handleSoTypeChange = (soType) => {
    if (soType === CWM_SO_TYPES[3].value) {
      this.props.form.setFieldsValue({
        bonded: 1,
        bonded_reg_type: CWM_SO_BONDED_REGTYPES[0].value,
      });
    }
  }
  handleBondedChange = (ev) => {
    if (ev.target.value !== 1) {
      const regType = this.props.form.getFieldValue('bonded_reg_type');
      if (regType) {
        this.props.form.setFieldsValue({
          bonded_reg_type: null,
        });
      }
    }
  }
  handleWhseSelect = (tWhseCode) => {
    const { shipParams } = this.props;
    const selWhse = shipParams.whses.filter(whse => `${whse.wh_ent_tenant_id}-${whse.code}` === tWhseCode)[0];
    if (selWhse) {
      if (!selWhse.bonded) {
        this.props.form.setFieldsValue({ bonded: 0 });
      }
    }
  }
  render() {
    const { form: { getFieldDecorator, getFieldValue }, model, shipParams } = this.props;
    model.t_whse_code = model.t_whse_code || (model.whse_code && `${model.wh_ent_tenant_id}-${model.whse_code}`);
    const tWhseCode = getFieldValue('t_whse_code') || model.t_whse_code;
    const selWhse = shipParams.whses.filter(whse => `${whse.wh_ent_tenant_id}-${whse.code}` === tWhseCode)[0];
    return (
      <Collapse accordion bordered={false} defaultActiveKey={['properties']}>
        <Panel header={this.msg('bizProperties')} key="properties">
          <Row gutter={16}>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('cwmWarehouse')}>
                {getFieldDecorator('t_whse_code', {
                  initialValue: model.t_whse_code,
                })(<Select showSearch allowClear optionFilterProp="children" onSelect={this.handleWhseSelect}>
                  {shipParams.whses.map(wh =>
                    <Option key={`${wh.wh_ent_tenant_id}-${wh.code}`} value={`${wh.wh_ent_tenant_id}-${wh.code}`}>{wh.code}|{wh.name}</Option>)}
                </Select>)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label="SO类型">
                {getFieldDecorator('so_type', {
                  initialValue: model.so_type,
                })(<Select placeholder="SO类型" allowClear onChange={this.handleSoTypeChange}>
                  {CWM_SO_TYPES.map(cat =>
                    <Option value={cat.value} key={cat.value}>{cat.text}</Option>)}
                </Select>)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label="货物属性">
                {getFieldDecorator('bonded', {
                  initialValue: model.bonded,
                  onChange: this.handleBondedChange,
                })(<RadioGroup>
                  <RadioButton value={0}>非保税</RadioButton>
                  {selWhse && selWhse.bonded ? <RadioButton value={1}>保税</RadioButton> : null}
                  {selWhse && selWhse.bonded ? <RadioButton value={-1}>不限</RadioButton> : null}
                </RadioGroup>)}
              </FormItem>
            </Col>
            {
              getFieldValue('bonded') === 1 &&
              <Col sm={24} lg={16}>
                <FormItem label="保税监管方式">
                  {getFieldDecorator('bonded_reg_type', {
                    initialValue: model.bonded_reg_type,
                  })(<RadioGroup>
                    {CWM_SO_BONDED_REGTYPES.map(cabr =>
                      (<RadioButton value={cabr.value} key={cabr.value}>
                        {cabr.ftztext || cabr.text}
                      </RadioButton>))}
                  </RadioGroup>)}
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
