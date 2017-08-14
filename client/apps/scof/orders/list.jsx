import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Dropdown, Menu, Icon, Radio, Popconfirm, Progress, message, Layout, Tooltip, Select } from 'antd';
import Table from 'client/components/remoteAntTable';
import { Link } from 'react-router';
import QueueAnim from 'rc-queue-anim';
import SearchBar from 'client/components/SearchBar';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import { loadOrders, removeOrder, setClientForm, acceptOrder, hideDock, loadOrderDetail } from 'common/reducers/crmOrders';
import { loadPartners } from 'common/reducers/partner';
import { emptyFlows } from 'common/reducers/scofFlow';
import moment from 'moment';
import OrderDockPanel from './docks/orderDockPanel';
import OrderNoColumn from './columndef/orderNoColumn';
import ShipmentColumn from './columndef/shipmentColumn';
import ProgressColumn from './columndef/progressColumn';
import DelegationDockPanel from '../../cms/common/dock/delegationDockPanel';
import ShipmentDockPanel from '../../transport/shipment/dock/shipmentDockPanel';
import ReceiveDockPanel from '../../cwm/receiving/dock/receivingDockPanel';
import ShippingDockPanel from '../../cwm/shipping/dock/shippingDockPanel';
import { SCOF_ORDER_TRANSFER, CRM_ORDER_STATUS, PARTNER_ROLES } from 'common/constants';
import CreatorSelect from './creatorSelect';

const { Header, Content } = Layout;
const formatMsg = format(messages);
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const Option = Select.Option;

