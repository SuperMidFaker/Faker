import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {
  loadStatus,
  loadTask,
  loadTenantsByMaster,
  delTask,
  switchTenant,
  switchStatus
} from
'../../../../universal/redux/reducers/task';
import NavLink from '../../../../reusable/components/nav-link';
import SearchBar from '../../../../reusable/components/search-bar';
import {Table, Button, message} from 'ant-ui';
import connectFetch from '../../../../reusable/decorators/connect-fetch';
import {isLoaded} from '../../../../reusable/common/redux-actions';
import {ACCOUNT_STATUS, TENANT_ROLE} from '../../../../universal/constants';

function fetchData({state, dispatch, cookie}) {
  const promises = [];
  if (!isLoaded(state, 'task')) {
    let p = dispatch(loadTenantsByMaster(cookie, state.account.tenantId));
    promises.push(p);
    // 当前选择租户可能被删除,所以重新加载到主租户
    p = dispatch(loadTask(cookie, {
      tenantId: state.account.tenantId,
      pageSize: state.task.tasklist.pageSize,
      loginId: state.account.loginId,
      currentPage: state.task.tasklist.current
    }));
    promises.push(p);
    p = dispatch(loadStatus(cookie, {
      tenantId: state.account.tenantId,
      loginId: state.account.loginId
    }));
    promises.push(p);
  }
  // 分别加载当前用户所有的租户列表和该用户所在租户下用户列表
  // 返回多个promise结果
  return Promise.all(promises);
}
@connectFetch()(fetchData)
@connect(state => ({
  tasklist: state.task.tasklist,
  branches: state.task.branches,
  tenant: state.task.tenant,
  loading: state.task.loading,
  needUpdate: state.task.needUpdate,
  statusList: state.task.statusList,
  loginId: state.account.loginId,
  tenantId: state.account.tenantId
}), {delTask, switchTenant, switchStatus, loadTask})
export default class TaskSetting extends React.Component {
  static propTypes = {
    selectIndex: PropTypes.number,
    needUpdate: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
    tasklist: PropTypes.object.isRequired,
    branches: PropTypes.array.isRequired,
    tenant: PropTypes.object.isRequired,
    loadTask: PropTypes.func.isRequired,
    switchTenant: PropTypes.func.isRequired,
    switchStatus: PropTypes.func.isRequired,
    delTask: PropTypes.func.isRequired,
    loginId: PropTypes.number.isRequired,
    tenantId: PropTypes.object.isRequired,
    statusList: PropTypes.array.isRequired
  }
  static contextTypes = {
    router: React.PropTypes.object.isRequired
  }
  constructor() {
    super();
    this.state = {
      selectedRowKeys: [],
      statusAll: 'ghost',
      statusToMe: 'ghost',
      statusNotSend: 'primary',
      statusNotAccept: 'ghost',
      statusAccept: 'ghost',
      statusInvalid: 'ghost',
      currentStatus: 0,
      searchVal: ''
    };
  }
  handleSelectionClear() {
    this.setState({selectedRowKeys: []});
  }
  handleTenantSwitch(val) {
    const {tasklist} = this.props;
    this.props.loadTask(null, {
      tenantId: val,
      pageSize: tasklist.pageSize,
      loginId: this.props.loginId,
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
    this.context.router.push({ pathname: to, query });
  }
  handleStatusSwitch(task, index) {
    this.props.switchStatus(index, task.key, task.status === ACCOUNT_STATUS.normal.id
      ? ACCOUNT_STATUS.blocked.id
      : ACCOUNT_STATUS.normal.id).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
  }

  handleChangeStatus(type, status) {
    // 更新视图状态
    this.setState({
      statusAll: type === 'statusAll'
        ? 'primary'
        : 'ghost',
      statusToMe: type === 'statusToMe'
        ? 'primary'
        : 'ghost',
      statusNotSend: type === 'statusNotSend'
        ? 'primary'
        : 'ghost',
      statusNotAccept: type === 'statusNotAccept'
        ? 'primary'
        : 'ghost',
      statusAccept: type === 'statusAccept'
        ? 'primary'
        : 'ghost',
      statusInvalid: type === 'statusInvalid'
        ? 'primary'
        : 'ghost',
      currentStatus: status
    });

    const filters = this.createFilters(this.state.searchVal);
    // 切换状态后更新table数据
    this.props.loadTask(null, {
      tenantId: this.props.tenantId,
      pageSize: this.props.tasklist.pageSize,
      currentPage: 1,
      currentStatus: status,
      loginId: this.props.loginId,
      filters: JSON.stringify(filters)
    });
    // 切换状态的时候同时更新状态数量
    //  this.props.loadStatus(null, {
    //   tenantId: this.props.tenantId,
    //   filters: JSON.stringify(filters)
    // });
  }
  createFilters(searchVal) { // 创建过滤
    return [
      [
        {
          name: 'del_no',
          value: searchVal
        }, {
          name: 'bill_no',
          value: searchVal
        }, {
          name: 'invoice_no',
          value: searchVal
        }
      ]
    ];
  }

  handleTaskDel(record) {
    this.props.delTask(record.key, record.loginId, this.props.tenant);
  }
  handleSearch(searchVal) {
    this.setState({value: searchVal});
    // OR with name condition
    const filters = [
      [
        {
          name: 'del_no',
          value: searchVal
        }, {
          name: 'bill_no',
          value: searchVal
        }, {
          name: 'invoice_no',
          value: searchVal
        }
      ]
    ];
    this.props.loadTask(null, {
      tenantId: this.props.tenant.id,
      pageSize: this.props.tasklist.pageSize,
      currentPage: 1,
      filters: JSON.stringify(filters)
    });
  }
  renderColumnText(status, text) {
    let style = {};
    if (status === ACCOUNT_STATUS.blocked.id) {
      style = {
        color: '#CCC'
      };
    }
    return <span style={style}>{text}</span>;
  }
  render() {
    const {
      tenant,
      statusList: {
        toMeCount,
        notSendCount,
        notAcceptCount,
        acceptCount,
        invalidCount
      },
      tasklist,
      loading,
      needUpdate
    } = this.props;
    const dataSource = new Table.DataSource({
      fetcher: (params) => this.props.loadTask(null, params),
      resolve: (result) => result.data,
      needUpdate,
      getPagination: (result) => ({
        total: result.totalCount,
        // 删除完一页时返回上一页
        current: result.totalCount > 0 && (result.current - 1) * result.pageSize <= result.totalCount && result.current * result.pageSize > result.totalCount
          ? Math.ceil(result.totalCount / result.pageSize)
          : result.current,
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
            params.filters.push({name: key, value: filters[key][0]
            });
          }
        }
        params.filters = JSON.stringify(params.filters);
        return params;
      },
      remotes: tasklist
    });
    // const rowSelection = {
    // selectedRowKeys: this.state.selectedRowKeys,
    // onChange: (selectedRowKeys) => {
    // this.setState({selectedRowKeys});
    // }
    // };
    const columns = [
      {
        title: '业务单号',
        dataIndex: 'del_no',
        sorter: true,
        render: (o, record) => this.renderColumnText(record.status, record.del_no)
      }, {
        title: '客户名称',
        render: (o, record) => this.renderColumnText(record.status, record.send_tenant_id)
      }, {
        title: '运单号',
        render: (o, record) => this.renderColumnText(record.status, record.bill_no)
      }, {
        title: '发票号',
        dataIndex: 'invoice_no',
        sorter: true,
        render: (o, record) => this.renderColumnText(record.status, record.invoice_no)
      }, {
        title: '操作人',
        render: (o, record) => this.renderColumnText(record.status, record.creater_login_id)
      }, {
        title: '接单日期',
        render: (o, record) => this.renderColumnText(record.status, record.del_date)
      }, {
        title: '申报日期',
        render: (o, record) => this.renderColumnText(record.status, record.rec_del_date)
      }, {
        title: '状态',
        dataIndex: 'customs_status',
        sorter: true,

        render: (text, record) => { // 根据状态定制显示状态中文描述
          let fontColor = '';
          let statusText = '';
          switch (record.customs_status) {
            case 0:
              statusText = '未申报';
              fontColor = '#FFD700';
              break;
            case 1:
              statusText = '已申报';
              fontColor = '#FF7F00';
              break;
            case 2:
              statusText = '已放行';
              fontColor = '#00CD00';
              break;
            case 3:
              statusText = '结汇中';
              fontColor = '#CCC';
              break;
            case 4:
              statusText = '结汇完成';
              fontColor = '#CCC';
              break;
            case 5:
              statusText = '已放行';
              fontColor = '#CCC';
              break;
            default:
              break;
          }
          return (
            <span style={{
              color: fontColor
            }}>
              {statusText}
            </span>
          );
        }
      }, {
        title: '操作',
        width: 150,
        render: (text, record, index) => {
          if (record.role === TENANT_ROLE.owner.name) {
            return (
              <span>
                <NavLink to={`/corp/task/edit/${record.key}`}>修改</NavLink>
              </span>
            );
          } else if (record.status === ACCOUNT_STATUS.normal.id) {
            return (
              <span>
                <NavLink to={`/corp/task/edit/${record.key}`}>修改</NavLink>
                <span className="ant-divider"></span>
                <a role="button" onClick={() => this.handleStatusSwitch(record, index)}>停用</a>
              </span>
            );
          } else if (record.status === ACCOUNT_STATUS.blocked.id) {
            return (
              <span>
                <a role="button" onClick={() => this.handleTaskDel(record)}>删除</a>
                <span className="ant-divider"></span>
                <a role="button" onClick={() => this.handleStatusSwitch(record, index)}>启用</a>
              </span>
            );
          } else {
            return <span/>;
          }
        }
      }
    ];
    return (
      <div className="main-content">
        <div className="page-header">
          <div className="pull-right action-btns">
            <SearchBar placeholder="业务单号/发票号/提运单号" onInputSearch={(val) => this.handleSearch(val)}/>
            <a role="button">高级搜索</a>
          </div>
          <h2>作业管理</h2>
        </div>
        <div className="page-body">
          <div className="panel-header">
            <Button type="ghost" style={{
              marginRight: 5
            }} onClick={() => this.handleChangeStatus('statusAll', -1)}>
              <span>全部</span>
            </Button>
            <Button type="ghost" style={{
              marginRight: 5
            }} onClick={() => this.handleChangeStatus('statusToMe', -1)}>
              <span>分配给我({toMeCount})</span>
            </Button>
            <Button type="ghost" style={{
              marginRight: 5
            }} onClick={() => this.handleChangeStatus('statusNotSend', 0)}>
              <span>未申报({notSendCount})</span>
            </Button>
            <Button type="ghost" style={{
              marginRight: 5
            }} onClick={() => this.handleChangeStatus('statusNotAccept', 1)}>
              <span>已申报({notAcceptCount})</span>
            </Button>
            <Button type="ghost" style={{
              marginRight: 5
            }} onClick={() => this.handleChangeStatus('statusAccept', 2)}>
              <span>已放行({acceptCount})</span>
            </Button>
            <Button type="ghost" style={{
              marginRight: 5
            }} onClick={() => this.handleChangeStatus('statusInvalid', 4)}>
              <span>已结单({invalidCount})</span>
            </Button>
            <div className="pull-right action-btns"></div>
          </div>
          <div className="panel-body body-responsive">
            <Table columns={columns} loading={loading} remoteData={tasklist} dataSource={dataSource}/>
          </div>
          <div className={`bottom-fixed-row ${this.state.selectedRowKeys.length === 0
            ? 'hide'
            : ''}`}>
            <Button size="large" onClick={() => this.handleSelectionClear()} className="pull-right">清除选择</Button>
          </div>
        </div>
      </div>
    );
  }
}
