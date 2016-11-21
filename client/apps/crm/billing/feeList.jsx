import React, { PropTypes } from 'react';
import { Button, DatePicker } from 'antd';
import Table from 'client/components/remoteAntTable';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import { loadFees, changeFeesFilter, loadPartners, toggleAdvanceChargeModal } from 'common/reducers/crmBilling';
import TrimSpan from 'client/components/trimSpan';
// import { createFilename } from 'client/util/dataTransform';
import PreviewPanel from '../orders/modals/preview-panel';
import { loadOrderDetail } from 'common/reducers/crmOrders';
import SearchBar from 'client/components/search-bar';
import { PARTNERSHIP_TYPE_INFO } from 'common/constants';
import TrsShipmtNoColumn from '../common/trsShipmtNoColumn';

const formatMsg = format(messages);
const RangePicker = DatePicker.RangePicker;

function fetchData({ state, dispatch }) {
  return dispatch(loadFees({
    tenantId: state.account.tenantId,
    pageSize: state.crmBilling.fees.pageSize,
    current: state.crmBilling.fees.current,
    searchValue: state.crmBilling.fees.searchValue,
    startDate: state.crmBilling.fees.startDate,
    endDate: state.crmBilling.fees.endDate,
    filters: state.crmBilling.fees.filters,
  }));
}

@connectFetch()(fetchData)
@injectIntl
@connectNav({
  depth: 2,
  moduleName: 'customer',
})
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    fees: state.crmBilling.fees,
    loading: state.crmBilling.loading,
  }),
  { loadFees, loadOrderDetail, changeFeesFilter, loadPartners, toggleAdvanceChargeModal }
)

export default class FeesList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    loadFees: PropTypes.func.isRequired,
    fees: PropTypes.object.isRequired,
    loadOrderDetail: PropTypes.func.isRequired,
    changeFeesFilter: PropTypes.func.isRequired,
    loadPartners: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    toggleAdvanceChargeModal: PropTypes.func.isRequired,
  }
  state = {
    customers: [],
    selectedRowKeys: [],
  }
  componentWillMount() {
    this.props.loadPartners(this.props.tenantId, [PARTNERSHIP_TYPE_INFO.customer, PARTNERSHIP_TYPE_INFO.dispatchCustomer]).then((result) => {
      this.setState({ customers: result.data });
    });
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.fees.searchValue !== nextProps.fees.searchValue) {
      // this.handleTableLoad(nextProps.fees.searchValue);
    }
  }
  onDateChange = (value) => {
    const promises = [this.props.changeFeesFilter('startDate', value[0]), this.props.changeFeesFilter('endDate', value[1])];
    Promise.all(promises).then(() => {
      // this.handleTableLoad();
    });
  }
  handleSelectionClear = () => {
    this.setState({ selectedRowKeys: [] });
  }
  handleTableLoad = (searchValue) => {
    this.handleSelectionClear();
    const { tenantId } = this.props;
    const { pageSize, current, filters, startDate, endDate } = this.props.fees;
    this.props.loadFees({
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
  render() {
    const { customers } = this.state;
    const { loading } = this.props;
    const columns = [{
      title: '业务编号',
      dataIndex: 'shipmt_no',
      fixed: 'left',
      width: 150,
      render: (o, record) => {
        return (<a onClick={() => this.props.loadOrderDetail(record.shipmt_order_no, this.props.tenantId, 'clearance')}>{record.shipmt_order_no}</a>);
      },
    }, {
      title: '委托客户',
      dataIndex: 'customer_name',
      render: o => <TrimSpan text={o} />,
      filters: customers.map(item => ({ text: item.name, value: item.name })),
    }, {
      title: '报关委托号',
      dataIndex: 'ccb_delg_no',
    }, {
      title: '报关服务费',
    }, {
      title: '报关代垫费用',
    }, {
      title: '报关费用合计',
    }, {
      title: '运输单号',
      dataIndex: 'trs_shipmt_no',
      render(o) {
        return <TrsShipmtNoColumn trsShipmtNos={o} />;
      },
    }, {
      title: '基本运费',
    }, {
      title: '特殊费用',
    }, {
      title: '运输代垫费用',
    }, {
      title: '运输费用合计',
    }, {
      title: '订单总费用',
    }];

    const dataSource = new Table.DataSource({
      fetcher: params => this.props.loadFees(params),
      resolve: result => result.data,
      getPagination: (result, resolve) => ({
        total: result.totalCount,
        current: resolve(result.totalCount, result.current, result.pageSize),
        showSizeChanger: true,
        showQuickJumper: false,
        pageSize: result.pageSize,
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
        <header className="top-bar">
          <span>{this.msg('fee')}</span>
        </header>
        <div className="top-bar-tools">
          <SearchBar placeholder="输入订单号搜索" onInputSearch={this.handleSearchInput}
            value={this.props.fees.searchValue}
          />
        </div>
        <div className="main-content">
          <div className="page-body">
            <div className="panel-header">
              <Button type="primary" onClick={() => this.props.toggleAdvanceChargeModal(true)} >{this.msg('import')}</Button>
              <Button style={{ marginLeft: 16 }} onClick={this.handleExportExcel}>{this.msg('export')}</Button>
              <div style={{ float: 'right' }}>
                <RangePicker style={{ width: 200 }} defaultValue={[moment(startDate), moment(endDate)]}
                  onChange={this.onDateChange}
                />
              </div>
            </div>
            <div className="panel-body table-panel">
              <Table rowSelection={rowSelection} dataSource={dataSource} columns={columns} rowKey="id" scroll={{ x: 1400 }} loading={loading} />
            </div>
          </div>
        </div>
        <PreviewPanel stage="billing" />
      </div>
    );
  }
}
