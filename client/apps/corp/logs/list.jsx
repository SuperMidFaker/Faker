import React from 'react';
// import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Breadcrumb, Button, DatePicker, Icon, Input, Layout, Select } from 'antd';
import DataTable from 'client/components/DataTable';
import QueueAnim from 'rc-queue-anim';
import PageHeader from 'client/components/PageHeader';
import connectNav from 'client/common/decorators/connect-nav';
import { loadOperationLogs } from 'common/reducers/operationLog';
import { SAAS_OPLOG_BEHAVIORS, SCOF_BIZ_OBJECT_KEY } from 'common/constants';
import { formatMsg } from './message.i18n';

const Option = Select.Option;
const { Content } = Layout;
const { RangePicker } = DatePicker;
const InputGroup = Input.Group;
const initialFilter = {
  user: '',
  behavior: '',
  billno: '',
  bizobject: '',
  daterange: null,
};

@connectFetch()()
@injectIntl
@connect(
  state => ({
    userMembers: state.account.userMembers,
    logList: state.operationLog.logList,
  }),
  { loadOperationLogs }
)
@connectNav({
  depth: 2,
  moduleName: 'corp',
})
export default class LogsList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  state = {
    selectedRowKeys: [],
    searchFilter: initialFilter,
  }
  componentDidMount() {
    this.handleListload();
  }
  handleListload = (current, pageSize, filter) => {
    const { logList } = this.props;
    const { searchFilter } = this.state;
    this.props.loadOperationLogs({
      current: current || logList.current,
      pageSize: pageSize || logList.pageSize,
      filter: JSON.stringify(filter || searchFilter),
    });
  }
  msg = formatMsg(this.props.intl)
  columns = [{
    title: '操作人员',
    dataIndex: 'login_id',
    width: 150,
    fixed: 'left',
    render: (lid) => {
      const user = this.props.userMembers.filter(usm => usm.login_id === lid)[0];
      return user && user.name;
    },
  }, {
    title: '行为',
    dataIndex: 'op_behavior',
    width: 100,
    render: beha => SAAS_OPLOG_BEHAVIORS[beha] && SAAS_OPLOG_BEHAVIORS[beha].text,
  }, {
    title: '业务编号',
    dataIndex: 'op_ref_billno',
    width: 200,
  }, {
    title: '内容',
    dataIndex: 'op_content',
  }, {
    title: '时间',
    dataIndex: 'created_date',
    width: 150,
    render: actdate => actdate && moment(actdate).format('YYYY.MM.DD'),
  }, {
    title: 'IP地址',
    width: 250,
    dataIndex: 'ip',
    render: (ip, row) => row.ip_region ? `${ip} ${row.ip_region}` : ip,
  }, {
    title: '终端',
    width: 250,
    dataIndex: 'browser',
    render: (brows, row) => brows && row.os ? `${brows} ${row.os}` : brows,
  }]

  handleSearch = () => {
    this.handleListload(1);
  }
  handleReset = () => {
    this.setState({ searchFilter: initialFilter });
  }
  handleFilterChange = (field, value) => {
    const searchFilter = { ...this.state.searchFilter };
    searchFilter[field] = value;
    this.setState({ searchFilter });
  }
  render() {
    const { logList, userMembers } = this.props;
    const { searchFilter } = this.state;
    const dataSource = new DataTable.DataSource({
      fetcher: params => this.handleListload(params.current, params.pageSize, params.filters),
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
        const newfilters = { ...this.state.srcFilter, ...tblfilters[0] };
        const params = {
          pageSize: pagination.pageSize,
          current: pagination.current,
          filters: newfilters,
        };
        return params;
      },
      remotes: logList,
    });
    const toolbarActions = (<span>
      <Icon type="user" />
      <Select value={searchFilter.user} style={{ width: 100 }} showArrow={false} showSearch
        onChange={value => this.handleFilterChange('user', value)} allowClear
      >
        {userMembers.map(usm => <Option key={String(usm.login_id)} value={String(usm.login_id)}>{usm.name}</Option>)}
      </Select>
      <Select showSearch placeholder="行为" style={{ width: 100 }} value={searchFilter.behavior}
        onChange={value => this.handleFilterChange('behavior', value)} allowClear
      >
        {Object.keys(SAAS_OPLOG_BEHAVIORS).map((beha) => {
          const behavior = SAAS_OPLOG_BEHAVIORS[beha];
          return <Option key={behavior.key} value={behavior.key}>{behavior.text}</Option>;
        })}
      </Select>
      <InputGroup compact style={{ width: 290 }}>
        <Select showSearch placeholder="业务对象" style={{ width: '30%' }} value={searchFilter.bizobject}
          onChange={value => this.handleFilterChange('bizobject', value)} allowClear
        >
          {Object.keys(SCOF_BIZ_OBJECT_KEY).map((bokey) => {
            const bizobj = SCOF_BIZ_OBJECT_KEY[bokey];
            return <Option key={bizobj.key} value={bizobj.key}>{bizobj.defaultText}</Option>;
          })}
        </Select>
        <Input style={{ width: '70%' }} placeholder="业务编号" value={searchFilter.billno}
          onChange={ev => this.handleFilterChange('billno', ev.target.value)}
        />
      </InputGroup>
      <RangePicker ranges={searchFilter.daterange} onChange={range => this.handleFilterChange('daterange', range)} />
      <Button type="primary" onClick={this.handleSearch}>查询</Button>
      <Button onClick={this.handleReset}>重置</Button>
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
            columns={this.columns} dataSource={dataSource} rowKey="id" loading={logList.loading}
          />
        </Content>
      </QueueAnim>
    );
  }
}
