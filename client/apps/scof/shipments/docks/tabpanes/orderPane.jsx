import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Row, Col, Card, Collapse, Menu } from 'antd';
import { GOODSTYPES, TRANS_MODE, WRAP_TYPE } from 'common/constants';
import DataTable from 'client/components/DataTable';
import InfoItem from 'client/components/InfoItem';
import { MdIcon } from 'client/components/FontIcon';
import { loadOrderProducts } from 'common/reducers/sofOrders';
import { formatMsg } from '../../message.i18n';

const { Panel } = Collapse;

@injectIntl
@connect(state => ({
  tenantId: state.account.tenantId,
  dockVisible: state.sofOrders.dock.visible,
  order: state.sofOrders.dock.order,
  orderProductList: state.sofOrders.dock.orderProductList,
}), { loadOrderProducts })
export default class OrderPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    order: PropTypes.shape({
      shipmt_order_no: PropTypes.string,
    }).isRequired,
  }
  componentDidMount() {
    this.props.loadOrderProducts({
      orderNo: this.props.order.shipmt_order_no,
      pageSize: this.props.orderProductList.pageSize,
      current: this.props.orderProductList.current,
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.dockVisible && !this.props.dockVisible) {
      nextProps.loadOrderProducts({
        orderNo: nextProps.order.shipmt_order_no,
        pageSize: nextProps.orderProductList.pageSize,
        current: nextProps.orderProductList.current,
      });
    }
  }
  msg = formatMsg(this.props.intl)
  productColumns = [{
    title: '货号',
    width: 150,
    dataIndex: 'product_no',
    fixed: 'left',
  }, {
    title: '名称',
    dataIndex: 'name',
    width: 160,
  }, {
    title: '英文名称',
    width: 120,
    dataIndex: 'en_name',
  }, {
    title: '数量',
    width: 140,
    dataIndex: 'qty',
  }, {
    title: '单价',
    width: 140,
    dataIndex: 'unit_price',
  }, {
    title: '金额',
    width: 140,
    dataIndex: 'amount',
  }, {
    title: '净重',
    width: 140,
    dataIndex: 'net_wt',
  }, {
    title: '原产国',
    width: 180,
    dataIndex: 'country',
  }, {
    title: '币制',
    width: 140,
    dataIndex: 'currency',
  }, {
    title: '发票号',
    width: 140,
    dataIndex: 'invoice_no',
  }, {
    title: '采购订单号',
    width: 140,
    dataIndex: 'po_no',
  }, {
    title: '批次号',
    width: 140,
    dataIndex: 'external_lot_no',
  }, {
    title: '序列号',
    width: 140,
    dataIndex: 'serial_no',
  }, {
    title: '扩展属性1',
    width: 140,
    dataIndex: 'attrib_1_string',
  }, {
    title: '扩展属性2',
    width: 140,
    dataIndex: 'attrib_2_string',
  }, {
    title: '扩展属性3',
    width: 140,
    dataIndex: 'attrib_3_string',
  }, {
    title: '扩展属性4',
    width: 140,
    dataIndex: 'attrib_4_string',
  }]
  dataSource = new DataTable.DataSource({
    fetcher: params => this.props.loadOrderProducts(params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize,
      showTotal: total => `共 ${total} 条`,
    }),
    getParams: (pagination) => {
      const params = {
        orderNo: this.props.order.shipmt_order_no,
        pageSize: pagination.pageSize,
        current: pagination.current,
      };
      return params;
    },
    remotes: this.props.orderProductList,
  })
  render() {
    const { order, orderProductList } = this.props;
    this.dataSource.remotes = orderProductList;
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
            <Panel header="货运信息" key="shipment">
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
            <Panel header="货品明细" key="products">
              <DataTable
                columns={this.productColumns}
                dataSource={this.dataSource}
                rowKey="id"
                scroll={{ x: 800 }}
              />
            </Panel>
            <Panel header="发票" key="invoice" />
            <Panel header="集装箱" key="container" />
          </Collapse>
        </Card>
      </div>
    );
  }
}
