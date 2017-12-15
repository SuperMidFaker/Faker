import React from 'react';
import PropTypes from 'prop-types';
import { Button, DatePicker, Layout } from 'antd';
import Table from 'client/components/remoteAntTable';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import { loadOrders, loadClearanceFees, loadTransportFees, changeFeesFilter, loadPartners } from 'common/reducers/crmBilling';
import TrimSpan from 'client/components/trimSpan';
// import { createFilename } from 'client/util/dataTransform';
// import OrderDockPanel from '../orders/docks/orderDockPanel';
import { loadOrderDetail } from 'common/reducers/crmOrders';
import SearchBar from 'client/components/SearchBar';
import { PARTNER_ROLES, PARTNER_BUSINESSE_TYPES, CRM_ORDER_MODE } from 'common/constants';
import TrsShipmtNoColumn from '../common/trsShipmtNoColumn';
import CcbDelgNoColumn from '../common/ccbDelgNoColumn';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const RangePicker = DatePicker.RangePicker;

function fetchData({ state, dispatch }) {
  const sDate = new Date();
  sDate.setMonth(sDate.getMonth() - 3);
  const eDate = new Date();
  return dispatch(loadOrders({
    tenantId: state.account.tenantId,
    pageSize: state.crmBilling.fees.pageSize,
    current: state.crmBilling.fees.current,
    searchValue: state.crmBilling.fees.searchValue,
    startDate: sDate,
    endDate: eDate,
    filters: state.crmBilling.fees.filters,
  }));
}

@connectFetch()(fetchData)
@injectIntl
@connectNav({
  depth: 2,
  moduleName: 'bss',
})
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    fees: state.crmBilling.fees,
    loading: state.crmBilling.loading,
  }),
  {
    loadOrders, loadClearanceFees, loadTransportFees, loadOrderDetail, changeFeesFilter, loadPartners,
  }
)

