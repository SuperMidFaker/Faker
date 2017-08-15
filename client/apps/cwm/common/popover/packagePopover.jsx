import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Popover, Form, Input, Icon, Tooltip } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
import { loadSku } from 'common/reducers/cwmSku';

const formatMsg = format(messages);
const FormItem = Form.Item;
const InputGroup = Input.Group;

@injectIntl
@connect(
  state => ({
    packings: state.cwmSku.params.packings,
    skuForm: state.cwmSku.skuForm,
  }),
  { loadSku }
)
export default class PackagePopover extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    sku: PropTypes.string.isRequired,
  }
  state = {
    visible: false,
    sku: {},
  }
  msg = key => formatMsg(this.props.intl, key);
  handleVisibleChange = (visible) => {
    this.setState({ visible });
    if (visible && Object.keys(this.state.sku).length === 0) {
      this.props.loadSku(this.props.sku);
    }
  }
  render() {
    const sku = this.props.sku;
    const { skuForm } = this.props;
    const content = (
      <div style={{ width: 280 }}>
        <Form layout="vertical" className="form-layout-compact">
          <FormItem label={(
            <span>
                计量单位数量&nbsp;
                  <Tooltip title="每件SKU对应的商品计量单位数量">
                    <Icon type="question-circle-o" />
                  </Tooltip>
            </span>
                )}
          >
            <Input className="readonly" defaultValue="1" disabled />
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
              <Input className="readonly" style={{ width: '50%' }} placeholder="SKU件数" value={skuForm.inner_pack_qty} disabled />
              <Input className="readonly" style={{ width: '50%' }} placeholder="计量单位数量" value={skuForm.convey_inner_qty} disabled />
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
              <Input className="readonly" style={{ width: '50%' }} placeholder="SKU件数" value={skuForm.box_pack_qty} disabled />
              <Input className="readonly" style={{ width: '50%' }} placeholder="计量单位数量" value={skuForm.convey_box_qty} disabled />
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
              <Input className="readonly" style={{ width: '34%' }} placeholder="箱数量" value={skuForm.pallet_box_qty} disabled />
              <Input className="readonly" style={{ width: '33%' }} placeholder="SKU件数" value={skuForm.pallet_pack_qty} disabled />
              <Input className="readonly" style={{ width: '33%' }} placeholder="计量单位数量" value={skuForm.convey_pallet_qty} disabled />
            </InputGroup>
          </FormItem>
        </Form>
      </div>
    );
    return (
      <Popover content={content} title="SKU包装规则" trigger="click" visible={this.state.visible} onVisibleChange={this.handleVisibleChange}>
        <Button size="small">{sku}</Button>
      </Popover>
    );
  }
}
