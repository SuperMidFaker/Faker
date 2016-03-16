import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { loaddelegate, deldelegate, switchTenant, switchStatus, loadStatus, loadCustomsBrokers }
 from '../../../../universal/redux/reducers/delegate';
import { Table, Button, message, Radio, Tag } from 'ant-ui';
import NavLink from '../../../../reusable/components/nav-link';
import SearchBar from '../../../../reusable/components/search-bar';
import connectFetch from '../../../../reusable/decorators/connect-fetch';
import { isLoaded } from '../../../../reusable/common/redux-actions';
import { DELEGATE_STATUS } from '../../../../universal/constants';
import {resolveCurrentPageNumber} from '../../../../reusable/browser-util/react-ant';
import showWarningModal from '../../../../reusable/components/deletion-warning-modal';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
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
    p = dispatch(loadCustomsBrokers(cookie, state.account.tenantId));
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
    sendlist: state.delegate.sendlist,
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
    sendlist: PropTypes.object.isRequired,
    loadStatus: PropTypes.func.isRequired
  }
  static contextTypes = {
    router: React.PropTypes.object.isRequired
  }
  constructor(props) {
    super(props);
    this.state = { // 设置默认视图状态
      showForm: false,
      curStatus: 0,
      statusValue: '',
      searchVal: '',
      sendlist: [],
      selectedRowKeys: []
    };
  }
  handleSelectionClear() {
    this.setState({selectedRowKeys: []});
  }
  handleIdRemove(idKey) { // 删除
    const {
      tenantId,
      delegateist: {
        totalCount,
        current,
        pageSize
      }
    } = this.props;
    showWarningModal({
      title: '请输入DELETE进行下一步操作',
      content: '删除的数据将无法找回',
      onOk: () => this.props.deldelegate(idKey).then(result => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          this.props.loaddelegate(null, {
            tenantId,
            pageSize,
            currentPage: resolveCurrentPageNumber(totalCount - 1, current, pageSize)
          });
        }
      }),
      confirmString: 'DELETE'
    });
  }
  handleSend(status, record) {
    this.props.sendlist.data = [];
    if (!record) {
      this.state.sendlist.map((item) => (this.props.sendlist.data.push(item)));
    } else {
      this.props.sendlist.data.push(record);
    }
    this.context.router.push(`/export/delegate/exportsend/${status}`);
  }
  handleSetSendList(selectedRows) {
    this.setState({sendlist: [], buttonText: '', sendStatus: 0});
    let allnosend = true;
    let allnoaccept = true;
    selectedRows.map((record) => {
      if (record.status !== 0) {
        allnosend = false;
      }
      if (record.status !== 1) {
        allnoaccept = false;
      }
    });

    if (allnosend === true) {
      this.setState({sendlist: selectedRows, buttonText: '发送', sendStatus: 0});
    }
    if (allnoaccept === true) {
      this.setState({sendlist: selectedRows, buttonText: '撤回', sendStatus: 1});
    }
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
  handleChangeStatus(e) {
    const filters = this.createFilters(this.state.searchVal);
    // 切换状态后更新table数据
    this.props.loaddelegate(null, {
      tenantId: this.props.tenantId,
      pageSize: this.props.delegateist.pageSize,
      currentPage: 1,
      currentStatus: e.target.value,
      filters: JSON.stringify(filters)
    });

    this.setState({statusValue: e.target.value});
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
    renderColumnText(record, text, ishref = false) {
    let style = {};
    if (record.status === 3) {
      style = {
        color: '#CCC'
      };
    }
    if (ishref === true) {
      return <NavLink to={`/export/delegate/edit/${record.key}`}>{text}</NavLink>;
    } else {
      return <span style={style}>{text}</span>;
    }
  }
  render() {
       const {
       customsBrokerList,
       statusList: {
        statusValue,
        notSendCount,
        notAcceptCount,
        acceptCount,
        invalidCount
      },
       delegateist, loading
    } = this.props;
    const {curStatus} = this.state;
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
      // selectedRowKeys: this.state.selectedRowKeys,
      onSelect: (record, selected, selectedRows) => {
        this.handleSetSendList(selectedRows);
      },
      onSelectAll: (selected, selectedRows) => {
        this.handleSetSendList(selectedRows);
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
      render: (text, record) => this.renderColumnText(record, text, true)
    }, {
      title: '报关行',
      dataIndex: 'short_name',
      sorter: true,
      filters: filterArray,
      render: (text, record) => this.renderColumnText(record, text)
    }, {
      title: '委托时间',
      dataIndex: 'del_date',
      sorter: true,
      render: (text, record) => this.renderColumnText(record, text)
    }, {
      title: '运单号',
      dataIndex: 'bill_no',
      render: (text, record) => this.renderColumnText(record, text)
    }, {
      title: '发票号',
      dataIndex: 'invoice_no',
      render: (text, record) => this.renderColumnText(record, text)
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
          let noaccept = undefined;
          if (record.status === 0 && record.short_name) {
            noaccept = <Tag color="gray">已撤回</Tag>;
          }
          return (
            <div>
              <span style={{
                color: fontColor
              }}>
                {statusText}
              </span>
              {noaccept}
            </div>
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
                  <a role="button" onClick={() => this.handleSend(0, record)}>发送</a>
                </span>
              );
            case 1:
              return (
                <span>
                  <NavLink to={`/export/delegate/edit/${record.key}`}>查看</NavLink>
                  <span className="ant-divider"/>
                  <a role="button" onClick={() => this.handleSend(1, record)}>撤回</a>
                </span>
              );
            case 2:
              return (
                <span>
                  <NavLink to={`/import/delegate/edit/${record.key}`}>变更</NavLink>
                </span>
              );
            case 3:
              return (
                <span>
                  <NavLink to={`/export/delegate/edit/${record.key}`}>查看</NavLink>
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
            <RadioGroup defaultValue="0" size="large" value={statusValue} onChange={(e) => this.handleChangeStatus(e)}>
            <RadioButton value="-1">
              <span>所有状态</span>
            </RadioButton>
            <RadioButton value="0">
              <span>未发送 ({notSendCount})</span>
            </RadioButton>
            <RadioButton value="1">
              <span>未受理 ({notAcceptCount})</span>
            </RadioButton>
            <RadioButton value="2">
              <span>已接单 ({acceptCount})</span>
            </RadioButton>
            <RadioButton value="3">
              <span>已作废 ({invalidCount})</span>
            </RadioButton>
          </RadioGroup>
          </div>
          <div className="panel-body body-responsive">
            <Table rowSelection={rowSelection} columns={columns} loading={loading} dataSource={dataSource}/>
          </div>
        </div>
      </div>
    );
  }
}
