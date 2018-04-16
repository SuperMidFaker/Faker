import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Popover, Form, Input, Icon, Tooltip } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { loadSkuInfo } from 'common/reducers/cwmSku';
import { formatMsg } from '../../message.i18n';

const FormItem = Form.Item;
const InputGroup = Input.Group;

@injectIntl
@connect(
  state => ({
    packings: state.cwmSku.params.packings,
    skuInfo: state.cwmSku.skuInfo,
  }),
  { loadSkuInfo }
)
export default class SKUPopover extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    sku: PropTypes.string.isRequired,
    ownerPartnerId: PropTypes.number.isRequired,
  }
  state = {
    visible: false,
    sku: {},
  }
  msg = formatMsg(this.props.intl)
  handleVisibleChange = (visible) => {
    this.setState({ visible });
    if (visible && Object.keys(this.state.sku).length === 0) {
      this.props.loadSkuInfo(this.props.ownerPartnerId, this.props.sku);
    }
  }
  render() {
    const { sku, skuInfo } = this.props;
    const content = (
      <div style={{ width: 280 }}>
        <Form layout="vertical" className="form-layout-compact">
          <FormItem label="商品货号">
            <Input className="readonly" value={skuInfo.product_no} disabled />
          </FormItem>
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
          <FormItem label="CBM">
            <Input className="readonly" value={skuInfo.cbm} disabled />
          </FormItem>
          <FormItem label={(
            <span>
              每SKU商品数量&nbsp;
              <Tooltip title="每件SKU对应商品的数量(计量单位)">
                <Icon type="question-circle-o" />
              </Tooltip>
            </span>
                )}
          >
            <Input className="readonly" value={skuInfo.sku_pack_qty} disabled />
          </FormItem>
          <FormItem label={(
            <span>
                内包装容量&nbsp;
              <Tooltip title="每个内包装容纳的SKU件数、商品计量单位数量">
                <Icon type="question-circle-o" />
              </Tooltip>
            </span>
                )}
          >
            <InputGroup compact>
              <Input className="readonly" style={{ width: '50%' }} placeholder="SKU件数" value={skuInfo.inner_pack_qty} disabled />
              <Input className="readonly" style={{ width: '50%' }} placeholder="计量单位数量" value={skuInfo.convey_inner_qty} disabled />
            </InputGroup>
          </FormItem>
          <FormItem label={(
            <span>
                装箱容量&nbsp;
              <Tooltip title="每箱容纳的SKU件数、商品计量单位数量">
                <Icon type="question-circle-o" />
              </Tooltip>
            </span>
                )}
          >
            <InputGroup compact>
              <Input className="readonly" style={{ width: '50%' }} placeholder="SKU件数" value={skuInfo.box_pack_qty} disabled />
              <Input className="readonly" style={{ width: '50%' }} placeholder="计量单位数量" value={skuInfo.convey_box_qty} disabled />
            </InputGroup>
          </FormItem>
          <FormItem label={(
            <span>
                  码盘容量&nbsp;
              <Tooltip title="每托盘容纳的箱数量、SKU件数、商品计量单位数量">
                <Icon type="question-circle-o" />
              </Tooltip>
            </span>
                )}
          >
            <InputGroup compact>
              <Input
                className="readonly"
                style={{ width: '34%' }}
                placeholder="箱数量"
                value={(skuInfo.convey_pallet_qty && skuInfo.convey_box_qty) ?
                 skuInfo.convey_pallet_qty / skuInfo.convey_box_qty : ''}
                disabled
              />
              <Input className="readonly" style={{ width: '33%' }} placeholder="SKU件数" value={skuInfo.pallet_pack_qty} disabled />
              <Input className="readonly" style={{ width: '33%' }} placeholder="计量单位数量" value={skuInfo.convey_pallet_qty} disabled />
            </InputGroup>
          </FormItem>
        </Form>
      </div>
    );
    return (
      <Popover content={content} trigger="click" visible={this.state.visible} onVisibleChange={this.handleVisibleChange}>
        <Button size="small">{sku}</Button>
      </Popover>
    );
  }
}
