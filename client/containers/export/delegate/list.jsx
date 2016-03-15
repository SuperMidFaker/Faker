import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { loaddelegate, deldelegate, switchTenant, switchStatus, loadStatus }
 from '../../../../universal/redux/reducers/delegate';
import { Table, Button, message } from 'ant-ui';
import NavLink from '../../../../reusable/components/nav-link';
import SearchBar from '../../../../reusable/components/search-bar';
import connectFetch from '../../../../reusable/decorators/connect-fetch';
import { isLoaded } from '../../../../reusable/common/redux-actions';
import { DELEGATE_STATUS } from '../../../../universal/constants';
const ButtonGroup = Button.Group;

function fetchData({state, dispatch, cookie}) {
  const promises = [];
  if (!isLoaded(state, 'delegate')) {
     let p = dispatch(loaddelegate(cookie, {
      tenantId: state.account.tenantId,
      pageSize: state.delegate.delegateist.pageSize,
      currentPage: state.delegate.delegateist.current
    }));
    promises.push(p);
    p = dispatch(loadStatus(cookie, {tenantId: state.account.tenantId}));
    promises.push(p);
  }
  // 分别加载当前用户所有的租户列表和该用户所在租户下用户列表
  // 返回多个promise结果
  return Promise.all(promises);
}
@connectFetch()(fetchData)
@connect(
  state => ({
    tenantId: state.account.tenantId,
    delegateist: state.delegate.delegateist,
    branches: state.delegate.branches,
    tenant: state.delegate.tenant,
    loading: state.delegate.loading,
    customsBrokerList: state.delegate.customsBrokerList,
    statusList: state.delegate.statusList
  }),
  { deldelegate, switchTenant, switchStatus, loaddelegate, loadStatus })
