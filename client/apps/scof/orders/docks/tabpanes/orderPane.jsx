import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Row, Col, Card, Collapse, Menu } from 'antd';
import { GOODSTYPES, TRANS_MODE, WRAP_TYPE } from 'common/constants';
import InfoItem from 'client/components/InfoItem';
import { MdIcon } from 'client/components/FontIcon';
import { formatMsg } from '../../message.i18n';

const { Panel } = Collapse;

@injectIntl
@connect(state => ({
  tenantId: state.account.tenantId,
  order: state.sofOrders.dock.order,
}), { })
export default class OrderPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    order: PropTypes.shape({
      shipmt_order_no: PropTypes.string,
    }).isRequired,
  }
  msg = formatMsg(this.props.intl)
  render() {
    const { order } = this.props;
    const goods = GOODSTYPES.filter(gt => gt.value === order.cust_shipmt_goods_type)[0];
    const transMode = TRANS_MODE.filter(tm => tm.value === order.cust_shipmt_trans_mode)[0];
    const wrapType = WRAP_TYPE.filter(wt => wt.value === order.cust_shipmt_wrap_type)[0];
    return (
      <div className="pane-content tab-pane">
        <Card bodyStyle={{ padding: 0 }}>
          <Collapse accordion bordered={false} defaultActiveKey={['basic']}>
            <Panel header="基本信息" key="basic">
              <Row gutter={16} className="info-group-underline">
                <Col span="8">
                  <InfoItem
                    label="客户单号"
                    field={order.cust_order_no}
                    placeholder="添加客户单号"
                    editable
                  />
                </Col>
                <Col span="8">
                  <InfoItem
                    type="dropdown"
                    label="货物类型"
                    field={goods ? goods.text : ''}
                    placeholder="选择货物类型"
                    editable
                    overlay={<Menu>
                      <Menu.Item>Menu</Menu.Item>
                    </Menu>
                    }
                  />
                </Col>
                <Col span="8">
                  <InfoItem
                    label="总件数"
                    field={order.cust_shipmt_pieces}
                    addonAfter={wrapType && wrapType.text}
                    editable
                  />
                </Col>
                <Col span="8">
                  <InfoItem
                    type="number"
                    label="总重量"
                    field={order.cust_shipmt_weight}
                    addonAfter="千克"
                    placeholder="设置总重量"
                    editable
                  />
                </Col>
              </Row>

            </Panel>
            <Panel header="SHIPMENT" key="shipment">
              <Row gutter={16} className="info-group-underline">
                {
                (order.cust_shipmt_transfer !== 'DOM') &&
                <Col span="8">
                  <InfoItem
                    label="运输方式"
                    addonBefore={transMode && <MdIcon type={transMode.icon} />}
                    field={transMode ? transMode.text : ''}
                  />
                </Col>
                }
                {
                (order.cust_shipmt_transfer !== 'DOM' && order.cust_shipmt_trans_mode === '2') &&
                <Col span="8">
                  <InfoItem
                    label="提单号"
                    field={order.cust_shipmt_bill_lading}
                    placeholder="添加提单号"
                    editable
                  />
                </Col>
                }
                {
                (order.cust_shipmt_transfer !== 'DOM' && order.cust_shipmt_trans_mode === '5') &&
                <Col span="8">
                  <InfoItem
                    label="主运单号"
                    field={order.cust_shipmt_mawb}
                    placeholder="添加主运单号"
                    editable
                  />
                </Col>
                }
                {
                (order.cust_shipmt_transfer !== 'DOM' && order.cust_shipmt_trans_mode === '2') &&
                <Col span="8">
                  <InfoItem
                    label="海运单号"
                    field={order.cust_shipmt_bill_lading_no}
                    placeholder="添加海运单号"
                    editable
                  />
                </Col>
                }
                {
                (order.cust_shipmt_transfer !== 'DOM' && order.cust_shipmt_trans_mode === '5') &&
                <Col span="8">
                  <InfoItem
                    label="分运单号"
                    field={order.cust_shipmt_hawb}
                    placeholder="添加分运单号"
                    editable
                  />
                </Col>
                }
                {
                (order.cust_shipmt_transfer !== 'DOM' && order.cust_shipmt_trans_mode === '2') &&
                <Col span="8">
                  <InfoItem
                    label="船名"
                    field={order.cust_shipmt_vessel}
                    placeholder="添加船名"
                    editable
                  />
                </Col>
                }
                {
                (order.cust_shipmt_transfer !== 'DOM' && order.cust_shipmt_trans_mode === '5') &&
                <Col span="8">
                  <InfoItem
                    label="航班号"
                    field={order.cust_shipmt_vessel}
                    placeholder="添加航班号"
                    editable
                  />
                </Col>
                }
                {
                (order.cust_shipmt_transfer !== 'DOM' && order.cust_shipmt_trans_mode === '2') &&
                <Col span="8">
                  <InfoItem
                    label="航次号"
                    field={order.cust_shipmt_voy}
                    placeholder="添加航次号"
                    editable
                  />
                </Col>
                }
              </Row>

            </Panel>
            <Panel header="集装箱" key="container" />
            <Panel header="发票" key="invoice" />
          </Collapse>
        </Card>
      </div>
    );
  }
}
