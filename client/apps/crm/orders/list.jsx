import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import { intlShape, injectIntl } from 'react-intl';
import { Button } from 'antd';
import Table from 'client/components/remoteAntTable';
import { Link } from 'react-router';
import QueueAnim from 'rc-queue-anim';
import SearchBar from 'client/components/search-bar';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import { loadOrders, loadFormRequires } from 'common/reducers/crmOrders';
import moment from 'moment';
import { ORDER_STATUS } from 'common/constants';
import TrimSpan from 'client/components/trimSpan';

const formatMsg = format(messages);
function fetchData({ state, dispatch }) {
  const promises = [
    dispatch(loadFormRequires({
      tenantId: state.account.tenantId,
    })),
    dispatch(loadOrders({
      tenantId: state.account.tenantId,
      pageSize: state.crmOrders.orders.pageSize,
      current: state.crmOrders.orders.current,
      searchValue: state.crmOrders.orders.searchValue,
      filters: state.crmOrders.orders.filters,
    })),
  ];
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loading: state.crmOrders.loading,
    orders: state.crmOrders.orders,
    formRequires: state.crmOrders.formRequires,
  }), {
    loadOrders,
  }
)
@connectNav({
  depth: 2,
  moduleName: 'customer',
})
export default class ShipmentOrderList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    loading: PropTypes.bool.isRequired,
    tenantId: PropTypes.number.isRequired,
    orders: PropTypes.object.isRequired,
    loadOrders: PropTypes.func.isRequired,
    formRequires: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
  }
  msg = key => formatMsg(this.props.intl, key)

  render() {
    // const { loading, formRequires: { clients } } = this.props;
    const { loading } = this.props;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };

    const columns = [{
      title: '业务编号',
      dataIndex: 'shipmt_order_no',
    }, {
      title: '报关委托号',
      dataIndex: 'ccb_delg_no',
    }, {
      title: '运输单号',
      dataIndex: '',
    }, {
      title: '客户',
      dataIndex: 'customer_name',
      render: o => <TrimSpan text={o} maxLen={10} />,
    }, {
      title: '客户订单号',
      dataIndex: 'cust_order_no',
    }, {
      title: '客户发票号',
      dataIndex: 'cust_invoice_no',
    }, {
      title: '提运单号',
      dataIndex: 'cust_shipmt_bill_lading',
    }, {
      title: '件数',
      dataIndex: 'cust_shipmt_pieces',
    }, {
      title: '毛重',
      dataIndex: 'cust_shipmt_weight',
    }, {
      title: '包装方式',
      dataIndex: 'cust_shipmt_package',
    }, {
      title: '货物性质',
      dataIndex: 'cust_shipmt_goods_type',
    }, {
      title: '创建时间',
      dataIndex: 'created_date',
      render: o => moment(o).format('YYYY-MM-DD HH:mm'),
    }, {
      title: '状态',
      dataIndex: 'order_status',
      render: (o) => {
        return ORDER_STATUS[o];
      },
    }, {
      title: '操作',
    }];
    const dataSource = new Table.DataSource({
      fetcher: params => this.props.loadOrders(params),
      resolve: result => result.data,
      getPagination: (result, resolve) => ({
        total: result.totalCount,
        current: resolve(result.totalCount, result.current, result.pageSize),
        showSizeChanger: true,
        showQuickJumper: false,
        pageSize: result.pageSize,
      }),
      getParams: (pagination, filters) => {
        const { searchValue } = this.props.orders;
        const params = {
          tenantId: this.props.tenantId,
          pageSize: pagination.pageSize,
          current: pagination.current,
          searchValue,
          filters,
        };
        return params;
      },
      remotes: this.props.orders,
    });
    return (
      <QueueAnim type={['bottom', 'up']}>
        <header className="top-bar" key="header">
          <div className="tools">
            <SearchBar placeholder={this.msg('searchPlaceholder')} onInputSearch={this.handleSearch} />
          </div>
          <span>{this.msg('shipmentOrders')}</span>
        </header>
        <div className="main-content" key="main">
          <div className="page-body">
            <div className="panel-header">
              <Link to="/customer/orders/create">
                <Button type="primary" icon="plus-circle-o">
                  {this.msg('new')}
                </Button>
              </Link>
            </div>
            <div className="panel-body table-panel expandable">
              <Table rowSelection={rowSelection} dataSource={dataSource} columns={columns} rowKey="id" loading={loading} />
            </div>
          </div>
        </div>
      </QueueAnim>
    );
  }
}
