import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { loaddelegate, loadTenantsByMaster, deldelegate, switchTenant, switchStatus }
 from '../../../../universal/redux/reducers/delegate';
import { Table, Button, message } from 'ant-ui';
import NavLink from '../../../../reusable/components/nav-link';
import SearchBar from '../../../../reusable/components/search-bar';
import connectFetch from '../../../../reusable/decorators/connect-fetch';
import { isLoaded } from '../../../../reusable/common/redux-actions';
import { DELEGATE_STATUS, TENANT_ROLE } from '../../../../universal/constants';


function fetchData({state, dispatch, cookie}) {
  const promises = [];
  if (!isLoaded(state, 'delegate')) {
      let p = dispatch(loadTenantsByMaster(cookie, state.account.tenantId));
    promises.push(p);
      p = dispatch(loaddelegate(cookie, {
      tenantId: state.account.tenantId,
      pageSize: state.delegate.delegateist.pageSize,
      currentPage: state.delegate.delegateist.current
    }));
    promises.push(p);
  }
  // 分别加载当前用户所有的租户列表和该用户所在租户下用户列表
  // 返回多个promise结果
  return Promise.all(promises);
}
@connectFetch()(fetchData)
@connect(
  state => ({
    delegateist: state.delegate.delegateist,
    branches: state.delegate.branches,
    tenant: state.delegate.tenant,
    loading: state.delegate.loading
  }),
  { deldelegate, switchTenant, switchStatus, loaddelegate })
