import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Table, Button, message } from 'ant-ui';
import moment from 'moment';
import { loadSents, cancel } from '../../../../universal/redux/reducers/invitation';
import connectFetch from '../../../../reusable/decorators/connect-fetch';
import connectNav from '../../../../reusable/decorators/connect-nav';
import { setNavTitle } from '../../../../universal/redux/reducers/navbar';

function fetchData({ state, dispatch, cookie }) {
  return dispatch(loadSents(cookie, {
    tenantId: state.account.tenantId,
    pageSize: state.invitation.receiveds.pageSize,
    currentPage: state.invitation.receiveds.current
  }));
}
@connectFetch()(fetchData)
@connectNav((props, dispatch) => {
  dispatch(setNavTitle({
    depth: 2,
    text: '发出的邀请',
    moduleName: 'corp',
    withModuleLayout: false,
    goBackFn: null
  }));
})
@connect(
  state => ({
    tenantId: state.account.tenantId,
    sentlist: state.invitation.sents
  }),
  { loadSents, cancel })
export default class SentView extends React.Component {
  static propTypes = {
    tenantId: PropTypes.number.isRequired,
    sentlist: PropTypes.object.isRequired,
    cancel: PropTypes.func.isRequired,
    loadSents: PropTypes.func.isRequired
  }
  state = {
    selectedRowKeys: []
  }
  dataSource = new Table.DataSource({
    fetcher: (params) => this.props.loadSents(null, params),
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
    remotes: this.props.sentlist
  })

  handleExpire(invKey, index) {
    this.props.cancel(invKey, index).then(result => {
      if (result.error) {
        message.error('取消邀请失败', 10);
      }
    });
  }
  columns = [{
    title: '合作伙伴',
    dataIndex: 'name'
  }, {
    title: '邀请对方成为',
    dataIndex: 'types',
    render: (o, record) => {
      let text;
      if (record.types.length === 1 && record.types[0].name === '客户') {
        text = record.types[0].name;
      } else {
        text = `${record.types.map(t => t.name).join('/')}服务商`;
      }
      return text;
    }
  }, {
    title: '发出日期',
    dataIndex: 'created_date',
    render: (o, record) => moment(record.createdDate).format('YYYY-MM-DD')
  }, {
    title: '状态',
    dataIndex: 'status',
    render: (o, record) => {
      let text = '待定';
      if (record.status === 1) {
        text = '已接受';
      } else if (record.status === 2) {
        text = '已拒绝';
      } else if (record.status === 3) {
        text = '已取消';
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
            <a role="button" onClick={() => this.handleExpire(record.key, index)}>取消</a>
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
    const { sentlist } = this.props;
    this.dataSource.remotes = sentlist;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({selectedRowKeys});
      }
    };
    return (
      <div className="main-content">
        <div className="page-body">
          <div className="panel-header" />
          <div className="panel-body body-responsive">
            <Table rowSelection={rowSelection} columns={this.columns} loading={sentlist.loading}
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
