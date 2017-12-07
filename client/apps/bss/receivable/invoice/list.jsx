import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Button, Breadcrumb, DatePicker, Layout, Radio, Select } from 'antd';
import DataTable from 'client/components/DataTable';
import QueueAnim from 'rc-queue-anim';
import SearchBar from 'client/components/SearchBar';
import RowAction from 'client/components/RowAction';
import Summary from 'client/components/Summary';
import PageHeader from 'client/components/PageHeader';
import connectNav from 'client/common/decorators/connect-nav';
import { formatMsg } from '../message.i18n';


const { Content } = Layout;
const { RangePicker } = DatePicker;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;


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
@connectNav({
  depth: 2,
  moduleName: 'bss',
})
export default class ReceivableInvoiceList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    searchInput: '',
  }
  componentWillReceiveProps(nextProps) {
    if (!nextProps.asnlist.loaded && !nextProps.asnlist.loading) {
      // this.handleListReload();
    }
  }
  msg = formatMsg(this.props.intl)
  columns = [{
    title: '发票号码',
    dataIndex: 'invoice_no',
    width: 150,
  }, {
    title: '关联账单编号',
    dataIndex: 'bill_no',
    width: 150,
  }, {
    title: '发票抬头',
    dataIndex: 'buyer',
    width: 250,
  }, {
    title: '发票类型',
    dataIndex: 'invoice_type',
    width: 200,
  }, {
    title: '状态',
    dataIndex: 'status',
    width: 100,
  }, {
    title: '开票金额',
    dataIndex: 'amount',
    width: 150,
  }, {
    title: '税率',
    width: 100,
    dataIndex: 'tax_rate',
    className: 'cell-align-right',
  }, {
    title: '税金',
    dataIndex: 'tax_amount',
    width: 150,
  }, {
    title: '价税金额',
    dataIndex: 'total_amount',
    width: 150,
  }, {
    title: '收款金额',
    dataIndex: 'payment_rec_amount',
    width: 150,
  }, {
    title: '备注',
    dataIndex: 'remark',
  }, {
    title: '开票申请人',
    dataIndex: 'applied_by',
    width: 150,
  }, {
    title: '申请日期',
    dataIndex: 'applied_date',
    width: 100,
    className: 'cell-align-right',
  }, {
    title: '开票人',
    dataIndex: 'invoiced_by',
    width: 100,
    className: 'cell-align-right',
  }, {
    title: '开票日期',
    dataIndex: 'invoiced_date',
    width: 100,
    render: date => date && moment(date).format('MM.DD HH:mm'),
  }, {
    title: '操作',
    dataIndex: 'OPS_COL',
    width: 150,
    fixed: 'right',
    render: (o, record) => {
      if (record.status === 0) {
        return (<span><RowAction onClick={this.handleReceive} label="入库操作" row={record} /> </span>);
      } else {
        return (<span><RowAction onClick={this.handleDetail} label="开票确认" row={record} /> </span>);
      }
    },
  }]
  handleStatusChange = (ev) => {
    const filters = { ...this.props.filters, status: ev.target.value };
    const whseCode = this.props.defaultWhse.code;
    this.props.loadAsnLists({
      whseCode,
      tenantId: this.props.tenantId,
      pageSize: this.props.asnlist.pageSize,
      current: this.props.asnlist.current,
      filters,
    });
    this.setState({
      selectedRowKeys: [],
    });
  }
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
    const link = `/bss/receivable/bill/${row.order_rel_no}`;
    this.context.router.push(link);
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  render() {
    const { loading } = this.props;
    const mockData = [{
      order_rel_no: '1',
      name: '胡彦斌',
      age: 32,
      address: '西湖区湖底公园1号',
    }, {
      order_rel_no: '2',
      name: '胡彦祖',
      age: 42,
      address: '西湖区湖底公园1号',
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
    const toolbarActions = (<span>
      <SearchBar placeholder={this.msg('asnPlaceholder')} onInputSearch={this.handleSearch} />
      <Select showSearch placeholder="结算对象" optionFilterProp="children" style={{ width: 160 }}
        dropdownMatchSelectWidth={false} dropdownStyle={{ width: 360 }}
      />
      <RangePicker
        ranges={{ Today: [moment(), moment()], 'This Month': [moment().startOf('month'), moment()] }}
        onChange={this.handleDateRangeChange}
      />
    </span>);
    const totCol = (
      <Summary>
        <Summary.Item label="开票金额合计">{10000}</Summary.Item>
        <Summary.Item label="税金合计">{6666}</Summary.Item>
        <Summary.Item label="价税金额合计">{3334}</Summary.Item>
      </Summary>
    );
    return (
      <QueueAnim type={['bottom', 'up']}>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('receivable')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.msg('receivableInvoice')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Nav>
            <RadioGroup onChange={this.handleStatusChange} >
              <RadioButton value="all">全部</RadioButton>
              <RadioButton value="pending">开票申请</RadioButton>
              <RadioButton value="invoiced">已开票</RadioButton>
              <RadioButton value="writtenOff">已核销</RadioButton>
            </RadioGroup>
          </PageHeader.Nav>
          <PageHeader.Actions>
            <Button type="primary" icon="plus" onClick={this.handleCreateASN}>
              {this.msg('申请开票')}
            </Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content" key="main">
          <DataTable toolbarActions={toolbarActions}
            selectedRowKeys={this.state.selectedRowKeys} handleDeselectRows={this.handleDeselectRows}
            columns={this.columns} dataSource={mockData} rowSelection={rowSelection} rowKey="id" loading={loading}
            total={totCol}
          />
        </Content>
      </QueueAnim>
    );
  }
}
