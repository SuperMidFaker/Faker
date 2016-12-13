import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Popconfirm, Progress, message } from 'antd';
import Table from 'client/components/remoteAntTable';
import { Link } from 'react-router';
import QueueAnim from 'rc-queue-anim';
import SearchBar from 'client/components/search-bar';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import { loadOrders, loadFormRequires, removeOrder, setClientForm, acceptOrder,
loadOrderDetail } from 'common/reducers/crmOrders';
import moment from 'moment';
import { CRM_ORDER_STATUS, GOODSTYPES } from 'common/constants';
import TrimSpan from 'client/components/trimSpan';
import PreviewPanel from './modals/preview-panel';
import TrsShipmtNoColumn from '../common/trsShipmtNoColumn';
import CcbDelgNoColumn from '../common/ccbDelgNoColumn';

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
    tenantName: state.account.tenantName,
    loading: state.crmOrders.loading,
    orders: state.crmOrders.orders,
    formRequires: state.crmOrders.formRequires,
  }), {
    loadOrders, removeOrder, setClientForm, acceptOrder, loadOrderDetail,
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
    tenantName: PropTypes.string.isRequired,
    orders: PropTypes.object.isRequired,
    loadOrders: PropTypes.func.isRequired,
    removeOrder: PropTypes.func.isRequired,
    setClientForm: PropTypes.func.isRequired,
    acceptOrder: PropTypes.func.isRequired,
    formRequires: PropTypes.object.isRequired,
    loadOrderDetail: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
  }
  msg = key => formatMsg(this.props.intl, key)
  handleCreate = () => {
    this.props.setClientForm(-2, {});
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
  handleAccept = (shipmtOrderNo) => {
    const { tenantId, tenantName, loginId, username } = this.props;
    this.props.acceptOrder({ tenantId, tenantName, loginId, username, shipmtOrderNo }).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        message.info('接单成功');
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
  handleSearch = (searchValue) => {
    this.props.loadOrders({
      tenantId: this.props.tenantId,
      pageSize: this.props.orders.pageSize,
      current: this.props.orders.current,
      searchValue,
      filters: this.props.orders.filters,
    });
  }
  render() {
    const { loading, formRequires: { packagings } } = this.props;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };

    const columns = [{
      title: '业务编号',
      dataIndex: 'shipmt_order_no',
      width: 150,
      render: (o, record) => {
        if (record.order_status !== CRM_ORDER_STATUS.created) {
          return (
            <a onClick={() => this.props.loadOrderDetail(o, this.props.tenantId)}>{o}</a>
          );
        }
        return o;
      },
    }, {
      title: '清关编号',
      dataIndex: 'ccb_delg_no',
      width: 120,
      render: o => <CcbDelgNoColumn nos={o} />,
    }, {
      title: '运输单号',
      dataIndex: 'trs_shipmt_no',
      width: 150,
      render: o => <TrsShipmtNoColumn nos={o} />,
    }, {
      title: '客户',
      dataIndex: 'customer_name',
      render: o => <TrimSpan text={o} maxLen={16} />,
    }, {
      title: '客户订单号',
      dataIndex: 'cust_order_no',
      width: 120,
    }, {
      title: '客户发票号',
      dataIndex: 'cust_invoice_no',
      width: 120,
    }, {
      title: '提运单号',
      dataIndex: 'cust_shipmt_bill_lading',
      width: 180,
    }, {
      title: '件数',
      dataIndex: 'cust_shipmt_pieces',
      width: 50,
    }, {
      title: '毛重',
      dataIndex: 'cust_shipmt_weight',
      width: 80,
    }, {
      title: '包装方式',
      dataIndex: 'cust_shipmt_package',
      width: 80,
      render: (o) => {
        const pkg = packagings.find(item => item.package_code === o);
        return pkg ? pkg.package_name : '';
      },
    }, {
      title: '货物类型',
      dataIndex: 'cust_shipmt_goods_type',
      width: 80,
      render: (o) => {
        const goodsType = GOODSTYPES.find(item => item.value === o);
        return goodsType ? goodsType.text : '';
      },
    }, {
      title: '状态',
      dataIndex: 'order_status',
      width: 100,
      render: (o, record) => {
        const percent = record.finish_num / record.shipmt_order_mode.split(',').length * 100;
        if (o === CRM_ORDER_STATUS.created) {
          return (
            <div>
              创建
              <Progress percent={percent} strokeWidth={5} showInfo={false} />
            </div>
          );
        } else if (o === CRM_ORDER_STATUS.clearancing) {
          return (
            <div>
              清关
              <Progress percent={percent} strokeWidth={5} showInfo={false} />
            </div>
          );
        } else if (o === CRM_ORDER_STATUS.transporting) {
          return (
            <div>
              运输
              <Progress percent={percent} strokeWidth={5} showInfo={false} />
            </div>
          );
        } else if (o === CRM_ORDER_STATUS.finished) {
          return (
            <div>
              完结
              <Progress percent={percent} strokeWidth={5} showInfo={false} />
            </div>
          );
        }
        return '';
      },
    }, {
      title: '创建时间',
      dataIndex: 'created_date',
      width: 100,
      render: o => moment(o).format('MM.DD HH:mm'),
    }, {
      title: '操作',
      dataIndex: 'id',
      width: 120,
      fixed: 'right',
      render: (o, record) => {
        if (record.order_status === 1) {
          return (
            <div>
              <a onClick={() => this.handleAccept(record.shipmt_order_no)}>发送</a>
              <span className="ant-divider" />
              <Link to={`/customer/orders/edit?shipmtOrderNo=${record.shipmt_order_no}`}>修改</Link>
              <span className="ant-divider" />
              <Popconfirm title="确定删除?" onConfirm={() => this.handleRemove(record.shipmt_order_no)}>
                <a>删除</a>
              </Popconfirm>
            </div>
          );
        } else {
          return (
            <div>
              <Link to={`/customer/orders/view?shipmtOrderNo=${record.shipmt_order_no}`}>查看</Link>
            </div>
          );
        }
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
        <header className="top-bar">
          <span>{this.msg('shipmentOrders')}</span>
        </header>
        <div className="top-bar-tools">
          <SearchBar placeholder={this.msg('searchPlaceholder')} onInputSearch={this.handleSearch} />
        </div>

        <div className="main-content" key="main">
          <div className="page-body">
            <div className="panel-header">
              <Button type="primary" icon="plus-circle-o" onClick={this.handleCreate}>
                {this.msg('new')}
              </Button>
            </div>
            <div className="panel-body table-panel expandable">
              <Table rowSelection={rowSelection} dataSource={dataSource} columns={columns} rowKey="id" loading={loading} scroll={{ x: 1800 }} />
            </div>
          </div>
        </div>
        <PreviewPanel />
      </QueueAnim>
    );
  }
}
