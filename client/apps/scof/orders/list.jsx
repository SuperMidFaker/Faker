import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Dropdown, Menu, Icon, Radio, Popconfirm, Progress, message, Layout, Tooltip } from 'antd';
import Table from 'client/components/remoteAntTable';
import { Link } from 'react-router';
import QueueAnim from 'rc-queue-anim';
import SearchBar from 'client/components/search-bar';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import { loadOrders, loadFormRequires, removeOrder, setClientForm, acceptOrder } from 'common/reducers/crmOrders';
import moment from 'moment';
import PreviewPanel from './modals/preview-panel';
import OrderNoColumn from './orderNoColumn';
import ShipmentColumn from './shipmentColumn';
import ProgressColumn from './progressColumn';
import { CRM_ORDER_STATUS } from 'common/constants';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const ButtonGroup = Button.Group;

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
  }), { loadOrders, removeOrder, setClientForm, acceptOrder }
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
    loadOrders: PropTypes.func.isRequired,
    removeOrder: PropTypes.func.isRequired,
    setClientForm: PropTypes.func.isRequired,
    acceptOrder: PropTypes.func.isRequired,
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
    this.context.router.push('/scof/orders/create');
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
    const { loginId, username } = this.props;
    this.props.acceptOrder({ loginId, username, shipmtOrderNo }).then((result) => {
      if (result.error) {
        message.error(result.error.message);
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
    const { loading } = this.props;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };

    const columns = [{
      title: '订单',
      width: 300,
      fixed: 'left',
      render: (o, record) => <OrderNoColumn order={record} />,
    }, {
      dataIndex: 'order_status',
      width: 160,
      render: (o, record) => {
        const percent = record.flow_node_num ? record.finish_num / record.flow_node_num * 100 : 0;
        return (<div style={{ textAlign: 'center' }}><Progress type="circle" percent={percent} width={50} />
          <div className="mdc-text-grey table-font-small">
            <Tooltip title={moment(record.created_date).format('YYYY.MM.DD HH:mm')}>
              <Icon type="clock-circle-o" /> {moment(record.created_date).fromNow()}
            </Tooltip>
          </div>
        </div>);
      },
    }, {
      width: 200,
      render: (o, record) => <ShipmentColumn shipment={record} />,
    }, {
      title: '进度',
      render: (o, record) => <ProgressColumn order={record} />,
    }, {
      title: '操作',
      width: 60,
      fixed: 'right',
      render: (o, record) => {
        if (record.order_status === CRM_ORDER_STATUS.created) {
          return (
            <div>
              <a onClick={() => this.handleAccept(record.shipmt_order_no)}><Icon type="play-circle" /></a>
              <span className="ant-divider" />
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
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.msg('shipmentOrders')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <RadioGroup onChange={this.handleRadioChange} size="large" defaultValue="active">
            <RadioButton value="active">{this.msg('active')}</RadioButton>
            <RadioButton value="completed">{this.msg('completed')}</RadioButton>
          </RadioGroup>
          <span />
          <RadioGroup onChange={this.handleIEChange} size="large" defaultValue="all">
            <RadioButton value="all">{this.msg('all')}</RadioButton>
            <RadioButton value="import">{this.msg('import')}</RadioButton>
            <RadioButton value="export">{this.msg('export')}</RadioButton>
            <RadioButton value="domestic">{this.msg('domestic')}</RadioButton>
          </RadioGroup>
          <span />
          <ButtonGroup>
            <Button size="large" type="primary" value="sea"><i className="zmdi zmdi-boat" />&nbsp;</Button>
            <Button size="large" type="primary" value="air">&nbsp;<i className="zmdi zmdi-airplane" />&nbsp;</Button>
            <Button size="large" type="primary" value="road">&nbsp;<i className="zmdi zmdi-truck" /></Button>
          </ButtonGroup>
          <div className="top-bar-tools">
            <Button type="primary" size="large" icon="plus" onClick={this.handleCreate}>
              {this.msg('new')}
            </Button>
          </div>
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <div className="toolbar">
              <SearchBar placeholder={this.msg('searchPlaceholder')} onInputSearch={this.handleSearch} size="large" />
              <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
                <h3>已选中{this.state.selectedRowKeys.length}项</h3>
              </div>
            </div>
            <div className="panel-body table-panel">
              <Table rowSelection={rowSelection} dataSource={dataSource} columns={columns} rowKey="id" loading={loading} scroll={{ x: 1800 }} />
            </div>
          </div>
        </Content>
        <PreviewPanel />
      </QueueAnim>
    );
  }
}
