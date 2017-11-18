import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Breadcrumb, Button, DatePicker, Icon, Input, Layout, Select } from 'antd';
import DataTable from 'client/components/DataTable';
import QueueAnim from 'rc-queue-anim';
import RowUpdater from 'client/components/rowUpdater';
import PageHeader from 'client/components/PageHeader';
import connectNav from 'client/common/decorators/connect-nav';
import { formatMsg } from './message.i18n';


const { Content } = Layout;
const { RangePicker } = DatePicker;
const InputGroup = Input.Group;

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
  moduleName: 'corp',
})
export default class LogsList extends React.Component {
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
    title: '操作人员',
    dataIndex: 'actor',
    width: 150,
    fixed: 'left',
  }, {
    title: '行为',
    dataIndex: 'action',
    width: 150,
  }, {
    title: '对象',
    dataIndex: 'object',
    width: 150,
  }, {
    title: '内容',
    dataIndex: 'content',
  }, {
    title: '时间',
    dataIndex: 'act_date',
    width: 150,
    render: exprecdate => exprecdate && moment(exprecdate).format('YYYY.MM.DD'),
  }, {
    title: 'IP地址',
    width: 150,
    dataIndex: 'ip_address',
  }, {
    title: '终端',
    width: 150,
    dataIndex: 'terminal',
  }, {
    title: '操作',
    dataIndex: 'OPS_COL',
    width: 50,
    fixed: 'right',
    render: (o, record) => <RowUpdater onHit={this.handleDetail} label="详情" row={record} />,
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
    const link = `/bss/payable/bill/${row.order_rel_no}`;
    this.context.router.push(link);
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
      <Input prefix={<Icon type="user" />} style={{ width: 100 }} />
      <Select showSearch placeholder="行为" optionFilterProp="children" style={{ width: 100 }} />
      <InputGroup compact style={{ width: '260' }}>
        <Select showSearch placeholder="对象" optionFilterProp="children" style={{ width: '30%' }} />
        <Input style={{ width: '70%' }} />
      </InputGroup>
      <RangePicker
        ranges={{ Today: [moment(), moment()], 'This Month': [moment().startOf('month'), moment()] }}
        onChange={this.handleDateRangeChange}
      />
      <Button type="primary">查询</Button>
      <Button>重置</Button>
    </span>);
    return (
      <QueueAnim type={['bottom', 'up']}>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('logs')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Actions>
            <Button icon="file-excel">导出</Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content" key="main">
          <DataTable toolbarActions={toolbarActions}
            columns={this.columns} dataSource={mockData} rowKey="id" loading={loading}
          />
        </Content>
      </QueueAnim>
    );
  }
}