export default class delegateSetting extends React.Component {
  static propTypes = {
    loading: PropTypes.bool.isRequired,
    statusList: PropTypes.object.isRequired,
    customsBrokerList: PropTypes.array.isRequired,
    delegateist: PropTypes.object.isRequired,
    branches: PropTypes.array.isRequired,
    formData: PropTypes.object.isRequired,
    tenant: PropTypes.object.isRequired,
    loaddelegate: PropTypes.func.isRequired,
    switchTenant: PropTypes.func.isRequired,
    switchStatus: PropTypes.func.isRequired,
    deldelegate: PropTypes.func.isRequired,
    tenantId: PropTypes.number.isRequired,
    loadStatus: PropTypes.func.isRequired
  }
  static contextTypes = {
    router: React.PropTypes.object.isRequired
  }
  constructor(props) {
    super(props);
    this.state = { // 设置默认视图状态
      showForm: false,
      statusAll: 'ghost',
      statusNotSend: 'primary',
      statusNotAccept: 'ghost',
      statusAccept: 'ghost',
      statusInvalid: 'ghost',
      curStatus: 0,
      searchVal: ''
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
    this.context.router.push({ pathname: to, query });
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
  handleChangeStatus(type, status) {
    // 更新视图状态
    this.setState({
      statusAll: type === 'statusAll'
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
      curStatus: status
    });
    const filters = this.createFilters(this.state.searchVal);
    this.props.loaddelegate(null, {
      tenantId: this.props.tenantId,
      pageSize: this.props.delegateist.pageSize,
      currentPage: 1,
      currentStatus: status,
      filters: JSON.stringify(filters)
    });
  }
   handleSearch(value) {
    this.setState({searchVal: value});
    const filters = this.createFilters(value);
    this.props.loaddelegate(null, {
      tenantId: this.props.tenantId,
      pageSize: this.props.delegateist.pageSize,
      currentPage: 1,
      currentStatus: this.state.curStatus,
      filters: JSON.stringify(filters)
    });

    this.props.loadStatus(null, {
      tenantId: this.props.tenantId,
      filters: JSON.stringify(filters)
    });
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
    renderColumnText(status, text) {
    let style = {};
    if (status === DELEGATE_STATUS.blocked.id) {
      style = {color: '#CCC'};
    }
    return <span style={style}>{text}</span>;
  }
  render() {
       const {
       customsBrokerList,
       statusList: {
        notSendCount,
        notAcceptCount,
        acceptCount,
        invalidCount
      },
       delegateist, loading
    } = this.props;
    const {
      statusAll,
      statusAccept,
      statusInvalid,
      statusNotAccept,
      statusNotSend,
      curStatus
    } = this.state;
 const dataSource = new Table.DataSource({
      fetcher: (params) => this.props.loaddelegate(null, params),
      resolve: (result) => result.data,
      extraParams: {
        tenantId: this.props.tenantId
      },
      getPagination: (result, currentResolve) => ({
        total: result.totalCount,
        current: currentResolve(result.totalCount, result.current, result.pageSize),
        showSizeChanger: true,
        showQuickJumper: false,
        pageSize: result.pageSize
      }),
      getParams: (pagination, filters, sorter) => {
        const params = {
          pageSize: pagination.pageSize,
          currentPage: pagination.current,
          sortField: sorter.field,
          sortOrder: sorter.order,
          curStatus,
          filters: []
        };
        for (const key in filters) {
          if (filters[key]) {
            params.filters.push({name: key, value: `'${filters[key].join("','")}'`});
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
    const filterArray = [];
    customsBrokerList.map(item => {
      filterArray.push({text: item.rec_tenant_id, value: `${item.key}`});
    });
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
        title: '状态',
        dataIndex: 'status',
        sorter: true,
        render: (text, record) => { // 根据状态定制显示状态中文描述
          let fontColor = '';
          let statusText = '';
          switch (record.status) {
            case 0:
              statusText = '未发送';
              fontColor = '#FFD700';
              break;
            case 1:
              statusText = '未受理';
              fontColor = '#FF7F00';
              break;
            case 2:
              statusText = '已接单';
              fontColor = '#00CD00';
              break;
            case 3:
              statusText = '已作废';
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
        render: (text, record) => { // 根据状态定制按钮显示
          switch (record.status) {
            case 0:
              return (
                <span>
                  <NavLink to={`/export/delegate/edit/${record.key}`}>修改</NavLink>
                  <span className="ant-divider"/>
                  <NavLink to={`/import/delegate/exportsend/${record.del_no}`}>发送</NavLink>
                </span>
              );
            case 1:
              return (
                <span>
                  <a href="#" className="ant-dropdown-link">查看</a>
                  <span className="ant-divider"/>
                  <a href="#" className="ant-dropdown-link">撤回</a>
                </span>
              );
            case 2:
              return (
                <span>
                  <a href="#" className="ant-dropdown-link">变更</a>
                </span>
              );
            case 3:
              return (
                <span>
                  <a href="#" className="ant-dropdown-link">查看</a>
                  <span className="ant-divider"/>
                  <a role="button" onClick={() => this.handleIdRemove(record.key)}>删除</a>
                </span>
              );
            default:
              return (<span/>);
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
            <ButtonGroup>
            <Button type={statusAll} size="large" onClick={() => this.handleChangeStatus('statusAll', -1)}>
              <span>所有状态</span>
            </Button>
            <Button type={statusNotSend} size="large" onClick={() => this.handleChangeStatus('statusNotSend', 0)}>
              <span>未发送 ({notSendCount})</span>
            </Button>
            <Button type={statusNotAccept} size="large" onClick={() => this.handleChangeStatus('statusNotAccept', 1)}>
              <span>未受理 ({notAcceptCount})</span>
            </Button>
            <Button type={statusAccept} size="large" onClick={() => this.handleChangeStatus('statusAccept', 2)}>
              <span>已接单 ({acceptCount})</span>
            </Button>
            <Button type={statusInvalid} size="large" onClick={() => this.handleChangeStatus('statusInvalid', 3)}>
              <span>已作废 ({invalidCount})</span>
            </Button>
          </ButtonGroup>
          </div>
          <div className="panel-body body-responsive">
            <Table rowSelection={rowSelection} columns={columns} loading={loading} dataSource={dataSource}/>
          </div>
        </div>
      </div>
    );
  }
}
