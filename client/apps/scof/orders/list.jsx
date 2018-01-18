import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Menu, Icon, Radio, Popconfirm, Progress, message, Layout, Tooltip, Select } from 'antd';
import DataTable from 'client/components/DataTable';
import { Link } from 'react-router';
import QueueAnim from 'rc-queue-anim';
import { SCOF_ORDER_TRANSFER, CRM_ORDER_STATUS, PARTNER_ROLES, LINE_FILE_ADAPTOR_MODELS } from 'common/constants';
import { loadOrders, removeOrder, setClientForm, acceptOrder, hideDock, loadOrderDetail } from 'common/reducers/crmOrders';
import { loadPartners } from 'common/reducers/partner';
import { emptyFlows, loadPartnerFlowList } from 'common/reducers/scofFlow';
import { loadModelAdaptors } from 'common/reducers/saasLineFileAdaptor';
import connectFetch from 'client/common/decorators/connect-fetch';
import SearchBox from 'client/components/SearchBox';
import PageHeader from 'client/components/PageHeader';
import RowAction from 'client/components/RowAction';
import UserAvatar from 'client/components/UserAvatar';
import connectNav from 'client/common/decorators/connect-nav';
import ImportDataPanel from 'client/components/ImportDataPanel';
import OrderDockPanel from './docks/orderDockPanel';
import OrderNoColumn from './columndef/orderNoColumn';
import ShipmentColumn from './columndef/shipmentColumn';
import ProgressColumn from './columndef/progressColumn';
import DelegationDockPanel from '../../cms/common/dock/delegationDockPanel';
import ShipmentDockPanel from '../../transport/shipment/dock/shipmentDockPanel';
import ReceiveDockPanel from '../../cwm/receiving/dock/receivingDockPanel';
import ShippingDockPanel from '../../cwm/shipping/dock/shippingDockPanel';
import CreatorSelect from './creatorSelect';
import { formatMsg } from './message.i18n';

