import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Button, Breadcrumb, Layout, Radio } from 'antd';
import DataTable from 'client/components/DataTable';
import QueueAnim from 'rc-queue-anim';
import SearchBar from 'client/components/SearchBar';
import RowUpdater from 'client/components/rowUpdater';
import Summary from 'client/components/Summary';
import TrimSpan from 'client/components/trimSpan';
import PageHeader from 'client/components/PageHeader';
import connectNav from 'client/common/decorators/connect-nav';
import { formatMsg } from '../message.i18n';


const { Content } = Layout;
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
export default class PaymentMadeList extends React.Component {
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
    title: '客户',
    width: 240,
    dataIndex: 'billing_party',
    render: o => <TrimSpan text={o} maxLen={16} />,
  }, {
    title: '账单类型',
    dataIndex: 'bill_type',
    width: 150,
  }, {
    title: '总单数',
    dataIndex: 'order_count',
    width: 100,
  }, {
    title: '账单总金额',
    dataIndex: 'bill_amount',
    width: 150,
  }, {
    title: '确认总金额',
    dataIndex: 'confirmed_amount',
    width: 150,
  }, {
    title: '状态',
    dataIndex: 'status',
    width: 150,
  }, {
    title: '对账确认时间',
    dataIndex: 'confirmed_date',
    width: 150,
    render: recdate => recdate && moment(recdate).format('MM.DD HH:mm'),
    sorter: (a, b) => new Date(a.received_date).getTime() - new Date(b.received_date).getTime(),
  }, {
    title: '对账人员',
    dataIndex: 'confirmed_by',
    width: 80,
  }, {
    title: '创建时间',
    dataIndex: 'created_date',
    width: 120,
    render: createdate => createdate && moment(createdate).format('MM.DD HH:mm'),
    sorter: (a, b) => new Date(a.created_date).getTime() - new Date(b.created_date).getTime(),
  }, {
    title: '创建人员',
    dataIndex: 'created_by',
    width: 80,
  }, {
    title: '操作',
    dataIndex: 'OPS_COL',
    width: 150,
    fixed: 'right',
    render: (o, record) => {
      if (record.status === 0) {
        return (<span><RowUpdater onHit={this.handleReceive} label="入库操作" row={record} /> </span>);
      } else {
        return (<span><RowUpdater onHit={this.handleDetail} label="账单详情" row={record} /> </span>);
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
    </span>);
    const totCol = (
      <Summary>
        <Summary.Item label="应收合计">{10000}</Summary.Item>
        <Summary.Item label="应付合计">{6666}</Summary.Item>
        <Summary.Item label="利润合计">{3334}</Summary.Item>
      </Summary>
    );
    return (
      <QueueAnim type={['bottom', 'up']}>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('payable')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.msg('paymentMade')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Nav>
            <RadioGroup onChange={this.handleStatusChange} >
              <RadioButton value="all">全部</RadioButton>
              <RadioButton value="pending">待结算</RadioButton>
              <RadioButton value="inbound">已入账单</RadioButton>
            </RadioGroup>
          </PageHeader.Nav>
          <PageHeader.Actions>
            <Button type="primary" icon="plus" onClick={this.handleCreateASN}>
              {this.msg('新建账单')}
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
