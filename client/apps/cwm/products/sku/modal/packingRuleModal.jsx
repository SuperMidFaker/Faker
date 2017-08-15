import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Radio, Form, Modal, Input, Row, Col } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
import { closePackingRuleModal, saveSkuTemplate, loadSkuParams } from 'common/reducers/cwmSku';

const formatMsg = format(messages);
const FormItem = Form.Item;
const InputGroup = Input.Group;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

@injectIntl
@connect(
  state => ({
    visible: state.cwmSku.packingRuleModal.visible,
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    owner: state.cwmSku.owner,
  }),
  { closePackingRuleModal, saveSkuTemplate, loadSkuParams }
)
@Form.create()
export default class PackingRuleModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    shippingMode: PropTypes.string,
  }
  state = {
    conveyBoxQty: '',
    conveyPalletQty: '',
  }
  msg = key => formatMsg(this.props.intl, key);
  handleCancel = () => {
    this.props.closePackingRuleModal();
  }
  handleSubmit = (e) => {
    e.preventDefault();
    const { tenantId, loginId, owner } = this.props;
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const data = values;
        data.convey_pallet_qty = data.convey_box_qty * data.pallet_pack_qty;
        this.props.saveSkuTemplate(data, tenantId, loginId, owner.id).then((result) => {
          if (!result.error) {
            this.props.loadSkuParams(this.props.owner.id);
            this.props.closePackingRuleModal();
            this.props.form.setFieldsValue({
              code: '',
              desc: '',
              convey_inner_qty: '',
              convey_box_qty: '',
              convey_pallet_qty: '',
            });
          }
        });
      }
    });
  }
  handleBoxChange = (e) => {
    this.setState({ conveyBoxQty: e.target.value });
  }
  handlePalleteChange = (e) => {
    this.setState({ conveyPalletQty: e.target.value });
  }
  render() {
    const { form: { getFieldDecorator } } = this.props;
    const { conveyBoxQty, conveyPalletQty } = this.state;
    return (
      <Modal title="包装规则" width={800} maskClosable={false} onCancel={this.handleCancel} onOk={this.handleSubmit} visible={this.props.visible}>
        <Form>
          <Row gutter={16}>
            <Col sm={12}>
              <FormItem label={this.msg('packingCode')}>
                {getFieldDecorator('code', {
                  rules: [{
                    required: true, message: 'Please input code!',
                  }],
                })(<Input />)}
              </FormItem>
            </Col>
            <Col sm={12}>
              <FormItem label={this.msg('desc')}>
                {getFieldDecorator('desc', {
                })(<Input />)}
              </FormItem>
            </Col>
            <Col sm={12}>
              <FormItem label={this.msg('内包装量')}>
                <InputGroup compact>
                  {getFieldDecorator('convey_inner_qty', {
                    rules: [{
                      required: true, message: 'Please input convey_inner_qty!',
                    }],
                  })(<Input style={{ width: '100%' }} placeholder="SKU件数" />)}
                </InputGroup>
              </FormItem>
            </Col>
            <Col sm={12}>
              <FormItem label={this.msg('装箱量')}>
                <InputGroup compact>
                  {getFieldDecorator('convey_box_qty', {
                    rules: [{
                      required: true, message: 'Please input convey_box_qty!',
                    }],
                    initialValue: conveyBoxQty,
                  })(<Input style={{ width: '100%' }} placeholder="SKU件数" onChange={this.handleBoxChange} />)}
                </InputGroup>
              </FormItem>
            </Col>
            <Col sm={24}>
              <FormItem label={this.msg('码盘量')}>
                <InputGroup compact>
                  {getFieldDecorator('pallet_pack_qty', {
                    rules: [{
                      required: true, message: 'Please input pallet_pack_qty!',
                    }],
                    initialValue: conveyPalletQty,
                  })(<Input style={{ width: '50%' }} placeholder="箱量" onChange={this.handlePalleteChange} />)}
                  <Input value={conveyPalletQty * conveyBoxQty ? conveyPalletQty * conveyBoxQty : ''} style={{ width: '50%' }} placeholder="SKU件数" disabled />
                </InputGroup>
              </FormItem>
            </Col>
            <Col sm={12}>
              <FormItem label={this.msg('默认入库包装')}>
                {getFieldDecorator('inbound_convey', {
                  initialValue: 'PCS',
                })(<RadioGroup size="large">
                  <RadioButton value="PCS">单件</RadioButton>
                  <RadioButton value="INP">内包装</RadioButton>
                  <RadioButton value="BOX">箱</RadioButton>
                  <RadioButton value="PLT">托盘</RadioButton>
                </RadioGroup>
                  )}
              </FormItem>
            </Col>
            <Col sm={12}>
              <FormItem label={this.msg('默认出库包装')}>
                {getFieldDecorator('outbound_convey', {
                  initialValue: 'PCS',
                })(<RadioGroup size="large">
                  <RadioButton value="PCS">单件</RadioButton>
                  <RadioButton value="INP">内包装</RadioButton>
                  <RadioButton value="BOX">箱</RadioButton>
                  <RadioButton value="PLT">托盘</RadioButton>
                </RadioGroup>
                  )}
              </FormItem>
            </Col>
            <Col sm={12}>
              <FormItem label={this.msg('默认追踪包装')}>
                {getFieldDecorator('tracing_convey', {
                  initialValue: 'PCS',
                })(<RadioGroup size="large">
                  <RadioButton value="PCS">单件</RadioButton>
                  <RadioButton value="INP">内包装</RadioButton>
                  <RadioButton value="BOX">箱</RadioButton>
                  <RadioButton value="PLT">托盘</RadioButton>
                </RadioGroup>
                  )}
              </FormItem>
            </Col>
            <Col sm={12}>
              <FormItem label={this.msg('默认补货包装')}>
                {getFieldDecorator('replenish_convey', {
                  initialValue: 'BOX',
                })(<RadioGroup size="large">
                  <RadioButton value="BOX">箱</RadioButton>
                  <RadioButton value="PLT">托盘</RadioButton>
                </RadioGroup>
                  )}
              </FormItem>
            </Col>
            <Col sm={12}>
              <FormItem label={this.msg('默认ASN收货单位')}>
                {getFieldDecorator('asn_tag_unit', {
                  initialValue: 'primary',
                })(<RadioGroup size="large">
                  <RadioButton value="primary">计量单位</RadioButton>
                  <RadioButton value="sku">SKU包装单位</RadioButton>
                </RadioGroup>
                  )}
              </FormItem>
            </Col>
            <Col sm={12}>
              <FormItem label={this.msg('默认SO发货单位')}>
                {getFieldDecorator('so_tag_unit', {
                  initialValue: 'primary',
                })(<RadioGroup size="large">
                  <RadioButton value="primary">计量单位</RadioButton>
                  <RadioButton value="sku">SKU包装单位</RadioButton>
                </RadioGroup>
                  )}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}
