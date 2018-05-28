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
export default class ContainersPane extends React.Component {
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
    title: '集装箱号',
    dataIndex: 'container_no',
  }, {
    title: '集装箱规格',
    dataIndex: 'container_type',
  }, {
    title: '是否拼箱',
    dataIndex: 'is_lcl',
    render: o => (o ? '是' : '否'),
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
