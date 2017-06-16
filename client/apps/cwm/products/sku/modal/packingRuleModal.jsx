import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Radio, Form, Modal, Input, Row, Col } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
import { closePackingRuleModal } from 'common/reducers/cwmSku';

const formatMsg = format(messages);
const FormItem = Form.Item;
const InputGroup = Input.Group;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

@injectIntl
@connect(
  state => ({
    visible: state.cwmSku.packingRuleModal.visible,
  }),
  { closePackingRuleModal }
)
@Form.create()
export default class PackingRuleModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    shippingMode: PropTypes.string,
  }
  msg = key => formatMsg(this.props.intl, key);
  handleCancel = () => {
    this.props.closePackingRuleModal();
  }

  render() {
    const { form: { getFieldDecorator } } = this.props;
    return (
      <Modal title="包装规则" width={800} maskClosable={false} onCancel={this.handleCancel} visible={this.props.visible}>
        <Form>
          <Row gutter={16}>
            <Col sm={12}>
              <FormItem label={this.msg('packingCode')}>
                <Input />
              </FormItem>
            </Col>
            <Col sm={12}>
              <FormItem label={this.msg('desc')}>
                <Input />
              </FormItem>
            </Col>
            <Col sm={12}>
              <FormItem label={this.msg('内包装量')}>
                <InputGroup compact>
                  <Input style={{ width: '50%' }} placeholder="SKU包装单位数量"
                    onChange={this.handleInnerChange}
                  />
                  <Input style={{ width: '50%' }} placeholder="主单位数量" disabled />
                </InputGroup>
              </FormItem>
            </Col>
            <Col sm={12}>
              <FormItem label={this.msg('装箱量')}>
                <InputGroup compact>
                  <Input style={{ width: '50%' }} placeholder="SKU包装单位数量"
                    onChange={this.handleBoxChange}
                  />
                  <Input style={{ width: '50%' }} placeholder="主单位数量" disabled />
                </InputGroup>
              </FormItem>
            </Col>
            <Col sm={24}>
              <FormItem label={this.msg('码盘量')}>
                <InputGroup compact>
                  <Input style={{ width: '34%' }} placeholder="箱量"
                    onChange={this.handlePalleteChange}
                  />
                  <Input style={{ width: '33%' }} placeholder="SKU包装单位数量" disabled />
                  <Input style={{ width: '33%' }} placeholder="主单位数量" disabled />
                </InputGroup>
              </FormItem>
            </Col>
            <Col sm={8}>
              <FormItem label={this.msg('默认入库包装')}>
                {getFieldDecorator('inbound_convey', {
                })(<RadioGroup size="large">
                  <RadioButton value="PCS">单件</RadioButton>
                  <RadioButton value="INP">内包装</RadioButton>
                  <RadioButton value="BOX">箱</RadioButton>
                  <RadioButton value="PLT">托盘</RadioButton>
                </RadioGroup>
                  )}
              </FormItem>
            </Col>
            <Col sm={8}>
              <FormItem label={this.msg('默认补货包装')}>
                {getFieldDecorator('replenish_convey', {
                })(<RadioGroup size="large">
                  <RadioButton value="BOX">箱</RadioButton>
                  <RadioButton value="PLT">托盘</RadioButton>
                </RadioGroup>
                  )}
              </FormItem>
            </Col>
            <Col sm={8}>
              <FormItem label={this.msg('默认出库包装')}>
                {getFieldDecorator('outbound_convey', {
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
              <FormItem label={this.msg('默认ASN收货单位')}>
                {getFieldDecorator('asn_tag_unit', {
                })(<RadioGroup size="large">
                  <RadioButton value="primary">计量主单位</RadioButton>
                  <RadioButton value="sku">SKU包装单位</RadioButton>
                </RadioGroup>
                  )}
              </FormItem>
            </Col>
            <Col sm={12}>
              <FormItem label={this.msg('默认SO发货单位')}>
                {getFieldDecorator('so_tag_unit', {
                })(<RadioGroup size="large">
                  <RadioButton value="primary">计量主单位</RadioButton>
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
