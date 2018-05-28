import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
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
export default class CommercialInvoicesPane extends React.Component {
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
  columns = [{
    title: this.msg('invoiceNo'),
    dataIndex: 'invoice_no',
    width: 200,
  }, {
    title: this.msg('invoiceDate'),
    dataIndex: 'invoice_date',
    render: o => o && moment(o).format('YYYY/MM/DD'),
    width: 150,
  }, {
    title: this.msg('poNo'),
    dataIndex: 'po_no',
    width: 200,
  }, {
    title: this.msg('totalAmount'),
    dataIndex: 'total_amount',
    width: 150,
  }, {
    title: this.msg('currency'),
    dataIndex: 'currency',
    width: 150,
  }, {
    title: this.msg('totalQty'),
    dataIndex: 'total_qty',
    width: 150,
  }, {
    title: this.msg('totalNetWt'),
    dataIndex: 'total_net_wt',
    width: 150,
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
          columns={this.columns}
          dataSource={this.dataSource}
          rowKey="id"
          scroll={{ x: 800 }}
          showToolbar={false}
        />
      </div>
    );
  }
}