// 暂时由 CreatorSelect 触发获取list
function fetchData({ state, dispatch }) {
  const promises = [
    // dispatch(loadOrders({
    //   tenantId: state.account.tenantId,
    //   pageSize: state.crmOrders.orders.pageSize,
    //   current: state.crmOrders.orders.current,
    //   filters: state.crmOrders.orderFilters,
    //   partners: state.partner.partners,
    // })),
    dispatch(loadPartners({ tenantId: state.account.tenantId, role: PARTNER_ROLES.CUS })),
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
    filters: state.crmOrders.orderFilters,
    partners: state.partner.partners,
  }), { loadOrders, removeOrder, setClientForm, acceptOrder, emptyFlows, hideDock, loadOrderDetail }
)
@connectNav({
  depth: 2,
  moduleName: 'scof',
})
export default class OrderList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    loading: PropTypes.bool.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    username: PropTypes.string.isRequired,
    tenantName: PropTypes.string.isRequired,
    orders: PropTypes.object.isRequired,
    filters: PropTypes.object.isRequired,
    loadOrders: PropTypes.func.isRequired,
    removeOrder: PropTypes.func.isRequired,
    setClientForm: PropTypes.func.isRequired,
    acceptOrder: PropTypes.func.isRequired,
    loadOrderDetail: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
  }
  componentWillMount() {
    this.props.hideDock();
  }
  componentDidMount() {
    const query = this.props.location.query;
    if (query.shipmt_order_no) {
      this.props.loadOrderDetail(query.shipmt_order_no, this.props.tenantId);
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.location) {
      const query = this.props.location.query;
      const nextQuery = nextProps.location.query;
      if (query.shipmt_order_no !== nextQuery.shipmt_order_no) {
        this.props.loadOrderDetail(nextQuery.shipmt_order_no, this.props.tenantId);
      }
    }
  }
  msg = key => formatMsg(this.props.intl, key)
  handleCreate = () => {
    this.props.setClientForm(-2, {});
    this.props.emptyFlows();
    this.context.router.push('/scof/orders/create');
  }
  handleRemove = (shipmtOrderNo) => {
    const { tenantId, loginId, username } = this.props;
    this.props.removeOrder({ tenantId, loginId, username, shipmtOrderNo }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        message.info('删除成功');
        this.handleTableLoad();
      }
    });
  }
  handleStart = (shipmtOrderNo) => {
    const { loginId, username } = this.props;
    this.props.acceptOrder({ loginId, username, shipmtOrderNo }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        message.info('订单流程已启动');
        this.handleTableLoad();
      }
    });
  }
  handleTableLoad = () => {
    this.props.loadOrders({
      tenantId: this.props.tenantId,
      pageSize: this.props.orders.pageSize,
      current: this.props.orders.current,
      filters: this.props.filters,
    });
  }
  handleSearch = (searchValue) => {
    const filters = { ...this.props.filters, order_no: searchValue };
    this.props.loadOrders({
      tenantId: this.props.tenantId,
      pageSize: this.props.orders.pageSize,
      current: this.props.orders.current,
      filters,
    });
  }
  handleProgressChange = (ev) => {
    const filters = { ...this.props.filters, progress: ev.target.value };
    this.props.loadOrders({
      tenantId: this.props.tenantId,
      pageSize: this.props.orders.pageSize,
      current: this.props.orders.current,
      filters,
    });
  }
  handleTransferChange = (ev) => {
    const filters = { ...this.props.filters, transfer: ev.target.value };
    this.props.loadOrders({
      tenantId: this.props.tenantId,
      pageSize: this.props.orders.pageSize,
      current: this.props.orders.current,
      filters,
    });
  }
  handleClientSelectChange = (value) => {
    const filters = { ...this.props.filters, partnerId: value };
    this.props.loadOrders({
      tenantId: this.props.tenantId,
      pageSize: this.props.orders.pageSize,
      current: this.props.orders.current,
      filters,
    });
  }
  handleCreatorChange = (fieldsValue) => {
    const filters = { ...this.props.filters, ...fieldsValue, loginId: this.props.loginId };
    this.props.loadOrders({
      tenantId: this.props.tenantId,
      pageSize: this.props.orders.pageSize,
      current: this.props.orders.current,
      filters,
    });
  }
  render() {
    const { loading, filters, partners } = this.props;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };

    const columns = [{
      title: '订单',
      width: 240,
      fixed: 'left',
      render: (o, record) => <OrderNoColumn order={record} />,
    }, {
      dataIndex: 'order_status',
      width: 160,
      render: (o, record) => {
        const percent = record.flow_node_num ? Number((record.finish_num / record.flow_node_num * 100).toFixed(1)) : 0;
        return (<div style={{ textAlign: 'center' }}><Progress type="circle" percent={percent} width={50} />
          <div className="mdc-text-grey table-font-small">
            <Tooltip title={`创建于${moment(record.created_date).format('YYYY.MM.DD HH:mm')}`} placement="bottom">
              <Icon type="clock-circle-o" /> {moment(record.created_date).fromNow()}
            </Tooltip>
          </div>
        </div>);
      },
    }, {
      dataIndex: 'cust_shipmt_transfer',
      width: 40,
      render: (o) => {
        const transfer = SCOF_ORDER_TRANSFER.filter(sot => sot.value === o)[0];
        return transfer && <Tooltip title={transfer.text} ><Icon type={transfer.icon} /></Tooltip>;
      },
    }, {
      width: 200,
      render: (o, record) => <ShipmentColumn shipment={record} />,
    }, {
      title: '进度状态',
      render: (o, record) => <ProgressColumn order={record} />,
    }, {
      title: '操作',
      width: 80,
      fixed: 'right',
      className: 'editable-row-operations',
      render: (o, record) => {
        if (record.order_status === CRM_ORDER_STATUS.created) {
          return (
            <div>
              {record.flow_node_num > 0 &&
              <a onClick={() => this.handleStart(record.shipmt_order_no)}><Icon type="play-circle" /></a>
              }
              {record.flow_node_num > 0 &&
              <span className="ant-divider" />
              }
              <Dropdown overlay={(
                <Menu onClick={this.handleMenuClick}>
                  <Menu.Item key="edit">
                    <Link to={`/scof/orders/edit?shipmtOrderNo=${record.shipmt_order_no}`}><Icon type="edit" />修改</Link>
                  </Menu.Item>
                  <Menu.Item key="delete">
                    <Popconfirm title="确定删除?" onConfirm={() => this.handleRemove(record.shipmt_order_no)}>
                      <a><Icon type="delete" />删除</a>
                    </Popconfirm>
                  </Menu.Item>
                </Menu>)}
              >
                <a><Icon type="down" /></a>
              </Dropdown>
            </div>
          );
        } else {
          return (
            <div />
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
        showTotal: total => `共 ${total} 条`,
      }),
      getParams: (pagination, tblfilters) => {
        const newfilters = { ...this.props.filters, ...tblfilters[0] };
        const params = {
          tenantId: this.props.tenantId,
          pageSize: pagination.pageSize,
          current: pagination.current,
          filters: newfilters,
        };
        return params;
      },
      remotes: this.props.orders,
    });
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="page-header">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.msg('shipmentOrders')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <RadioGroup onChange={this.handleProgressChange} size="large" value={filters.progress}>
            <RadioButton value="all">全部</RadioButton>
            <RadioButton value="active">进行中</RadioButton>
            <RadioButton value="completed">已完成</RadioButton>
          </RadioGroup>
          <span />
          <RadioGroup onChange={this.handleTransferChange} size="large" value={filters.transfer}>
            <RadioButton value="all">全部</RadioButton>
            <RadioButton value={SCOF_ORDER_TRANSFER[0].value}><Icon type={SCOF_ORDER_TRANSFER[0].icon} /> {SCOF_ORDER_TRANSFER[0].text}</RadioButton>
            <RadioButton value={SCOF_ORDER_TRANSFER[1].value}><Icon type={SCOF_ORDER_TRANSFER[1].icon} /> {SCOF_ORDER_TRANSFER[1].text}</RadioButton>
            <RadioButton value={SCOF_ORDER_TRANSFER[2].value}><Icon type={SCOF_ORDER_TRANSFER[2].icon} /> {SCOF_ORDER_TRANSFER[2].text}</RadioButton>
          </RadioGroup>
          <div className="page-header-tools">
            <Button type="primary" size="large" icon="plus" onClick={this.handleCreate}>
              {this.msg('new')}
            </Button>
          </div>
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <div className="toolbar">
              <SearchBar placeholder={this.msg('searchPlaceholder')} onInputSearch={this.handleSearch} size="large" value={filters.order_no} />
              <span />
              <Select showSearch optionFilterProp="children" size="large" style={{ width: 160 }}
                onChange={this.handleClientSelectChange} value={filters.partnerId ? filters.partnerId : 'all'}
                dropdownMatchSelectWidth={false} dropdownStyle={{ width: 360 }}
              >
                <Option value="all">全部客户</Option>
                {partners.map(data => (<Option key={data.id} value={data.id}>{data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}</Option>)
                )}
              </Select>
              <span />
              <CreatorSelect onChange={this.handleCreatorChange} onInitialize={this.handleCreatorChange} size="large" />
              <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
                <h3>已选中{this.state.selectedRowKeys.length}项</h3>
              </div>
            </div>
            <div className="panel-body table-panel table-fixed-layout">
              <Table rowSelection={rowSelection} dataSource={dataSource} columns={columns} rowKey="id" loading={loading} scroll={{ x: 1500 }} />
            </div>
          </div>
        </Content>
        <OrderDockPanel reload={this.handleTableLoad} />
        <DelegationDockPanel />
        <ShipmentDockPanel />
        <ReceiveDockPanel />
        <ShippingDockPanel />
      </QueueAnim>
    );
  }
}
