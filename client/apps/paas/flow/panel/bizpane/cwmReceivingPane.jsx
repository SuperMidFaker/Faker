import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Collapse, Form, Input, Radio, Col, Row, Select } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { loadWhseOwnerSuppliers, showCwmSupplierModal } from 'common/reducers/scofFlow';
import { CWM_ASN_TYPES, CWM_ASN_BONDED_REGTYPES } from 'common/constants';
import FlowWhseSuppliersModal from '../compose/flowWhseSupplierModal';
import FlowTriggerTable from '../compose/flowTriggerTable';
import { formatMsg } from '../../message.i18n';

const FormItem = Form.Item;
const { Panel } = Collapse;
const { Option } = Select;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

@injectIntl
@connect(state => ({
  recParams: state.scofFlow.cwmParams,
}), { loadWhseOwnerSuppliers, showCwmSupplierModal })
export default class CWMReceivingPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.shape({ getFieldDecorator: PropTypes.func }).isRequired,
  }
  componentDidMount() {
    const { model } = this.props;
    if (model.whse_code) {
      this.props.loadWhseOwnerSuppliers(model.whse_code, model.demander_partner_id);
    }
  }
  msg = formatMsg(this.props.intl)
  handleWhseSelect = (tWhseCode) => {
    const { recParams, model } = this.props;
    const recWhse = recParams.whses.filter(whse => `${whse.wh_ent_tenant_id}-${whse.code}` === tWhseCode)[0];
    if (recWhse) {
      if (!recWhse.bonded) {
        this.props.form.setFieldsValue({ bonded: 0 });
      }
      this.props.loadWhseOwnerSuppliers(recWhse.code, model.demander_partner_id);
    }
  }
  handleBondedChange = (ev) => {
    if (!ev.target.value) {
      const { graph, node } = this.props;
      graph.update(node, {
        bonded_reg_type: null,
        rec_after_decl_days: '',
      });
    }
  }
  handleSupplierAdd = () => {
    const { model, form: { getFieldValue } } = this.props;
    const tWhseCode = getFieldValue('t_whse_code');
    this.props.showCwmSupplierModal({
      visible: true,
      whseCode: tWhseCode.split('-')[1],
      ownerPid: model.demander_partner_id,
    });
  }
  handleSupplierAdded = (supplier) => {
    const {
      graph, node, model, form: { setFieldsValue, getFieldValue },
    } = this.props;
    const tWhseCode = getFieldValue('t_whse_code');
    const whseCode = tWhseCode.split('-')[1];
    this.props.loadWhseOwnerSuppliers(whseCode, model.demander_partner_id).then((result) => {
      if (!result.error) {
        setFieldsValue({ supplier_code: supplier.code });
        graph.update(node, { supplier_code: supplier.code, supplier: supplier.name });
      }
    });
  }
  handleSupplierSelect = (supplierCode) => {
    const { graph, node } = this.props;
    const supplier = this.props.recParams.suppliers.filter(supp => supp.code === supplierCode)[0];
    if (supplier) {
      graph.update(node, { supplier_code: supplierCode, supplier: supplier.name });
    } else {
      graph.update(node, { supplier_code: null, supplier: null });
    }
  }
  render() {
    const { form: { getFieldDecorator, getFieldValue }, model, recParams } = this.props;
    model.t_whse_code = model.t_whse_code || (model.whse_code && `${model.wh_ent_tenant_id}-${model.whse_code}`);
    const tWhseCode = getFieldValue('t_whse_code') || model.t_whse_code;
    const recWhse = recParams.whses.filter(whse => `${whse.wh_ent_tenant_id}-${whse.code}` === tWhseCode)[0];
    return (
      <Collapse accordion bordered={false} defaultActiveKey={['properties']}>
        <Panel header={this.msg('bizProperties')} key="properties">
          <Row gutter={16}>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('cwmWarehouse')}>
                {getFieldDecorator('t_whse_code', {
                  initialValue: model.t_whse_code,
                  // clear still t_whse_code undefined, this still exist
                  rules: [{ required: true }],
                })(<Select showSearch allowClear optionFilterProp="children" onChange={this.handleWhseSelect}>
                  {recParams.whses.map(wh =>
                    <Option key={`${wh.wh_ent_tenant_id}-${wh.code}`} value={`${wh.wh_ent_tenant_id}-${wh.code}`}>{wh.code}|{wh.name}</Option>)}
                </Select>)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('supplier')}>
                {getFieldDecorator('supplier_code', {
                  initialValue: model.supplier_code,
                })(<Select
                  showSearch
                  allowClear
                  optionFilterProp="children"
                  onChange={this.handleSupplierSelect}
                  disabled={!getFieldValue('t_whse_code')}
                  notFoundContent={<a onClick={this.handleSupplierAdd}>+ 添加供货商</a>}
                >
                  {recParams.suppliers.map(supp => (<Option key={supp.code} value={supp.code}>
                    {supp.name}</Option>)) }
                </Select>)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label="ASN类型">
                {getFieldDecorator('asn_type', {
                  initialValue: model.asn_type,
                })(<Select placeholder="ASN类型">
                  {CWM_ASN_TYPES.map(cat =>
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
                  {recWhse && recWhse.bonded ? <RadioButton value={1}>保税</RadioButton> : null}
                </RadioGroup>)}
              </FormItem>
            </Col>
            {
              getFieldValue('bonded') &&
              <Col sm={24} lg={8} >
                <FormItem label="保税监管方式">
                  {getFieldDecorator('bonded_reg_type', {
                    initialValue: model.bonded_reg_type,
                  })(<RadioGroup>
                    {CWM_ASN_BONDED_REGTYPES.map(cabr =>
                      (<RadioButton value={cabr.value} key={cabr.value}>
                        {cabr.ftztext}
                      </RadioButton>))}
                  </RadioGroup>)}
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
          <FlowTriggerTable kind={model.kind} bizObj="cwmReceiving" />
        </Panel>
        <FlowWhseSuppliersModal onSupplierAdd={this.handleSupplierAdded} />
      </Collapse>
    );
  }
}
