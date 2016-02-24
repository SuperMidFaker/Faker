import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Table, Button, Input, message } from 'ant-ui';
import moment from 'moment';
import { loadReceiveds, change } from
'../../../../universal/redux/reducers/invitation';
import connectFetch from '../../../../reusable/decorators/connect-fetch';
import connectNav from '../../../../reusable/decorators/connect-nav';
import { setNavTitle } from '../../../../universal/redux/reducers/navbar';

function fetchData({ state, dispatch, cookie }) {
  if (!state.invitation.receiveds.loaded) {
    return dispatch(loadReceiveds(cookie, {
      tenantId: state.account.tenantId,
      pageSize: state.invitation.receiveds.pageSize,
      currentPage: state.invitation.receiveds.current
    }));
  }
}
@connectFetch()(fetchData)
@connectNav((props, dispatch) => {
  dispatch(setNavTitle({
    depth: 2,
    text: '收到的邀请',
    moduleName: 'corp',
    withModuleLayout: false,
    goBackFn: null
  }));
})
@connect(
  state => ({
    tenantId: state.account.tenantId,
    receivedlist: state.invitation.receiveds
  }),
  { change, loadReceiveds })
export default class ReceivedView extends React.Component {
  static propTypes = {
    tenantId: PropTypes.number.isRequired,
    receivedlist: PropTypes.object.isRequired,
    change: PropTypes.func.isRequired,
    loadReceiveds: PropTypes.func.isRequired
  }
  state = {
    selectedRowKeys: []
  }
  dataSource = new Table.DataSource({
    fetcher: (params) => this.props.loadReceiveds(null, params),
    resolve: (result) => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize
    }),
    getParams: (pagination, filters, sorter) => {
      const params = {
        tenantId: this.props.tenantId,
        pageSize: pagination.pageSize,
        currentPage: pagination.current,
        sortField: sorter.field,
        sortOrder: sorter.order,
        filters: []
      };
      for (const key in filters) {
        if (filters[key] && filters[key].length > 0) {
          params.filters.push({
            name: key,
            value: filters[key][0]
          });
        }
      }
      params.filters = JSON.stringify(params.filters);
      return params;
    },
    remotes: this.props.receivedlist
  })

  handleAccept(invKey, index) {
    this.props.change(invKey, 'accept', index).then(result => {
      if (result.error) {
        message.error('接受邀请失败', 10);
      }
    });
  }
  handleReject(invKey, index) {
    this.props.change(invKey, 'reject', index).then(result => {
      if (result.error) {
        message.error('拒绝邀请失败', 10);
      }
    });
  }
  columns = [{
    title: '合作伙伴',
    dataIndex: 'name'
  }, {
    title: '邀请你成为',
    dataIndex: 'types',
    render: (o, record) => `${record.types.map(t => t.name).join('/')}服务商`
  }, {
    title: '收到日期',
    dataIndex: 'created_date',
    render: (o, record) => moment(record.createdDate).format('YYYY-MM-DD')
  }, {
    title: '状态',
    dataIndex: 'status',
    render: (o, record) => {
      let text = '新邀请';
      if (record.status === 1) {
        text = '已接受';
      } else if (record.status === 2) {
        text = '已拒绝';
      }
      return text;
    }
  }, {
    title: '操作',
    width: 150,
    render: (text, record, index) => {
      if (record.status === 0) {
        return (
          <span>
            <a role="button" onClick={() => this.handleAccept(record.key, index)}>接受</a>
            <span className="ant-divider"></span>
            <a role="button" onClick={() => this.handleReject(record.key, index)}>拒绝</a>
          </span>
        );
      } else {
        return <span />;
      }
    }
  }]
  handleSelectionClear = () => {
    this.setState({selectedRowKeys: []});
  }
  render() {
    const { receivedlist } = this.props;
    this.dataSource.remotes = receivedlist;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({selectedRowKeys});
      }
    };
    return (
      <div className="main-content">
        <div className="page-body">
          <div className="panel-header">
            <div className="tools">
              <Button type="primary">接受</Button>
              <Button>拒绝</Button>
            </div>
            <div className="left-tools">
              <Input placeholder="输入邀请码" />
              <Button>提取</Button>
            </div>
          </div>
          <div className="panel-body body-responsive">
            <Table rowSelection={rowSelection} columns={this.columns} loading={receivedlist.loading}
              dataSource={this.dataSource}
            />
          </div>
          <div className={`bottom-fixed-row ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
            <Button size="large" onClick={this.handleSelectionClear} className="pull-right">
              清除选择
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
