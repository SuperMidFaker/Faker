import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {
  submitAccept,
  loadAccept,
  updateId,
  delId,
  beginEdit,
  edit,
  cancelEdit,
  loadStatus,
  loadCustomsBrokers
} from '../../../../universal/redux/reducers/exportaccept';
import {isLoaded} from '../../../../reusable/common/redux-actions';
import connectFetch from '../../../../reusable/decorators/connect-fetch';
import SearchBar from '../../../../reusable/components/search-bar';
import {Table, Button, message} from 'ant-ui';
import showWarningModal from '../../../../reusable/components/deletion-warning-modal';
import {resolveCurrentPageNumber} from '../../../../reusable/browser-util/react-ant';

const ButtonGroup = Button.Group;

function fetchData({state, dispatch, cookie}) {
  const promises = [];
  if (!isLoaded(state, 'exportaccept')) {
    let p = dispatch(loadAccept(cookie, {
      tenantId: state.account.tenantId,
      pageSize: state.exportaccept.idlist.pageSize,
      currentPage: state.exportaccept.idlist.current
    }));
    promises.push(p);

    p = dispatch(loadStatus(cookie, {tenantId: state.account.tenantId}));
    promises.push(p);
    p = dispatch(loadCustomsBrokers(cookie, state.account.tenantId));
    promises.push(p);
  }
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@connect(state => ({ // 从初始化state中加载数据
  tenantId: state.account.tenantId,
  idlist: state.exportaccept.idlist,
  statusList: state.exportaccept.statusList,
  customsBrokerList: state.exportaccept.customsBrokerList,
  needUpdate: state.exportaccept.needUpdate,
  formData: state.exportaccept.formData,
  loading: state.exportaccept.loading
}), {
  updateId,
  delId,
  loadAccept,
  submitAccept,
  beginEdit,
  edit,
  cancelEdit,
  loadStatus
})
export default class ImportDelegate extends React.Component {
  static propTypes = { // 属性检测
    idlist: PropTypes.object.isRequired,
    statusList: PropTypes.object.isRequired,
    customsBrokerList: PropTypes.array.isRequired,
    formData: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    updateId: PropTypes.func.isRequired,
    delId: PropTypes.func.isRequired,
    edit: PropTypes.func.isRequired,
    cancelEdit: PropTypes.func.isRequired,
    loadAccept: PropTypes.func.isRequired,
    loadStatus: PropTypes.func.isRequired,
    submitAccept: PropTypes.func.isRequired,
    tenantId: PropTypes.number.isRequired
  }
  static contextTypes = {
    router: React.PropTypes.object.isRequired
  }
  constructor(props) {
    super(props);
    this.state = { // 设置默认视图状态
      showForm: false,
      statusAll: 'ghost',
      statusNotAccept: 'primary',
      statusAccept: 'ghost',
      statusInvalid: 'ghost',
      statusRevoke:'ghost',
      curStatus: 0,
      searchVal: ''
    };
  }
  handleIdReg() {
    this.setState({showForm: true});
  }
  handleIdRemove(idKey) { // 删除
    const {
      tenantId,
      idlist: {
        totalCount,
        current,
        pageSize
      }
    } = this.props;
    showWarningModal({
      title: '请输入DELETE进行下一步操作',
      content: '删除的数据将无法找回',
      onOk: () => this.props.delId(idKey).then(result => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          this.props.loadAccept(null, {
            tenantId,
            pageSize,
            currentPage: resolveCurrentPageNumber(totalCount - 1, current, pageSize)
          });
        }
      }),
      confirmString: 'DELETE'
    });
  }
  handleChangeStatus(type, status) {
    // 更新视图状态
    this.setState({
      statusAll: type === 'statusAll'
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
      statusRevoke: type === 'statusRevoke'
      ? 'primary'
      : 'ghost',
      curStatus: status
    });

    const filters = this.createFilters(this.state.searchVal);
    // 切换状态后更新table数据
    this.props.loadAccept(null, {
      tenantId: this.props.tenantId,
      pageSize: this.props.idlist.pageSize,
      currentPage: 1,
      currentStatus: status,
      filters: JSON.stringify(filters)
    });
    // 切换状态的时候同时更新状态数量
  }

  handleSearch(value) {
    this.setState({searchVal: value});
    const filters = this.createFilters(value);
    this.props.loadAccept(null, {
      tenantId: this.props.tenantId,
      pageSize: this.props.idlist.pageSize,
      currentPage: 1,
      currentStatus: this.state.curStatus,
      filters: JSON.stringify(filters)
    });

    this.props.loadStatus(null, {
      tenantId: this.props.tenantId,
      filters: JSON.stringify(filters)
    });
  }
  handleNavigationTo(to, query) {
    this.context.router.push({ pathname: to, query });
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
    if (status === 3) {
      style = {
        color: '#CCC'
      };
    }
    return <span style={style}>{text}</span>;
  }

  render() {
    const {
      customsBrokerList,
      statusList: {
        notAcceptCount,
        acceptCount,
        invalidCount,
        revokedCount
      },
      idlist,
      loading
    } = this.props;
    const {
      statusAll,
      statusAccept,
      statusInvalid,
      statusNotAccept,
      statusRevoke,
      curStatus
    } = this.state;
    const dataSource = new Table.DataSource({
      fetcher: (params) => this.props.loadAccept(null, params),
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
        // console.log('getParams 的参数是：', pagination, filters, sorter, '请求参数：', params);
        return params;
      },
      remotes: idlist
    });

    // 通过 rowSelection 对象表明需要行选择
    const rowSelection = {
      onSelect: (/* record, selected, selectedRows */) => {},
      onSelectAll: (/* selected, selectedRows */) => {}
    };

    const filterArray = [];
    // branches.map(br => <Select.Option key={br.key} value={`${br.key}`}>{br.name}</Select.Option>)
    customsBrokerList.map(item => {
      filterArray.push({text: item.short_name, value: `${item.key}`});
    });
    const columns = [
      {
        title: '报关业务单号',
        dataIndex: 'del_no',
        render: (text, record) => this.renderColumnText(record.status, text)
      }, {
        title: '客户名称',
        sorter: true,
        dataIndex: 'send_tenant_id',
        filters: filterArray,
        render: (text, record) => this.renderColumnText(record.status, text)
      }, {
        title: '委托时间',
        sorter: true,
        dataIndex: 'del_date',
        render: (text, record) => this.renderColumnText(record.status, text)
      }, {
        title: '接单时间',
        dataIndex: 'rec_del_date',
        render: (text, record) => this.renderColumnText(record.status, text)
      }, {
        title: '运单号',
        dataIndex: 'bill_no',
        render: (text, record) => this.renderColumnText(record.status, text)
      }, {
        title: '状态',
        dataIndex: 'status',
        sorter: true,
        render: (text, record) => { // 根据状态定制显示状态中文描述
          let fontColor = '';
          let statusText = '';
          switch (record.status) {
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
            case 4:
              statusText = '已撤回';
              fontColor = '#FFD700';
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
            case 1:
              return (
                <span>
                  <a href="#" className="ant-dropdown-link">查看</a>
                  <span className="ant-divider"/>
                  <a href="#" className="ant-dropdown-link">接单</a>
                </span>
              );
            case 2:
              return (
                <span>
                  <a href="#" className="ant-dropdown-link">查看</a>
                  <span className="ant-divider"/>
                  <a href="#" className="ant-dropdown-link">报关清单</a>
                </span>
              );
            case 3:
              return (
                <span>
                  <a href="#" className="ant-dropdown-link">查看</a>
                </span>
              );
              case 4:
              return (
                <span>
                  <a href="#" className="ant-dropdown-link">查看</a>
                </span>
              );
            default:
              return (<span/>);
          }
        }
      }
    ];
    return (
      <div className="main-content">
        <div className="page-header">
          <div className="pull-right action-btns">
            <SearchBar placeholder="业务单号/发票号/提运单号" onInputSearch={(val) => this.handleSearch(val)}/>
            <a className="hidden-xs" role="button">高级搜索</a>
          </div>
          <h2>业务委托</h2>
        </div>
        <div className="page-body">
          <div className="panel-header">
            <div className="pull-right action-btns">
              <Button type="primary" onClick={() => this.handleNavigationTo('/export/receive/new')}>
              <span>新增</span>
            </Button>
            </div>
          <ButtonGroup>
            <Button type={statusAll} size="large" onClick={() => this.handleChangeStatus('statusAll', -1)}>
              <span>全部</span>
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
            <Button type={statusRevoke} size="large" onClick={() => this.handleChangeStatus('statusRevoke', 4)}>
              <span>已撤回 ({revokedCount})</span>
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
