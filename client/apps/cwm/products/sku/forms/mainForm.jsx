import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Dropdown, Menu, Form, Select, Card, Col, Icon, Input, Row, Tooltip, Checkbox } from 'antd';
import { setSkuForm } from 'common/reducers/cwmSku';
import { CWM_SKU_PACK_UNITS } from 'common/constants';
import { formatMsg } from '../../message.i18n';

const FormItem = Form.Item;
const InputGroup = Input.Group;
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    owner: state.cwmSku.owner,
    units: state.cwmSku.params.units,
    currencies: state.cwmSku.params.currencies,
    skuForm: state.cwmSku.skuForm,
  }),
  { setSkuForm }
)
export default class MainForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    mode: PropTypes.oneOf(['create', 'edit']),
    owners: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      partner_code: PropTypes.string,
      name: PropTypes.string,
    })),
    units: PropTypes.arrayOf(PropTypes.shape({
      code: PropTypes.string,
      name: PropTypes.string,
    })),
  }
  msg = formatMsg(this.props.intl)
  handleUnitChange = (value) => {
    const unit = this.props.units.filter(un => un.code === value)[0];
    if (unit) {
      this.props.setSkuForm({ unit: unit.code, unit_name: unit.name });
    }
  }
  handlePackUnitChange = (value) => {
    const punit = CWM_SKU_PACK_UNITS.filter(pu => pu.value === value)[0];
    if (punit) {
      this.props.setSkuForm({ sku_pack_unit: punit.value, sku_pack_unit_name: punit.text });
    }
  }
  handleCurrChange = (value) => {
    const curr = this.props.currencies.filter(cu => cu.code === value)[0];
    if (curr) {
      this.props.setSkuForm({ currency: curr.code, currency_name: curr.name });
    }
  }
  handleFormChange = (field, value) => {
    this.props.setSkuForm({ [field]: value });
  }
  handleCBMChange = (field, value) => {
    const mm = parseFloat(value);
    if (!isNaN(mm)) {
      let cbm = mm;
      ['length', 'width', 'height'].forEach((keyfield) => {
        if (keyfield !== field) {
          const fieldval = this.props.form.getFieldValue(keyfield);
          if (fieldval) {
            cbm *= fieldval;
          }
        }
      });
      this.props.setSkuForm({ cbm: Number(cbm.toFixed(3)) });
    } else {
      this.props.setSkuForm({ cbm: null });
    }
  }
  handlePackQtyChange = (ev) => {
    const packQty = parseFloat(ev.target.value);
    if (!isNaN(packQty)) {
      const skuForm = this.props.skuForm;
      const newform = {
        sku_pack_qty: packQty,
      };
      if (packQty > 0) {
        if (skuForm.convey_inner_qty) {
          newform.inner_pack_qty = Number((skuForm.convey_inner_qty / packQty).toFixed(3));
        }
        if (skuForm.convey_box_qty) {
          newform.box_pack_qty = Number((skuForm.convey_box_qty / packQty).toFixed(3));
        }
        if (skuForm.convey_pallet_qty) {
          newform.pallete_pack_qty = Number((skuForm.convey_pallet_qty / packQty).toFixed(3));
        }
      }
      this.props.setSkuForm(newform);
    } else {
      this.props.setSkuForm({
        sku_pack_qty: null,
      });
    }
  }
  render() {
    const { form: { getFieldDecorator }, owner, units, currencies, skuForm, mode } = this.props;
    return (
      <div>
        <Card title="产品属性">
          <Row gutter={16}>
            <Col sm={24} lg={24}>
              <FormItem label="货主">
                <Input value={owner.partner_code ? `${owner.partner_code} | ${owner.name}` : owner.name} disabled />
              </FormItem>
            </Col>
            <Col sm={24} lg={12}>
              <FormItem label={this.msg('productNo')}>
                {getFieldDecorator('product_no', {
                  rules: [{ required: true }],
                  initialValue: skuForm.product_no,
                })(<Input />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={12}>
              <FormItem label={this.msg('category')}>
                {getFieldDecorator('category', {
                  initialValue: skuForm.category,
                })(<Input />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={12}>
              <FormItem label={this.msg('descCN')}>
                {getFieldDecorator('desc_cn', {
                  initialValue: skuForm.desc_cn,
                })(<Input />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={12}>
              <FormItem label={this.msg('descEN')}>
                {getFieldDecorator('desc_en', {
                  initialValue: skuForm.desc_en,
                })(<Input />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={12}>
              <FormItem label={this.msg('measureUnit')}>
                <Select showSearch allowClear optionFilterProp="children" placeholder="选择计量单位"
                  value={skuForm.unit} onChange={this.handleUnitChange}
                >
                  {units.map(unit => <Option value={unit.code} key={unit.code}>{unit.code} | {unit.name}</Option>)}
                </Select>
              </FormItem>
            </Col>
            <Col sm={24} lg={12}>
              <FormItem label={this.msg('unitPrice')}>
                <InputGroup compact>
                  <Select showSearch allowClear optionFilterProp="children" size="large" style={{ width: '40%' }}
                    value={skuForm.currency} onChange={this.handleCurrChange}
                  >
                    {currencies.map(curr => <Option value={curr.code} key={curr.code}>{curr.code} | {curr.name}</Option>)}
                  </Select>
                  <Input style={{ width: '60%' }} value={skuForm.unit_price} onChange={ev => this.handleFormChange('unit_price', ev.target.value)} />
                </InputGroup>
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('alias1')}>
                {getFieldDecorator('alias1', {
                  initialValue: skuForm.alias1,
                })(<Input />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('alias2')}>
                {getFieldDecorator('alias2', {
                  initialValue: skuForm.alias2,
                })(<Input />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('alias3')}>
                {getFieldDecorator('alias3', {
                  initialValue: skuForm.alias3,
                })(<Input />)}
              </FormItem>
            </Col>
          </Row>
        </Card>
        <Card title="SKU属性" style={{ marginTop: 16 }} extra={<span>
          <Checkbox checked={skuForm.product_default} onChange={ev => this.handleFormChange('product_default', ev.target.checked)}>
              设置当前为默认
            </Checkbox>
          {mode !== 'create' &&
          <Dropdown.Button onClick={this.handleVariantAdd} overlay={
            <Menu onClick={this.handleSkuVariantClick}>
              {skuForm.variants.map(vart => <Menu.Item key={vart.product_sku}>{vart.product_sku}</Menu.Item>)}
            </Menu>
              }
          >
            添加变种
          </Dropdown.Button>}</span>}
        >
          <Row gutter={16}>
            <Col sm={24} lg={8}>
              <FormItem label={(
                <span>
                  SKU&nbsp;
                  <Tooltip title="SKU (Stock Keeping Unit) is a unique name for your product.">
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </span>
                )}
              >
                {getFieldDecorator('product_sku', {
                  rules: [{ required: true }],
                  initialValue: skuForm.product_sku,
                })(<Input />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('skuPack')}>
                <Select allowClear placeholder="选择SKU包装单位" onSelect={this.handlePackUnitChange} value={skuForm.sku_pack_unit}>
                  {CWM_SKU_PACK_UNITS.map(cspu => <Option value={cspu.value} key={cspu.value}>{cspu.text}</Option>)}
                </Select>
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('perSKUQty')}>
                <InputGroup compact>
                  <Input style={{ width: '70%' }} value={skuForm.sku_pack_qty} onChange={this.handlePackQtyChange} />
                  <Input value={skuForm.unit_name} style={{ width: '30%' }} disabled />
                </InputGroup>
              </FormItem>
            </Col>
            <Col sm={24} lg={6}>
              <FormItem label={this.msg('length')}>
                {getFieldDecorator('length', {
                  initialValue: skuForm.length,
                  onChange: ev => this.handleCBMChange('length', ev.target.value),
                })(<Input addonAfter="mm" />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={6}>
              <FormItem label={this.msg('width')}>
                {getFieldDecorator('width', {
                  initialValue: skuForm.width,
                  onChange: ev => this.handleCBMChange('width', ev.target.value),
                })(<Input addonAfter="mm" />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={6}>
              <FormItem label={this.msg('height')}>
                {getFieldDecorator('height', {
                  initialValue: skuForm.height,
                  onChange: ev => this.handleCBMChange('height', ev.target.value),
                })(<Input addonAfter="mm" />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={6}>
              <FormItem label={this.msg('unitCBM')}>
                <Input value={skuForm.cbm} disabled />
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('grossWeight')}>
                {getFieldDecorator('gross_wt', {
                  initialValue: skuForm.gross_wt,
                })(<Input addonAfter="KG" />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('netWeight')}>
                {getFieldDecorator('net_wt', {
                  initialValue: skuForm.net_wt,
                })(<Input addonAfter="KG" />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('tareWeight')}>
                {getFieldDecorator('tare_wt', {
                  initialValue: skuForm.tare_wt,
                })(<Input addonAfter="KG" />)}
              </FormItem>
            </Col>
          </Row>
        </Card>
        <Card title="海关商品归类" style={{ marginTop: 16 }} extra={<Button icon="sync">同步归类</Button>}>
          <Row gutter={16}>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('hscode')}>
                <Input value={skuForm.hscode} disabled />
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label="规格型号">
                <Input value={skuForm.model} disabled />
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label="原产国">
                <Input value={skuForm.country} disabled />
              </FormItem>
            </Col>
          </Row>
        </Card>
      </div>
    );
  }
}