const { Content } = Layout;
const { Option } = Select;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

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
@connect(state => ({
  tenantId: state.account.tenantId,
  loginId: state.account.loginId,
  username: state.account.username,
  tenantName: state.account.tenantName,
  loading: state.crmOrders.loading,
  orders: state.crmOrders.orders,
  filters: state.crmOrders.orderFilters,
  partners: state.partner.partners,
  adaptors: state.saasLineFileAdaptor.modelAdaptors,
  flows: state.scofFlow.partnerFlows,
}), {
  loadOrders,
  removeOrder,
  setClientForm,
  acceptOrder,
  emptyFlows,
  loadPartnerFlowList,
  loadModelAdaptors,
  hideDock,
  loadOrderDetail,
})
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
    orders: PropTypes.shape({ shipmt_order_no: PropTypes.string }).isRequired,
    filters: PropTypes.shape({ progress: PropTypes.string, transfer: PropTypes.string }).isRequired,
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
    importPanel: {
      visible: false,
      customer_partner_id: undefined,
      flow_id: undefined,
    },
  }
  componentWillMount() {
    this.props.hideDock();
  }
  componentDidMount() {
    const { query } = this.props.location;
    if (query.shipmt_order_no) {
      this.props.loadOrderDetail(query.shipmt_order_no, this.props.tenantId);
    }
    this.props.loadPartnerFlowList();
    this.props.loadModelAdaptors(null, [LINE_FILE_ADAPTOR_MODELS.SOF_ORDER.key]);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.location) {
      const { query } = this.props.location;
      const nextQuery = nextProps.location.query;
      if (query.shipmt_order_no !== nextQuery.shipmt_order_no) {
        this.props.loadOrderDetail(nextQuery.shipmt_order_no, this.props.tenantId);
      }
    }
  }
  msg = formatMsg(this.props.intl)
  handleImport = () => {
    this.setState({ importPanel: { visible: true } });
  }
  handleCreate = () => {
    this.props.setClientForm(-2, {});
    this.props.emptyFlows();
    this.context.router.push('/scof/orders/create');
  }
  handleRemove = (shipmtOrderNo) => {
    const { tenantId, loginId, username } = this.props;
    this.props.removeOrder({
      tenantId, loginId, username, shipmtOrderNo,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        message.info('删除成功');
        this.handleTableLoad();
      }
    });
  }
  handleStart = (row) => {
    const { loginId, username } = this.props;
    const shipmtOrderNo = row.shipmt_order_no;
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
  handleImportClientChange = (customerPartnerId) => {
    this.props.loadPartnerFlowList({ partnerId: customerPartnerId });
    this.props.loadModelAdaptors(customerPartnerId, [LINE_FILE_ADAPTOR_MODELS.SOF_ORDER.key]);
    this.setState({ importPanel: { ...this.state.importPanel, partner_id: customerPartnerId } });
  }
  handleImportFlowChange = (flowId) => {
    this.setState({ importPanel: { ...this.state.importPanel, flow_id: flowId } });
  }
  handleCheckUpload = (msg) => {
    if (!this.state.importPanel.flow_id) {
      if (msg) {
        message.warn('订单导入流程规则未选');
      }
      return false;
    }
    return true;
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  render() {
    const {
      loading, filters, flows, partners,
    } = this.props;
    const { importPanel } = this.state;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };

    const columns = [{
      title: '订单',
      width: 260,
      fixed: 'left',
      render: (o, record) => <OrderNoColumn order={record} />,
    }, {
      dataIndex: 'order_status',
      width: 100,
      render: (o, record) => {
        const percent = record.flow_node_num ?
          Number(((record.finish_num / record.flow_node_num) * 100).toFixed(1)) : 0;
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
      width: 30,
      render: (o) => {
        const transfer = SCOF_ORDER_TRANSFER.filter(sot => sot.value === o)[0];
        return transfer && <Tooltip title={transfer.text} ><Icon type={transfer.icon} /></Tooltip>;
      },
    }, {
      width: 250,
      render: (o, record) => <ShipmentColumn shipment={record} />,
    }, {
      title: '进度状态',
      render: (o, record) => <ProgressColumn order={record} />,
    }, {
      title: '执行者',
      dataindex: 'exec_login_id',
      width: 120,
      render: lid => <UserAvatar size="small" loginId={lid} showName />,
    }, {
      title: '操作',
      width: 120,
      fixed: 'right',
      className: 'editable-row-operations',
      render: (o, record) => {
        if (record.order_status === CRM_ORDER_STATUS.created) {
          return (
            <div>
              {record.flow_node_num > 0 &&
                <RowAction onClick={this.handleStart} label={this.msg('startOrder')} icon="caret-right" row={record} />
              }
              <RowAction overlay={(
                <Menu onClick={this.handleMenuClick}>
                  <Menu.Item key="edit">
                    <Link to={`/scof/orders/edit/${record.shipmt_order_no}`}><Icon type="edit" />修改</Link>
                  </Menu.Item>
                  <Menu.Item key="delete">
                    <Popconfirm title="确定删除?" onConfirm={() => this.handleRemove(record.shipmt_order_no)}>
                      <a><Icon type="delete" />删除</a>
                    </Popconfirm>
                  </Menu.Item>
                </Menu>)}
              />
            </div>
          );
        }
        return (
          <div />
        );
      },
    }];
    const dataSource = new DataTable.DataSource({
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
    const toolbarActions = (<span>
      <SearchBox placeholder={this.msg('searchPlaceholder')} onSearch={this.handleSearch} />
      <Select
        showSearch
        optionFilterProp="children"
        style={{ width: 160 }}
        onChange={this.handleClientSelectChange}
        value={filters.partnerId ? filters.partnerId : 'all'}
        dropdownMatchSelectWidth={false}
        dropdownStyle={{ width: 360 }}
      >
        <Option value="all">全部客户</Option>
        {partners.map(data => (<Option key={data.id} value={data.id}>{data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}</Option>))}
      </Select>
      <Select
        showSearch
        optionFilterProp="children"
        style={{ width: 160 }}
        onChange={this.handleClientSelectChange}
        value={filters.partnerId ? filters.partnerId : 'all'}
      >
        <Option value="all">全部类型</Option>
        {partners.map(data => (<Option key={data.id} value={data.id}>{data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}</Option>))}
      </Select>
      <span />
      <CreatorSelect onChange={this.handleCreatorChange} onInitialize={this.handleCreatorChange} />
    </span>
    );
    return (
      <QueueAnim type={['bottom', 'up']}>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('shipmentOrders')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Nav>
            <RadioGroup onChange={this.handleProgressChange} value={filters.progress}>
              <RadioButton value="all">全部</RadioButton>
              <RadioButton value="active">进行中</RadioButton>
              <RadioButton value="completed">已完成</RadioButton>
            </RadioGroup>
          </PageHeader.Nav>
          <PageHeader.Actions>
            <Button icon="upload" onClick={this.handleImport}>
              {this.msg('orderImport')}
            </Button>
            <Button type="primary" icon="plus" onClick={this.handleCreate}>
              {this.msg('new')}
            </Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content" key="main">
          <DataTable
            noSetting
            toolbarActions={toolbarActions}
            rowSelection={rowSelection}
            selectedRowKeys={this.state.selectedRowKeys}
            handleDeselectRows={this.handleDeselectRows}
            dataSource={dataSource}
            columns={columns}
            rowKey="id"
            loading={loading}
          />
        </Content>
        <OrderDockPanel reload={this.handleTableLoad} />
        <DelegationDockPanel />
        <ShipmentDockPanel />
        <ReceiveDockPanel />
        <ShippingDockPanel />
        <ImportDataPanel
          adaptors={this.props.adaptors.data}
          title="订单导入"
          visible={importPanel.visible}
          endpoint={`${API_ROOTS.default}v1/sof/order/import`}
          formData={{ customer_partner_id: importPanel.partner_id, flow_id: importPanel.flow_id }}
          onClose={() => { this.setState({ importPanel: { visible: false } }); }}
          onBeforeUpload={this.handleCheckUpload}
          onUploaded={() => {
            this.setState({ importPanel: { visible: false } });
            this.handleTableLoad();
}}
          template={`${XLSX_CDN}/订单导入模板.xlsx`}
        >
          <Select
            placeholder="请选择客户"
            showSearch
            allowClear
            optionFilterProp="children"
            value={importPanel.partner_id}
            onChange={this.handleImportClientChange}
            dropdownMatchSelectWidth={false}
            dropdownStyle={{ width: 360 }}
            style={{ width: '100%', marginBottom: '10px' }}
          >
            {partners.map(data => (<Option key={data.id} value={data.id}>{data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}</Option>))}
          </Select>
          <Select
            placeholder="流程规则必填"
            showSearch
            allowClear
            value={importPanel.flow_id}
            onChange={this.handleImportFlowChange}
            style={{ width: '100%' }}
          >
            {flows.map(data => <Option key={data.id} value={data.id}>{data.name}</Option>)}
          </Select>
        </ImportDataPanel>
      </QueueAnim>
    );
  }
}
