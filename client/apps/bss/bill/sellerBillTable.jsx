import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Button, DatePicker, Select } from 'antd';
import DataTable from 'client/components/DataTable';
import EmptyState from 'client/components/EmptyState';
import SearchBox from 'client/components/SearchBox';
import RowAction from 'client/components/RowAction';
import Summary from 'client/components/Summary';
import TrimSpan from 'client/components/trimSpan';
import { formatMsg, formatGlobalMsg } from './message.i18n';

const { RangePicker } = DatePicker;

@connectFetch()()
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    tenantName: state.account.tenantName,
    loginId: state.account.loginId,
    loginName: state.account.username,
  }),
  { }
)
export default class BuyerBills extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    extraVisible: false,
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  columns = [{
    title: '账单编号',
    dataIndex: 'bill_no',
    width: 150,
    fixed: 'left',
    render: o => (<a onClick={() => this.handlePreview(o)}>{o}</a>),
  }, {
    title: '开始日期',
    dataIndex: 'start_date',
    width: 120,
    render: exprecdate => exprecdate && moment(exprecdate).format('YYYY.MM.DD'),
  }, {
    title: '结束日期',
    dataIndex: 'end_date',
    width: 120,
    render: exprecdate => exprecdate && moment(exprecdate).format('YYYY.MM.DD'),
  }, {
    title: '服务商',
    width: 240,
    dataIndex: 'billing_party',
    render: o => <TrimSpan text={o} maxLen={16} />,
  }, {
    title: '账单类型',
    dataIndex: 'type',
    width: 150,
  }, {
    title: '状态',
    dataIndex: 'status',
    width: 100,
  }, {
    title: '总单数',
    dataIndex: 'order_count',
    width: 100,
  }, {
    title: '账单金额',
    dataIndex: 'bill_amount',
    width: 150,
  }, {
    title: '开票金额',
    dataIndex: 'invoiced_amount',
    width: 150,
  }, {
    title: '实收金额',
    dataIndex: 'payment_rec_amount',
    width: 150,
  }, {
    title: '对账时间',
    dataIndex: 'confirmed_date',
    width: 150,
    render: recdate => recdate && moment(recdate).format('MM.DD HH:mm'),
    sorter: (a, b) => new Date(a.received_date).getTime() - new Date(b.received_date).getTime(),
  }, {
    title: '对账人员',
    dataIndex: 'confirmed_by',
    width: 80,
  }, {
    title: '销账时间',
    dataIndex: 'written_date',
    width: 120,
    render: createdate => createdate && moment(createdate).format('MM.DD HH:mm'),
    sorter: (a, b) => new Date(a.created_date).getTime() - new Date(b.created_date).getTime(),
  }, {
    title: '销账人员',
    dataIndex: 'written_by',
    width: 80,
  }, {
    title: this.gmsg('actions'),
    dataIndex: 'OPS_COL',
    fixed: 'right',
    width: 130,
    render: (o, record) => {
      if (record.status === 0) {
        return (<span>
          <RowAction icon="share-alt" onClick={this.handleSend} label="发送" row={record} />
          <RowAction icon="edit" onClick={this.handleDetail} tooltip="修改账单" row={record} />
        </span>);
      } else if (record.status === 1) {
        return (<span>
          <RowAction icon="swap" onClick={this.handleCheck} label="对账" row={record} />
        </span>);
      } else if (record.status === 2) {
        return (<span>
          <RowAction icon="eye-o" onClick={this.handleDetail} label="查看" row={record} />
        </span>);
      }
      return null;
    },
  }]
  handleSearch = (value) => {
    const filters = { ...this.props.filters, name: value };
    const whseCode = this.props.defaultWhse.code;
    this.props.loadAsnLists({
      whseCode,
      tenantId: this.props.tenantId,
      pageSize: this.props.asnlist.pageSize,
      current: 1,
      filters,
    });
  }
  handleDetail = (row) => {
    const link = `/bss/bill/${row.order_rel_no}`;
    this.context.router.push(link);
  }
  handleCheck = (row) => {
    const link = `/bss/bill/check/${row.order_rel_no}`;
    this.context.router.push(link);
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  toggleExtra = () => {
    this.setState({ extraVisible: !this.state.extraVisible });
  }
  render() {
    const { loading } = this.props;
    const mockData = [{
      id: 1,
      order_rel_no: '1',
      type: 'FPB',
      status: 0,
    }, {
      id: 2,
      order_rel_no: '2',
      type: 'FPB',
      status: 1,
    }, {
      id: 3,
      order_rel_no: '3',
      type: 'FPB',
      status: 2,
    }, {
      id: 4,
      order_rel_no: '4',
      type: 'BPB',
      status: 0,
    }, {
      id: 5,
      order_rel_no: '5',
      type: 'BPB',
      status: 1,
    }, {
      id: 6,
      order_rel_no: '6',
      type: 'BPB',
      status: 2,
    }, {
      id: 7,
      order_rel_no: '7',
      type: 'OFB',
      status: 1,
    }, {
      id: 8,
      order_rel_no: '8',
      type: 'OFB',
      status: 2,
    }];
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    /*
    const dataSource = new DataTable.DataSource({
      fetcher: params => this.props.loadAsnLists(params),
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
      remotes: this.props.asnlist,
    });
    */
    const primaryAction = (<Button type="primary" icon="plus" onClick={this.handleCreate}>
      {this.msg('新建账单')}
    </Button>);
    const toolbarActions = (<span>
      <SearchBox placeholder={this.msg('searchTips')} onSearch={this.handleSearch} />
      <Select
        showSearch
        placeholder="结算对象"
        optionFilterProp="children"
        style={{ width: 160 }}
        dropdownMatchSelectWidth={false}
        dropdownStyle={{ width: 360 }}
      />
      <RangePicker
        ranges={{ Today: [moment(), moment()], 'This Month': [moment().startOf('month'), moment()] }}
        onChange={this.handleDateRangeChange}
      />
    </span>);
    const emptyProps = {
      header: 'This is Header',
      imageUrl: 'https://atlaskit.atlassian.com/b9c4dc7ef2c2a1036fe13a5b229d39df.svg',
      description: 'lots of descritions',
      primaryAction,
    };
    const totCol = (
      <Summary>
        <Summary.Item label="账单金额合计">{10000}</Summary.Item>
        <Summary.Item label="确认金额合计">{6666}</Summary.Item>
      </Summary>
    );
    return (
      <DataTable
        toolbarActions={toolbarActions}
        selectedRowKeys={this.state.selectedRowKeys}
        onDeselectRows={this.handleDeselectRows}
        columns={this.columns}
        dataSource={mockData}
        rowSelection={rowSelection}
        rowKey="id"
        loading={loading}
        total={totCol}
        locale={{ emptyText: <EmptyState {...emptyProps} /> }}
      />
    );
  }
}
