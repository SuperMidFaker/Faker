import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import { intlShape, injectIntl } from 'react-intl';
import { Button, message } from 'antd';
import Table from 'client/components/remoteAntTable';
import { Link } from 'react-router';
import QueueAnim from 'rc-queue-anim';
import SearchBar from 'client/components/search-bar';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import { loadOrders, loadFormRequires, removeOrder, setClientForm } from 'common/reducers/crmOrders';
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
    loginId: state.account.loginId,
    username: state.account.username,
    loading: state.crmOrders.loading,
    orders: state.crmOrders.orders,
    formRequires: state.crmOrders.formRequires,
  }), {
    loadOrders, removeOrder, setClientForm,
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
    loginId: PropTypes.number.isRequired,
    username: PropTypes.string.isRequired,
    orders: PropTypes.object.isRequired,
    loadOrders: PropTypes.func.isRequired,
    removeOrder: PropTypes.func.isRequired,
    setClientForm: PropTypes.func.isRequired,
    formRequires: PropTypes.object.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
  }
  msg = key => formatMsg(this.props.intl, key)
  handleCreate = () => {
    this.props.setClientForm({});
    this.context.router.push('/customer/orders/create');
  }
  handleRemove = (shipmtOrderNo) => {
    const { tenantId, loginId, username } = this.props;
    this.props.removeOrder({ tenantId, loginId, username, shipmtOrderNo }).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        message.info('删除成功');
        this.handleTableLoad();
      }
    });
  }
  handleTableLoad = () => {
    this.props.loadOrders({
      tenantId: this.props.tenantId,
      pageSize: this.props.orders.pageSize,
      current: this.props.orders.current,
      searchValue: this.props.orders.searchValue,
      filters: this.props.orders.filters,
    });
  }
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
      dataIndex: 'id',
      render: (o, record) => {
        return (
          <div>
            <Link to={`/customer/orders/view?shipmtOrderNo=${record.shipmt_order_no}`}>查看</Link>
            <span className="ant-divider" />
            <a onClick={() => this.handleRemove(record.shipmt_order_no)}>删除</a>
          </div>
        );
      },
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
              <Button type="primary" icon="plus-circle-o" onClick={this.handleCreate}>
                {this.msg('new')}
              </Button>
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
