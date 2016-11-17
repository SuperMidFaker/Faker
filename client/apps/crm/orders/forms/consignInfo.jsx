import React, { PropTypes } from 'react';
import { Form, Input, Popover } from 'antd';
import RegionCascade from 'client/components/region-cascade';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

@injectIntl

export default class ConsignInfo extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    index: PropTypes.number.isRequired,
    consignType: PropTypes.string.isRequired,
    consign: PropTypes.object.isRequired,
    handleRegionValueChange: PropTypes.func.isRequired,
    handleChange: PropTypes.func.isRequired,
  }
  state = {
    visible: false,
  }
  componentDidMount() {
    const { consignType, index } = this.props;
    window.$(document).click((event) => {
      const pickupDeliverClicked = window.$(event.target).closest(`.pickupDeliver${consignType}${index}`).length > 0;
      const antPopoverClicked = window.$(event.target).closest('.ant-popover').length > 0;
      const cascaderClicked = window.$(event.target).closest('.ant-cascader-menus').length > 0;
      if (!pickupDeliverClicked && !cascaderClicked && !antPopoverClicked && this.state.visible) {
        this.handleClose();
      }
    });
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  
  handleClose = () => {
    this.setState({ visible: false });
  }
  handleShowPopover = (visible) => {
    if (visible) {
      this.setState({ visible });  
    }
  }
  render() {
    const { consignType, consign, index } = this.props;
    const title = consignType === 'consigner' ? '发货方' : '收货方';
    const consignRegion = [
      consign[`${consignType}_province`], consign[`${consignType}_city`],
      consign[`${consignType}_district`], consign[`${consignType}_street`],
    ];
    const content = (
      <div style={{ width: 250 }}>
        <FormItem label="目的地" {...formItemLayout}>
          <RegionCascade defaultRegion={consignRegion} region={consignRegion}
            onChange={region => this.props.handleRegionValueChange(index, consignType, region)}
            style={{ width: '100%' }}
          />
        </FormItem>
        <FormItem label="送货地址" {...formItemLayout}>
          <Input value={consign[`${consignType}_addr`]}
            onChange={e => this.props.handleChange(index, `${consignType}_addr`, e.target.value)}
          />
        </FormItem>
        <FormItem label="联系人" {...formItemLayout}>
          <Input value={consign[`${consignType}_contact`]}
            onChange={e => this.props.handleChange(index, `${consignType}_contact`, e.target.value)}
          />
        </FormItem>
        <FormItem label="电话" {...formItemLayout}>
          <Input value={consign[`${consignType}_mobile`]} type="tel"
            onChange={e => this.props.handleChange(index, `${consignType}_mobile`, e.target.value)}
          />
        </FormItem>
        <FormItem label="邮箱" {...formItemLayout}>
          <Input value={consign[`${consignType}_email`]} type="email"
            onChange={e => this.props.handleChange(index, `${consignType}_email`, e.target.value)}
          />
        </FormItem>

      </div>);
    return (
      <Popover title={title}
        placement="topRight"
        trigger="click"
        content={content}
        visible={this.state.visible}
        onVisibleChange={this.handleShowPopover}
      >
        <a className={`pickupDeliver${consignType}${index}`} >{title}</a>
      </Popover>
    );
  }
}
