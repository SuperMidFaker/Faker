import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import connectFetch from 'client/common/decorators/connect-fetch';
import { DatePicker, Select, message } from 'antd';
import DataTable from 'client/components/DataTable';
import SearchBox from 'client/components/SearchBox';
// import RowAction from 'client/components/RowAction';
import Summary from 'client/components/Summary';
import TrimSpan from 'client/components/trimSpan';
import { PARTNER_ROLES } from 'common/constants';
import { loadOrderStatements, loadPendingStatistics } from 'common/reducers/bssStatement';
import { formatMsg, formatGlobalMsg } from './message.i18n';

const { RangePicker } = DatePicker;
const { Option } = Select;

@connectFetch()()
@injectIntl
@connect(
  state => ({
    orderStatementlist: state.bssStatement.orderStatementlist,
    listFilter: state.bssStatement.listFilter,
    loading: state.bssStatement.loading,
    statistics: state.bssStatement.statistics,
    partners: state.partner.partners,
  }),
  { loadOrderStatements, loadPendingStatistics }
)
export default class SellerPendingTable extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
  }
  componentDidMount() {
    this.handleOrdersLoad(1);
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  columns = [{
    title: '业务编号',
    dataIndex: 'sof_order_no',
    width: 150,
    fixed: 'left',
    render: o => (<a onClick={() => this.handlePreview(o)}>{o}</a>),
  }, {
    title: '服务商',
    dataIndex: 'vendor_name',
    render: o => <TrimSpan text={o} maxLen={16} />,
  }, {
    title: '客户单号',
    width: 180,
    dataIndex: 'cust_order_no',
  }, {
    title: '应付金额',
    dataIndex: 'buyer_settled_amount',
    width: 150,
  }, {
    title: this.gmsg('actions'),
    dataIndex: 'OPS_COL',
    className: 'table-col-ops',
    width: 130,
  }]
  dataSource = new DataTable.DataSource({
    fetcher: params => this.props.loadOrderStatements(params),
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
        pageSize: pagination.pageSize,
        current: pagination.current,
      };
      const filter = {
        ...this.props.listFilter,
        bill_type: 'sellerBill',
      };
      params.filter = JSON.stringify(filter);
      return params;
    },
    remotes: this.props.orderStatementlist,
  })
  handleOrdersLoad = (currentPage, filter) => {
    const { listFilter, orderStatementlist: { pageSize, current } } = this.props;
    const filters = filter || listFilter;
    filters.bill_type = 'sellerBill';
    this.props.loadOrderStatements({
      filter: JSON.stringify(filters),
      pageSize,
      current: currentPage || current,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.handleDeselectRows();
      }
    });
    this.props.loadPendingStatistics({ filter: JSON.stringify(filters) });
  }
  handleSearch = (value) => {
    const filter = { ...this.props.listFilter, searchText: value };
    this.handleOrdersLoad(1, filter);
  }
  handleDateRangeChange = (data, dataString) => {
    const filter = { ...this.props.listFilter, startDate: dataString[0], endDate: dataString[1] };
    this.handleOrdersLoad(1, filter);
  }
  handleClientSelectChange = (value) => {
    const filters = { ...this.props.listFilter, clientPid: value };
    this.handleOrdersLoad(1, filters);
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  render() {
    const { loading, orderStatementlist, statistics } = this.props;
    const partners = this.props.partners.filter(pt => pt.role === PARTNER_ROLES.SUP);
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    this.dataSource.remotes = orderStatementlist;
    const toolbarActions = (<span>
      <SearchBox placeholder={this.msg('searchTips')} onSearch={this.handleSearch} />
      <Select
        showSearch
        placeholder="服务商"
        optionFilterProp="children"
        style={{ width: 160 }}
        onChange={this.handleClientSelectChange}
        dropdownMatchSelectWidth={false}
        dropdownStyle={{ width: 360 }}
      >
        <Option value="all" key="all">全部</Option>
        {partners.map(data => (
          <Option key={String(data.id)} value={String(data.id)}>{data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}
          </Option>))
        }
      </Select>
      <RangePicker
        ranges={{ 当天: [moment(), moment()], 当月: [moment().startOf('month'), moment()] }}
        onChange={this.handleDateRangeChange}
      />
    </span>);
    const totCol = (
      <Summary>
        <Summary.Item label="未入账单金额合计">{statistics.buyer_settled_amount}</Summary.Item>
      </Summary>
    );
    return (
      <DataTable
        toolbarActions={toolbarActions}
        selectedRowKeys={this.state.selectedRowKeys}
        onDeselectRows={this.handleDeselectRows}
        columns={this.columns}
        dataSource={this.dataSource}
        rowSelection={rowSelection}
        rowKey="sof_order_no"
        loading={loading}
        total={totCol}
      />
    );
  }
}
