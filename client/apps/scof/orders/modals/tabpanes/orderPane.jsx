import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Collapse, Row, Col, Card, Icon, Menu } from 'antd';
import { GOODSTYPES, TRANS_MODE } from 'common/constants';
import InfoItem from 'client/components/InfoItem';
import MdIcon from 'client/components/MdIcon';

const Panel = Collapse.Panel;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    order: state.crmOrders.dock.order,
  }), { }
)
export default class OrderPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    order: PropTypes.object.isRequired,
  }
  state = {
    tabKey: '',
  }

  render() {
    const { order } = this.props;
    const goods = GOODSTYPES.filter(gt => gt.value === order.goods_type);
    const transMode = TRANS_MODE.filter(tm => tm.value === order.trans_mode);

    return (
      <div className="pane-content tab-pane">
        <Card bodyStyle={{ padding: 0 }}>
          <Collapse bordered={false} defaultActiveKey={['trading', 'shipment', 'consignment']}>
            <Panel header="贸易信息" key="trading">
              <Row>
                <Col span="8">
                  <InfoItem label="订单号" addonBefore={<Icon type="tag-o" />}
                    field={order.order_no} placeholder="添加订单号" editable
                  />
                </Col>
                <Col span="8">
                  <InfoItem label="发票号" addonBefore={<Icon type="tag-o" />}
                    field={order.invoice_no} placeholder="添加发票号" editable
                  />
                </Col>
                <Col span="8">
                  <InfoItem label="合同号" addonBefore={<Icon type="tag-o" />}
                    field={order.contract_no} placeholder="添加合同号" editable
                  />
                </Col>
              </Row>
            </Panel>
            <Panel header="货运信息" key="shipment">
              <Row>
                <Col span="8">
                  <InfoItem label="运输方式" addonBefore={transMode[0] && <MdIcon type={transMode[0].icon} />}
                    field={transMode.length > 0 ? transMode[0].text : ''}
                  />
                </Col>
                <Col span="8">
                  <InfoItem label="提运单号" addonBefore={<Icon type="tag-o" />}
                    field={order.bl_wb_no} placeholder="添加提运单号" editable
                  />
                </Col>
                <Col span="8">
                  <InfoItem label="运输工具名称" field={order.traf_name} />
                </Col>
              </Row>
              <Row>
                <Col span="8">
                  <InfoItem type="dropdown" label="货物类型"
                    field={goods.length > 0 ? goods[0].text : ''} placeholder="选择货物类型" editable overlay={<Menu>
                      <Menu.Item>Menu</Menu.Item>

                    </Menu>
                    }
                  />
                </Col>
                <Col span="8">
                  <InfoItem label="总件数"
                    field={order.pieces} addonAfter="件" editable
                  />
                </Col>
                <Col span="8">
                  <InfoItem type="number" label="总重量"
                    field={order.weight} addonAfter="千克" placeholder="设置总重量" editable
                  />
                </Col>
              </Row>
            </Panel>
            <Panel header="收发货信息" key="consignment" />
          </Collapse>

        </Card>
      </div>
    );
  }
}
