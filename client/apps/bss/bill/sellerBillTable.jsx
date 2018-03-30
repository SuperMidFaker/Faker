import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { DatePicker, Select, message, Tag } from 'antd';
import DataTable from 'client/components/DataTable';
import SearchBox from 'client/components/SearchBox';
import RowAction from 'client/components/RowAction';
import Summary from 'client/components/Summary';
import TrimSpan from 'client/components/trimSpan';
import { PARTNER_ROLES, BILL_STATUS } from 'common/constants';
import { loadBills, loadBillStatistics, sendBill, deleteBills, writeOffBill, recallBill } from 'common/reducers/bssBill';
import BillTypeTag from './common/billTypeTag';
import { formatMsg, formatGlobalMsg } from './message.i18n';

const { RangePicker } = DatePicker;
const { Option } = Select;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    billlist: state.bssBill.billlist,
    listFilter: state.bssBill.listFilter,
    loading: state.bssBill.loading,
    partners: state.partner.partners,
    billReload: state.bssBill.billReload,
    billStat: state.bssBill.billStat,
  }),
  {
    loadBills, loadBillStatistics, sendBill, deleteBills, writeOffBill, recallBill,
  }
)
export default class SellerBills extends React.Component {
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
    this.handleBillsLoad(1);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.billReload) {
      this.handleBillsLoad(1, nextProps.listFilter);
    }
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  dataSource = new DataTable.DataSource({
    fetcher: params => this.props.loadBills(params),
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
    remotes: this.props.billlist,
  });
  columns = [{
    title: '账单名称',
    dataIndex: 'bill_title',
    width: 150,
    fixed: 'left',
    render: o => (<a onClick={() => this.handlePreview(o)}>{o}</a>),
  }, {
    title: '开始日期',
    dataIndex: 'order_begin_date',
    width: 100,
    render: exprecdate => exprecdate && moment(exprecdate).format('YYYY.MM.DD'),
  }, {
    title: '结束日期',
    dataIndex: 'order_end_date',
    width: 100,
    render: exprecdate => exprecdate && moment(exprecdate).format('YYYY.MM.DD'),
  }, {
    title: '服务商',
    width: 200,
    dataIndex: 'seller_name',
    render: o => <TrimSpan text={o} maxLen={12} />,
  }, {
    title: '账单类型',
    dataIndex: 'bill_type',
    width: 150,
    render: o => <BillTypeTag billType={o} msg={this.msg} />,
  }, {
    title: '状态',
    dataIndex: 'bill_status',
    width: 100,
    render: (o) => {
      const status = BILL_STATUS.filter(st => st.value === o)[0];
      const text = status ? status.text : o;
      return <Tag>{text}</Tag>;
    },
  }, {
    title: '总单数',
    dataIndex: 'order_count',
    width: 100,
  }, {
    title: '账单金额',
    dataIndex: 'total_amount',
    width: 150,
  }, {
    title: '调整金额',
    dataIndex: 'invoiced_amount',
    width: 150,
  }, {
    title: '最终结算金额',
    dataIndex: 'payment_rec_amount',
    width: 150,
  }, {
    title: '最后更新时间',
    dataIndex: 'last_updated_date',
    width: 150,
    render: recdate => recdate && moment(recdate).format('MM.DD HH:mm'),
    sorter: (a, b) => new Date(a.received_date).getTime() - new Date(b.received_date).getTime(),
  }, {
    title: '更新人员',
    dataIndex: 'last_updated_by',
    width: 80,
  }, {
    title: '创建日期',
    dataIndex: 'created_date',
    width: 120,
    render: createdate => createdate && moment(createdate).format('MM.DD HH:mm'),
    sorter: (a, b) => new Date(a.created_date).getTime() - new Date(b.created_date).getTime(),
  }, {
    title: this.gmsg('actions'),
    dataIndex: 'OPS_COL',
    fixed: 'right',
    className: 'table-col-ops',
    width: 130,
    render: (o, record) => {
      if (record.bill_type === 'OFB') {
        if (record.bill_status === 1) {
          return (<span>
            <RowAction icon="share-alt" onClick={this.handleSendEmail} label="发送邮件" row={record} />
            <RowAction icon="edit" onClick={this.handleDetail} tooltip="修改账单" row={record} />
            <RowAction danger confirm={this.gmsg('deleteConfirm')} onConfirm={this.handleDelete} icon="delete" row={record} />
          </span>);
        } else if (record.bill_status === 2) {
          return (<span>
            <RowAction icon="swap" onClick={this.handleCheck} label="对账" row={record} />
            <RowAction icon="share-alt" onClick={this.handleSendEmail} label="重新发送" row={record} />
          </span>);
        } else if (record.bill_status === 4) {
          return (<span>
            <RowAction icon="swap" onClick={this.handleDetail} label="查看" row={record} />
            <RowAction icon="swap" onClick={this.handleWriteOff} label="确认核销" row={record} />
          </span>);
        }
      } else if (record.bill_status === 1) {
        return (<span>
          <RowAction icon="share-alt" onClick={this.handleSend} label="发送" row={record} />
          <RowAction icon="edit" onClick={this.handleDetail} tooltip="修改账单" row={record} />
          <RowAction danger confirm={this.gmsg('deleteConfirm')} onConfirm={this.handleDelete} icon="delete" row={record} />
        </span>);
      } else if (record.bill_status === 2) {
        return (<RowAction icon="swap" onClick={this.handleCheck} label="对账" row={record} />);
      } else if (record.bill_status === 3) {
        return (<RowAction icon="swap" onClick={this.handleRecall} label="撤销" row={record} />);
      } else if (record.bill_status === 4 && record.tenant_id === this.props.tenantId) {
        return (<span>
          <RowAction icon="swap" onClick={this.handleDetail} label="查看" row={record} />
          <RowAction icon="swap" onClick={this.handleWriteOff} label="确认核销" row={record} />
        </span>);
      }
      return null;
    },
  }]
  handleRecall = (row) => {
    this.props.recallBill({ bill_no: row.bill_no }).then((result) => {
      if (!result.error) {
        this.handleBillsLoad(1);
      }
    });
  }
  handleWriteOff = (row) => {
    this.props.writeOffBill({ bill_no: row.bill_no }).then((result) => {
      if (!result.error) {
        this.handleBillsLoad(1);
      }
    });
  }
  handleBillsLoad = (currentPage, filter) => {
    const { listFilter, billlist: { pageSize, current } } = this.props;
    const filters = filter || listFilter;
    this.props.loadBillStatistics({ filter: JSON.stringify(filters) });
    this.props.loadBills({
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
  }
  handleSearch = (value) => {
    const filter = { ...this.props.listFilter, searchText: value };
    this.handleBillsLoad(1, filter);
  }
  handleDateRangeChange = (data, dataString) => {
    const filter = { ...this.props.listFilter, startDate: dataString[0], endDate: dataString[1] };
    this.handleBillsLoad(1, filter);
  }
  handleClientSelectChange = (value) => {
    const filter = { ...this.props.listFilter, clientPid: value };
    this.handleBillsLoad(1, filter);
  }
  handleSend = (row) => {
    this.props.sendBill({ bill_no: row.bill_no }).then((result) => {
      if (!result.error) {
        this.handleBillsLoad(1);
      }
    });
  }
  handleDelete = (row) => {
    this.props.deleteBills([row.bill_no]).then((result) => {
      if (!result.error) {
        this.handleBillsLoad(1);
      }
    });
  }
  handleDetail = (row) => {
    const link = `/bss/bill/${row.bill_no}`;
    this.context.router.push(link);
  }
  handleCheck = (row) => {
    const link = `/bss/bill/reconcile/${row.bill_no}`;
    this.context.router.push(link);
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  render() {
    const {
      loading, billlist, billStat,
    } = this.props;
    this.dataSource.remotes = billlist;
    const partners = this.props.partners.filter(pt => pt.role === PARTNER_ROLES.SUP);
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const toolbarActions = (<span>
      <SearchBox placeholder={this.msg('searchTips')} onSearch={this.handleSearch} />
      <Select
        showSearch
        placeholder="服务商"
        optionFilterProp="children"
        onChange={this.handleClientSelectChange}
        dropdownMatchSelectWidth={false}
        dropdownStyle={{ width: 360 }}
      >
        <Option value="all" key="all">全部服务商</Option>
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
        <Summary.Item label="账单金额合计">{billStat.total_amount}</Summary.Item>
        <Summary.Item label="确认金额合计">{0}</Summary.Item>
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
        rowKey="bill_no"
        loading={loading}
        total={totCol}
      />
    );
  }
}
