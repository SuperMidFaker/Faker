import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Popover, Form, Input, Icon, Tooltip } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
import { loadSkuRule } from 'common/reducers/cwmSku';

const formatMsg = format(messages);
const FormItem = Form.Item;
const InputGroup = Input.Group;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    packings: state.cwmSku.params.packings,
    skuRule: state.cwmSku.skuRule,
  }),
  { loadSkuRule }
)
export default class PackagePopover extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    sku: PropTypes.string.isRequired,
    ownerPartnerId: PropTypes.number.isRequired,
  }
  state = {
    visible: false,
    sku: {},
  }
  msg = key => formatMsg(this.props.intl, key);
  handleVisibleChange = (visible) => {
    this.setState({ visible });
    if (visible && Object.keys(this.state.sku).length === 0) {
      this.props.loadSkuRule(this.props.ownerPartnerId, this.props.sku, this.props.tenantId);
    }
  }
  render() {
    const sku = this.props.sku;
    const { skuRule } = this.props;
    const content = (
      <div style={{ width: 280 }}>
        <Form layout="vertical" className="form-layout-compact">
          <FormItem label={(
            <span>
                SKU&nbsp;
                  <Tooltip title="仓库料号">
                    <Icon type="question-circle-o" />
                  </Tooltip>
            </span>
                )}
          >
            <Input className="readonly" value={sku} disabled />
          </FormItem>
          <FormItem label="商品货号">
            <Input className="readonly" value={skuRule.product_no} disabled />
          </FormItem>
          <FormItem label={(
            <span>
                计量单位数量&nbsp;
                  <Tooltip title="每件SKU对应的商品计量单位数量">
                    <Icon type="question-circle-o" />
                  </Tooltip>
            </span>
                )}
          >
            <Input className="readonly" value={skuRule.sku_pack_qty} disabled />
          </FormItem>
          <FormItem label={(
            <span>
                内包装量&nbsp;
                  <Tooltip title="每个内包装容纳的SKU件数、商品计量单位数量">
                    <Icon type="question-circle-o" />
                  </Tooltip>
            </span>
                )}
          >
            <InputGroup compact>
              <Input className="readonly" style={{ width: '50%' }} placeholder="SKU件数" value={skuRule.inner_pack_qty} disabled />
              <Input className="readonly" style={{ width: '50%' }} placeholder="计量单位数量" value={skuRule.convey_inner_qty} disabled />
            </InputGroup>
          </FormItem>
          <FormItem label={(
            <span>
                装箱量&nbsp;
                  <Tooltip title="每箱容纳的SKU件数、商品计量单位数量">
                    <Icon type="question-circle-o" />
                  </Tooltip>
            </span>
                )}
          >
            <InputGroup compact>
              <Input className="readonly" style={{ width: '50%' }} placeholder="SKU件数" value={skuRule.box_pack_qty} disabled />
              <Input className="readonly" style={{ width: '50%' }} placeholder="计量单位数量" value={skuRule.convey_box_qty} disabled />
            </InputGroup>
          </FormItem>
          <FormItem label={(
            <span>
                  码盘量&nbsp;
                  <Tooltip title="每托盘容纳的箱数量、SKU件数、商品计量单位数量">
                    <Icon type="question-circle-o" />
                  </Tooltip>
            </span>
                )}
          >
            <InputGroup compact>
              <Input className="readonly" style={{ width: '34%' }} placeholder="箱数量" value={(skuRule.convey_pallet_qty && skuRule.convey_box_qty) ?
                 skuRule.convey_pallet_qty / skuRule.convey_box_qty : ''} disabled
              />
              <Input className="readonly" style={{ width: '33%' }} placeholder="SKU件数" value={skuRule.pallet_pack_qty} disabled />
              <Input className="readonly" style={{ width: '33%' }} placeholder="计量单位数量" value={skuRule.convey_pallet_qty} disabled />
            </InputGroup>
          </FormItem>
        </Form>
      </div>
    );
    return (
      <Popover content={content} title="货品信息" trigger="click" visible={this.state.visible} onVisibleChange={this.handleVisibleChange}>
        <Button size="small">{sku}</Button>
      </Popover>
    );
  }
}
