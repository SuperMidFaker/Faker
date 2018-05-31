import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import DataTable from 'client/components/DataTable';
import { showCustomerPanel } from 'common/reducers/partner';
import { loadOrderProducts } from 'common/reducers/sofOrders';
import { formatMsg } from '../message.i18n';


@injectIntl
@connect(state => ({
  tenantId: state.account.tenantId,
  dockVisible: state.sofOrders.dock.visible,
  order: state.sofOrders.dock.order,
  orderProductList: state.sofOrders.dock.orderProductList,
}), { loadOrderProducts, showCustomerPanel })
export default class ShipmentDetailsPane extends React.Component {
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
  handleShowCusPanel = (customer) => {
    this.props.showCustomerPanel({ visible: true, customer });
  }
  render() {
    const { orderProductList } = this.props;
    this.dataSource.remotes = orderProductList;
    return (
      <div className="pane-content tab-pane">
        <DataTable
          columns={this.productColumns}
          dataSource={this.dataSource}
          rowKey="id"
          showToolbar={false}
        />
      </div>
    );
  }
}
