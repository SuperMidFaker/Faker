import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Form, Card, Col, Row, Input, Select, Radio } from 'antd';
import { setSkuForm } from 'common/reducers/cwmSku';
import { formatMsg } from '../../message.i18n';

const FormItem = Form.Item;
const Option = Select.Option;
const InputGroup = Input.Group;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

@injectIntl
@connect(
  state => ({
    packings: state.cwmSku.params.packings,
    skuForm: state.cwmSku.skuForm,
  }),
  { setSkuForm }
)
export default class SiderForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    packings: PropTypes.arrayOf(PropTypes.shape({
      code: PropTypes.string,
      desc: PropTypes.string,
      convey_inner_qty: PropTypes.number,
      inbound_convey: PropTypes.string,
    })),
  }
  msg = formatMsg(this.props.intl)
  handleInnerChange = (ev) => {
    const packQty = parseFloat(ev.target.value);
    if (!isNaN(packQty)) {
      this.props.setSkuForm({
        inner_pack_qty: packQty,
        convey_inner_qty: this.props.skuForm.sku_pack_qty && Number((packQty * this.props.skuForm.sku_pack_qty).toFixed(3)),
      });
    } else {
      this.props.setSkuForm({
        inner_pack_qty: null,
        convey_inner_qty: null,
      });
    }
  }
  handleBoxChange = (ev) => {
    const packQty = parseFloat(ev.target.value);
    if (!isNaN(packQty)) {
      this.props.setSkuForm({
        box_pack_qty: packQty,
        convey_box_qty: this.props.skuForm.sku_pack_qty && Number((packQty * this.props.skuForm.sku_pack_qty).toFixed(3)),
      });
    } else {
      this.props.setSkuForm({
        box_pack_qty: null,
        convey_box_qty: null,
      });
    }
  }

  handlePalleteChange = (ev) => {
    const boxQty = parseFloat(ev.target.value);
    if (!isNaN(boxQty)) {
      const palletPackQty = this.props.skuForm.box_pack_qty && Number((boxQty * this.props.skuForm.box_pack_qty).toFixed(3));
      this.props.setSkuForm({
        pallet_box_qty: boxQty,
        pallet_pack_qty: palletPackQty,
        convey_pallet_qty: this.props.skuForm.sku_pack_qty && Number((palletPackQty * this.props.skuForm.sku_pack_qty).toFixed(3)),
      });
    } else {
      this.props.setSkuForm({
        pallet_box_qty: null,
        pallet_pack_qty: null,
        convey_pallet_qty: null,
      });
    }
  }
  render() {
    const { form: { getFieldDecorator }, packings, skuForm } = this.props;
    return (
      <div>
        <Card title="仓库控制属性">
          <Row gutter={16}>
            <Col sm={24}>
              <FormItem label={this.msg('packingCode')}>
                <Select showSearch placeholder="选择包装代码" value={skuForm.packing_code}
                  onSelect={this.handlePackingSelect}
                >
                  {packings.map(pack => <Option value={pack.code}>{pack.code} | {pack.desc}</Option>)}
                </Select>
              </FormItem>
            </Col>
            <Col sm={24}>
              <FormItem label={this.msg('内包装量')}>
                <InputGroup compact>
                  <Input style={{ width: '50%' }} placeholder="SKU包装单位数量" value={skuForm.inner_pack_qty}
                    onChange={this.handleInnerChange}
                  />
                  <Input style={{ width: '50%' }} placeholder="主单位数量" value={skuForm.convey_inner_qty} disabled />
                </InputGroup>
              </FormItem>
            </Col>
            <Col sm={24}>
              <FormItem label={this.msg('装箱量')}>
                <InputGroup compact>
                  <Input style={{ width: '50%' }} placeholder="SKU包装单位数量" value={skuForm.box_pack_qty}
                    onChange={this.handleBoxChange}
                  />
                  <Input style={{ width: '50%' }} placeholder="主单位数量" value={skuForm.convey_box_qty} disabled />
                </InputGroup>
              </FormItem>
            </Col>
            <Col sm={24}>
              <FormItem label={this.msg('码盘量')}>
                <InputGroup compact>
                  <Input style={{ width: '34%' }} placeholder="箱量" value={skuForm.pallet_box_qty}
                    onChange={this.handlePalleteChange}
                  />
                  <Input style={{ width: '33%' }} placeholder="SKU包装单位数量" value={skuForm.pallet_pack_qty} disabled />
                  <Input style={{ width: '33%' }} placeholder="主单位数量" value={skuForm.convey_pallet_qty} disabled />
                </InputGroup>
              </FormItem>
            </Col>
            <Col sm={24}>
              <FormItem label={this.msg('默认入库包装')}>
                {getFieldDecorator('inbound_convey', {
                  initialValue: skuForm.inbound_convey,
                })(<RadioGroup size="large">
                  <RadioButton value="PCS">单件(散装)</RadioButton>
                  <RadioButton value="INP">内包装</RadioButton>
                  <RadioButton value="BOX">箱</RadioButton>
                  <RadioButton value="PLT">托盘</RadioButton>
                </RadioGroup>
                  )}
              </FormItem>
            </Col>
            <Col sm={24}>
              <FormItem label={this.msg('默认补货包装')}>
                {getFieldDecorator('replenish_convey', {
                  initialValue: skuForm.replenish_convey,
                })(<RadioGroup size="large">
                  <RadioButton value="BOX">箱</RadioButton>
                  <RadioButton value="PLT">托盘</RadioButton>
                </RadioGroup>
                  )}
              </FormItem>
            </Col>
            <Col sm={24}>
              <FormItem label={this.msg('默认出库包装')}>
                {getFieldDecorator('outbound_convey', {
                  initialValue: skuForm.outbound_convey,
                })(<RadioGroup size="large">
                  <RadioButton value="PCS">单件(散装)</RadioButton>
                  <RadioButton value="INP">内包装</RadioButton>
                  <RadioButton value="BOX">箱</RadioButton>
                  <RadioButton value="PLT">托盘</RadioButton>
                </RadioGroup>
                  )}
              </FormItem>
            </Col>
            <Col sm={24}>
              <FormItem label={this.msg('默认ASN收货单位')}>
                {getFieldDecorator('asn_tag_unit', {
                  initialValue: skuForm.asn_tag_unit,
                })(<RadioGroup size="large">
                  <RadioButton value="primary">计量主单位</RadioButton>
                  <RadioButton value="sku">SKU包装单位</RadioButton>
                </RadioGroup>
                  )}
              </FormItem>
            </Col>
            <Col sm={24}>
              <FormItem label={this.msg('默认SO发货单位')}>
                {getFieldDecorator('so_tag_unit', {
                  initialValue: skuForm.so_tag_unit,
                })(<RadioGroup size="large">
                  <RadioButton value="primary">计量主单位</RadioButton>
                  <RadioButton value="sku">SKU包装单位</RadioButton>
                </RadioGroup>
                  )}
              </FormItem>
            </Col>
            <Col sm={24}>
              <FormItem label={this.msg('lottingRule')}>
                {getFieldDecorator('lot_rule', {
                  initialValue: skuForm.lot_rule,
                })(
                  <Select showSearch optionFilterProp="search" placeholder="选择批次属性" >
                    <Option value="HumanScale">HumanScale</Option>
                  </Select>
                  )}
              </FormItem>
            </Col>
            <Col sm={24}>
              <FormItem label={this.msg('ftzMappingRule')}>
                {getFieldDecorator('ftz_rule', {
                  initialValue: skuForm.ftz_rule,
                })(
                  <Select showSearch optionFilterProp="search" placeholder="选择保税备案映射规则" >
                    <Option value="HumanScale">HumanScale</Option>
                  </Select>
                  )}
              </FormItem>
            </Col>
          </Row>
        </Card>
      </div>
    );
  }
}
