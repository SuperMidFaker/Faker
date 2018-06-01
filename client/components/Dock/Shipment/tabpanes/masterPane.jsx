import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Card, Collapse } from 'antd';
import { GOODSTYPES, WRAP_TYPE, TRANS_MODES, SAAS_PARAM_TYPE } from 'common/constants';
import DescriptionList from 'client/components/DescriptionList';
import { showCustomerPanel } from 'common/reducers/partner';
import { loadOrderProducts } from 'common/reducers/sofOrders';
import { loadParams } from 'common/reducers/saasParams';
import { formatMsg } from '../message.i18n';

const { Panel } = Collapse;
const { Description } = DescriptionList;

@injectIntl
@connect(state => ({
  tenantId: state.account.tenantId,
  dockVisible: state.sofOrders.dock.visible,
  order: state.sofOrders.dock.order,
  uesrMembers: state.account.userMembers,
  countries: state.saasParams.countries,
  declPorts: state.saasParams.declPorts,
  currencies: state.saasParams.currencies,
  customsBrokers: state.saasParams.customsBrokers,
}), { loadOrderProducts, showCustomerPanel, loadParams })
export default class ShipmentGeneralPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    order: PropTypes.shape({
      shipmt_order_no: PropTypes.string,
    }).isRequired,
  }
  componentDidMount() {
    this.props.loadParams([SAAS_PARAM_TYPE.CURRENCY,
      SAAS_PARAM_TYPE.COUNTRY, SAAS_PARAM_TYPE.DECLPORT]);
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
    let transferInfo = null;
    let origDestInfo = null;
    let freightInfo = null;
    if (order.cust_shipmt_transfer !== 'DOM') {
      let labelCountry = '';
      let labelIEPort = '';
      if (order.cust_shipmt_transfer === 'EXP') {
        labelCountry = '运抵国(地区)';
        labelIEPort = '出口口岸';
      } else if (order.cust_shipmt_transfer === 'IMP') {
        labelCountry = '启运国(地区)';
        labelIEPort = '进口口岸';
      }
      const origDestCountry = this.props.countries.find(cntry =>
        cntry.cntry_co === order.cust_shipmt_orig_dest_country);
      const shipmtIEport = this.props.declPorts.find(custport =>
        custport.code === order.cust_shipmt_i_e_port);
      origDestInfo = (
        <DescriptionList col={4}>
          <Description term={labelCountry}>
            {origDestCountry && `${order.cust_shipmt_orig_dest_country} | ${origDestCountry.cntry_name_cn}`}
          </Description>
          <Description term={labelIEPort}>
            {shipmtIEport && `${order.cust_shipmt_i_e_port} | ${shipmtIEport.name}`}
          </Description>
          <Description term="起运港">
            {order.cust_shipmt_dept_port}
          </Description>
          <Description term="抵运港">
            {order.cust_shipmt_dest_port}
          </Description>
        </DescriptionList>
      );
      const shipmtFreight = this.props.currencies.find(curr =>
        curr.curr_code === order.cust_shipmt_freight_currency);
      const shipmtInsurFee = this.props.currencies.find(curr =>
        curr.curr_code === order.cust_shipmt_insur_currency);
      const shipmtMiscFee = this.props.currencies.find(curr =>
        curr.curr_code === order.cust_shipmt_misc_currency);
      freightInfo = (
        <DescriptionList col={4}>
          <Description term="国际货运代理">
            {order.cust_shipmt_forwarder}
          </Description>
          <Description term="运费">
            {shipmtFreight && `${order.cust_shipmt_freight} | ${shipmtFreight.curr_name}`}
          </Description>
          <Description term="保费">
            {shipmtInsurFee && `${order.cust_shipmt_insur_fee} | ${shipmtInsurFee.curr_name}`}
          </Description>
          <Description term="杂费">
            {shipmtMiscFee && `${order.cust_shipmt_misc_fee} | ${shipmtMiscFee.curr_name}`}
          </Description>
        </DescriptionList>
      );
      const shipmtTransMode = TRANS_MODES.find(mode => mode.value === order.cust_shipmt_trans_mode);
      if (order.cust_shipmt_trans_mode === '2') {
        transferInfo = (
          <DescriptionList col={4}>
            <Description term="国际运输方式">
              {shipmtTransMode && shipmtTransMode.text}
            </Description>
            <Description term="提单号*分提单号">
              {order.cust_shipmt_bill_lading}
            </Description>
            <Description term="海运单号">
              {order.cust_shipmt_bill_lading_no}
            </Description>
            <Description term="船名航次">
              船舶英文名称: {order.cust_shipmt_vessel} | 航次号: {order.cust_shipmt_voy}
            </Description>
          </DescriptionList>
        );
      } else if (order.cust_shipmt_trans_mode === '5') {
        transferInfo = (
          <DescriptionList col={4}>
            <Description term="国际运输方式">
              {shipmtTransMode && shipmtTransMode.text}
            </Description>
            <Description term="主运单号">
              {order.cust_shipmt_mawb}
            </Description>
            <Description term="分运单号">
              {order.cust_shipmt_hawb}
            </Description>
            <Description term="航班号">
              {order.cust_shipmt_vessel}
            </Description>
          </DescriptionList>
        );
      }
    }
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
              <DescriptionList col={3}>
                <Description term="包装">
                  {WRAP_TYPE.find(type => type.value === order.cust_shipmt_wrap_type) &&
                    WRAP_TYPE.find(type => type.value === order.cust_shipmt_wrap_type).text
                  }
                </Description>
                <Description term="总毛重" addonAfter="KG">{order.cust_shipmt_weight}</Description>
                <Description term="CBM" addonAfter="立方米">{order.cust_shipmt_volume}</Description>
              </DescriptionList>
              {transferInfo}
              {origDestInfo}
              {freightInfo}
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
                <Description term={this.msg('createdBy')}>
                  {this.props.uesrMembers.find(user =>
                  user.login_id === order.creater_login_id) &&
                  this.props.uesrMembers.find(user =>
                  user.login_id === order.creater_login_id).name}
                </Description>
                <Description term={this.msg('lastUpdatedBy')}>
                  {this.props.uesrMembers.find(user => user.login_id === order.last_updated_by) &&
                this.props.uesrMembers.find(user => user.login_id === order.last_updated_by).name}
                </Description>
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
