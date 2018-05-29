import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Card, Collapse } from 'antd';
import { GOODSTYPES, WRAP_TYPE } from 'common/constants';
import DescriptionList from 'client/components/DescriptionList';
import { showCustomerPanel } from 'common/reducers/partner';
import { loadOrderProducts } from 'common/reducers/sofOrders';
import { formatMsg } from '../message.i18n';

const { Panel } = Collapse;
const { Description } = DescriptionList;

@injectIntl
@connect(state => ({
  tenantId: state.account.tenantId,
  dockVisible: state.sofOrders.dock.visible,
  order: state.sofOrders.dock.order,
}), { loadOrderProducts, showCustomerPanel })
export default class ShipmentGeneralPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    order: PropTypes.shape({
      shipmt_order_no: PropTypes.string,
    }).isRequired,
  }
  msg = formatMsg(this.props.intl)
  handleShowCusPanel = (customer) => {
    this.props.showCustomerPanel({ visible: true, customer });
  }
  render() {
    const { order } = this.props;
    const goods = GOODSTYPES.filter(gt => gt.value === order.cust_shipmt_goods_type)[0];
    // const transMode = TRANS_MODE.filter(tm => tm.value === order.cust_shipmt_trans_mode)[0];
    const wrapType = WRAP_TYPE.filter(wt => wt.value === order.cust_shipmt_wrap_type)[0];
    return (
      <div className="pane-content tab-pane">
        <Card bodyStyle={{ padding: 0 }}>
          <Collapse bordered={false} defaultActiveKey={['basic']}>
            <Panel header={this.msg('basicInfo')} key="basic">
              <DescriptionList col={2}>
                <Description term="客户"><a onClick={this.handleShowCusPanel}>{order.customer_name}</a></Description>
                <Description term="客户单号">{order.cust_order_no}</Description>
                <Description term="货物类型">{goods ? goods.text : ''}</Description>
                <Description term="总件数" addonAfter={wrapType && wrapType.text}>{order.cust_shipmt_pieces}</Description>
              </DescriptionList>
            </Panel>
            <Panel header={this.msg('extendedInfo')} key="extended">
              <DescriptionList col={2}>
                <Description term="扩展字段1">{order.ext_attr_1}</Description>
                <Description term="扩展字段2">{order.ext_attr_2}</Description>
                <Description term="扩展字段3">{order.ext_attr_3}</Description>
                <Description term="扩展字段4">{order.ext_attr_4}</Description>
              </DescriptionList>
            </Panel>
            <Panel header={this.msg('sysInfo')} key="sysInfo">
              <DescriptionList col={2}>
                <Description term={this.msg('createdBy')}>{order.created_by}</Description>
                <Description term={this.msg('lastUpdatedBy')}>{order.last_updated_by}</Description>
                <Description term={this.msg('createdDate')}>{order.created_date && moment(order.created_date).format('YYYY.MM.DD HH:mm')}</Description>
                <Description term={this.msg('lastUpdatedDate')}>{order.last_updated_date && moment(order.last_updated_date).format('YYYY.MM.DD HH:mm')}</Description>
              </DescriptionList>
            </Panel>
          </Collapse>
        </Card>
      </div>
    );
  }
}