export default class delegateSetting extends React.Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
    selectIndex: PropTypes.number,
    loading: PropTypes.bool.isRequired,
    delegateist: PropTypes.object.isRequired,
    branches: PropTypes.array.isRequired,
    tenant: PropTypes.object.isRequired,
    loaddelegate: PropTypes.func.isRequired,
    switchTenant: PropTypes.func.isRequired,
    switchStatus: PropTypes.func.isRequired,
    deldelegate: PropTypes.func.isRequired
  }
  constructor() {
    super();
    this.state = {
      selectedRowKeys: []
    };
  }
  handleSelectionClear() {
    this.setState({selectedRowKeys: []});
  }
  handleTenantSwitch(val) {
    const {delegateist} = this.props;
    this.props.loaddelegate(null, {
      tenantId: val,
      pageSize: delegateist.pageSize,
      currentPage: 1
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        let tenant;
        this.props.branches.forEach(br => {
          if (`${br.key}` === val) {
            tenant = {
              id: br.key,
              parentId: br.parentId
            };
            return;
          }
        });
        this.props.switchTenant(tenant);
      }
    });
  }
  handleNavigationTo(to, query) {
    this.props.history.pushState(null, to, query);
  }
  handleStatusSwitch(delegate, index) {
    this.props.switchStatus(index, delegate.key, delegate.status === DELEGATE_STATUS.normal.id
      ? DELEGATE_STATUS.blocked.id : DELEGATE_STATUS.normal.id).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        }
      });
  }
  handledelegateDel(record) {
    this.props.deldelegate(record.key, record.loginId, this.props.tenant);
  }
  handleSearch(searchVal) {
    // OR with name condition
    const filters = [[{
      name: 'del_no',
      value: searchVal
    }, {
      name: 'invoice_no',
      value: searchVal
    }, {
      name: 'bill_no',
      value: searchVal
    }]];
    this.props.loaddelegate(null, {
      tenantId: this.props.tenant.id,
      pageSize: this.props.delegateist.pageSize,
      currentPage: 1,
      filters: JSON.stringify(filters)
    });
  }
  renderColumnText(status, text) {
    let style = {};
    if (status === DELEGATE_STATUS.blocked.id) {
      style = {color: '#CCC'};
    }
    return <span style={style}>{text}</span>;
  }
  render() {
    const { tenant, delegateist, loading } = this.props;
    const dataSource = new Table.DataSource({
      fetcher: (params) => this.props.loaddelegate(null, params),
      resolve: (result) => result.data,
      getPagination: (result) => ({
        total: result.totalCount,
        // 删除完一页时返回上一页
        current: result.totalCount > 0 && (result.current - 1) * result.pageSize <= result.totalCount
          && result.current * result.pageSize > result.totalCount ?
          Math.ceil(result.totalCount / result.pageSize) : result.current,
        showSizeChanger: true,
        showQuickJumper: false,
        pageSize: result.pageSize
      }),
      getParams: (pagination, filters, sorter) => {
        const params = {
          tenantId: tenant.id,
          pageSize: pagination.pageSize,
          currentPage: pagination.current,
          sortField: sorter.field,
          sortOrder: sorter.order,
          filters: []
        };
        for (const key in filters) {
          if (filters[key]) {
            params.filters.push({
              name: key,
              value: filters[key][0]
            });
          }
        }
        params.filters = JSON.stringify(params.filters);
        return params;
      },
      remotes: delegateist
    });
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({selectedRowKeys});
      }
    };
    const columns = [{
      title: '报关业务单号',
      dataIndex: 'del_no',
      sorter: true,
      render: (o, record) => this.renderColumnText(record.status, record.del_no)
    }, {
      title: '报关行',
      dataIndex: 'rec_tenant_id',
      sorter: true,
      render: (o, record) => this.renderColumnText(record.status, record.rec_tenant_id)
    }, {
      title: '委托时间',
      dataIndex: 'del_date',
      sorter: true,
      render: (o, record) => this.renderColumnText(record.status, record.del_date)
    }, {
      title: '运单号',
      dataIndex: 'bill_no',
      render: (o, record) => this.renderColumnText(record.status, record.bill_no)
    }, {
      title: '发票号',
      dataIndex: 'invoice_no',
      render: (o, record) => this.renderColumnText(record.status, record.invoice_no)
    }, {
      title: '是否使用手册',
      dataIndex: 'usebook',
      render: (o, record) => this.renderColumnText(record.status, record.usebook)
    }, {
      title: '状态',
      sorter: true,
      render: (o, record) => {
        let style = {color: '#51C23A'};
        let text = DELEGATE_STATUS.normal.text;
        if (record.status === DELEGATE_STATUS.blocked.id) {
          style = {color: '#CCC'};
          text = DELEGATE_STATUS.blocked.text;
        }
        return <span style={style}>{text}</span>;
      }
    }, {
      title: '操作',
      width: 150,
      render: (text, record, index) => {
        if (record.role === TENANT_ROLE.owner.name) {
          return (
            <span>
              <NavLink to={`/export/delegate/edit/${record.key}`}>修改</NavLink>
            </span>);
        } else if (record.status === DELEGATE_STATUS.normal.id) {
          return (
            <span>
              <NavLink to={`/export/delegate/edit/${record.key}`}>修改</NavLink>
              <span className="ant-divider"></span>
              <a role="button" onClick={() => this.handleStatusSwitch(record, index)}>停用</a>
            </span>);
        } else if (record.status === DELEGATE_STATUS.blocked.id) {
          return (
            <span>
              <a role="button" onClick={() => this.handledelegateDel(record)}>删除</a>
              <span className="ant-divider"></span>
              <a role="button" onClick={() => this.handleStatusSwitch(record, index)}>启用</a>
            </span>);
        } else {
          return <span />;
        }
      }
    }];
    return (
      <div className="main-content">
        <div className="page-header">
          <div className="pull-right action-btns">
            <SearchBar placeholder="业务单号/发票号/提运单号" onInputSearch={(val) => this.handleSearch(val)} />
            <a role="button">高级搜索</a>
          </div>
          <h2>业务委托</h2>
        </div>
        <div className="page-body">
          <div className="panel-header">
            <div className="pull-right action-btns">
              <Button type="primary" onClick={() => this.handleNavigationTo('/export/delegate/new')}>
                <span>添加</span>
              </Button>
            </div>
            <Button htmlType="SELECTALL" type="primary">全部</Button>&nbsp;
            <Button htmlType="UnsentUnsent" type="primary">未发送</Button>&nbsp;
            <Button htmlType="SELECTALL" type="primary">未受理</Button>&nbsp;
            <Button htmlType="SELECTALL" type="primary">已接单</Button>
          </div>
          <div className="panel-body body-responsive">
            <Table rowSelection={rowSelection} columns={columns} loading={loading} dataSource={dataSource}/>
          </div>
          <div className={`bottom-fixed-row ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
            <Button size="large" onClick={() => this.handleSelectionClear()} className="pull-right">清除选择</Button>
          </div>
        </div>
      </div>
    );
  }
}