export default class FeesList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    loadOrders: PropTypes.func.isRequired,
    fees: PropTypes.object.isRequired,
    loadOrderDetail: PropTypes.func.isRequired,
    changeFeesFilter: PropTypes.func.isRequired,
    loadPartners: PropTypes.func.isRequired,
    loadClearanceFees: PropTypes.func.isRequired,
    loadTransportFees: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
  }
  state = {
    customers: [],
    selectedRowKeys: [],
  }
  componentWillMount() {
    this.props.loadPartners(
      this.props.tenantId,
      [PARTNER_ROLES.CUS],
      [PARTNER_BUSINESSE_TYPES.clearance, PARTNER_BUSINESSE_TYPES.transport]
    ).then((result) => {
      this.setState({ customers: result.data });
    });
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.fees.searchValue !== nextProps.fees.searchValue) {
      // this.handleTableLoad(nextProps.fees.searchValue);
    }
    if (this.props.fees.loadTimes !== nextProps.fees.loadTimes) {
      const shipmtOrders = [];
      nextProps.fees.data.forEach((item) => {
        shipmtOrders.push({
          trs_shipmt_no: item.trs_shipmt_no,
          ccb_delg_no: item.ccb_delg_no,
          shipmt_order_no: item.shipmt_order_no,
        });
      });
      this.props.loadTransportFees(shipmtOrders);
      this.props.loadClearanceFees(shipmtOrders);
    }
  }
  onDateChange = (value) => {
    this.props.changeFeesFilter('startDate', value[0]);
    this.props.changeFeesFilter('endDate', value[1]);
    this.handleTableLoad();
  }
  handleSelectionClear = () => {
    this.setState({ selectedRowKeys: [] });
  }
  handleTableLoad = (searchValue) => {
    this.handleSelectionClear();
    const { tenantId } = this.props;
    const {
      pageSize, current, filters, startDate, endDate,
    } = this.props.fees;
    this.props.loadOrders({
      tenantId,
      pageSize,
      current,
      startDate,
      endDate,
      searchValue: searchValue !== undefined ? searchValue : this.props.fees.searchValue,
      filters,
    });
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values)
  handleExportExcel = () => {
    // const { tenantId } = this.props;
    // const { filters, startDate, endDate } = this.props.fees;
    // window.open(`${API_ROOTS.default}v1/transport/billing/exportFeesExcel/${createFilename('fees')}.xlsx?tenantId=${tenantId}&filters=${
    //   JSON.stringify(filters)}&startDate=${moment(startDate).format('YYYY-MM-DD 00:00:00')}&endDate=${moment(endDate).format('YYYY-MM-DD 23:59:59')}`);
    // this.handleClose();
  }
  handleSearchInput = (value) => {
    this.props.changeFeesFilter('searchValue', value);
  }
  renderTransportCharge = (o, record) => {
    if (record.shipmt_order_mode.indexOf(CRM_ORDER_MODE.transport) >= 0) {
      return o ? o.toFixed(2) : '';
    } else {
      return '';
    }
  }
  renderClearanceCharge = (o, record) => {
    if (record.shipmt_order_mode.indexOf(CRM_ORDER_MODE.clearance) >= 0) {
      return o ? o.toFixed(2) : '';
    } else {
      return '';
    }
  }
  render() {
    const { customers } = this.state;
    const { loading } = this.props;
    const columns = [{
      title: '业务编号',
      dataIndex: 'shipmt_no',
      fixed: 'left',
      width: 150,
      render: (o, record) => (<a onClick={() => this.props.loadOrderDetail(record.shipmt_order_no, this.props.tenantId, 'charge')}>{record.shipmt_order_no}</a>),
    }, {
      title: '客户',
      dataIndex: 'customer_name',
      width: 180,
      render: o => <TrimSpan text={o} />,
      filters: customers.map(item => ({ text: item.partner_code ? `${item.partner_code} | ${item.name}` : item.name, value: item.name })),
    }, {
      title: '委托编号',
      dataIndex: 'ccb_delg_no',
      width: 180,
      render: o => <CcbDelgNoColumn nos={o} />,
    }, {
      title: '报关服务费',
      key: 'ccb_server_charge',
      dataIndex: 'ccb_server_charge',
      width: 100,
      render: this.renderClearanceCharge,
    }, {
      title: '报关代垫费用',
      key: 'ccb_cush_charge',
      dataIndex: 'ccb_cush_charge',
      width: 100,
      render: this.renderClearanceCharge,
    }, {
      title: '报关费用合计',
      key: 'ccbTotalCharge',
      dataIndex: 'ccbTotalCharge',
      width: 100,
      render: this.renderClearanceCharge,
    }, {
      title: '运输单号',
      dataIndex: 'trs_shipmt_no',
      width: 180,
      render(o) {
        return <TrsShipmtNoColumn nos={o} />;
      },
    }, {
      title: '基本运费',
      key: 'trs_freight_charge',
      dataIndex: 'trs_freight_charge',
      width: 80,
      render: this.renderTransportCharge,
    }, {
      title: '特殊费用',
      key: 'trs_excp_charge',
      dataIndex: 'trs_excp_charge',
      width: 80,
      render: this.renderTransportCharge,
    }, {
      title: '运输代垫费用',
      key: 'trs_advance_charge',
      dataIndex: 'trs_advance_charge',
      width: 100,
      render: this.renderTransportCharge,
    }, {
      title: '运输费用合计',
      key: 'trsTotalCharge',
      dataIndex: 'trsTotalCharge',
      width: 100,
      render: this.renderTransportCharge,
    }, {
      title: '订单总费用',
      key: 'total_charge',
      dataIndex: 'total_charge',
      width: 100,
      render(o) {
        return o ? o.toFixed(2) : '';
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
      getParams: (pagination, filters) => {
        const { searchValue, startDate, endDate } = this.props.fees;
        const params = {
          tenantId: this.props.tenantId,
          pageSize: pagination.pageSize,
          current: pagination.current,
          searchValue,
          startDate,
          endDate,
          filters,
        };
        return params;
      },
      remotes: this.props.fees,
    });
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const { startDate, endDate } = this.props.fees;
    return (
      <div>
        <Header className="page-header">
          <span>{this.msg('fee')}</span>
          <div className="page-header-tools">
            <SearchBar placeholder="输入订单号搜索" onInputSearch={this.handleSearchInput}
              value={this.props.fees.searchValue}
            />
          </div>
        </Header>
        <Content className="main-content">
          <div className="page-body">
            <div className="toolbar">
              <Button onClick={this.handleExportExcel}>{this.msg('export')}</Button>
              <div className="toolbar-right">
                <RangePicker style={{ width: 200 }} value={[moment(startDate), moment(endDate)]}
                  onChange={this.onDateChange}
                />
              </div>
              <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
                <h3>已选中{this.state.selectedRowKeys.length}项</h3>
              </div>
            </div>
            <div className="panel-body table-panel table-fixed-layout">
              <Table rowSelection={rowSelection} dataSource={dataSource} columns={columns} rowKey="id" scroll={{ x: 1600 }} loading={loading} />
            </div>
          </div>
        </Content>
        {/* <OrderDockPanel stage="billing" />
        */}
      </div>
    );
  }
}
