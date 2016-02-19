import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { submitDelegate, loadDelegates, updateId, delId, edit, cancelEdit, loadStatus, loadCustomsBrokers } from '../../../../universal/redux/reducers/importdelegate';
import { isLoaded } from '../../../../reusable/common/redux-actions';
import connectFetch from '../../../../reusable/decorators/connect-fetch';
import connectNav from '../../../../reusable/decorators/connect-nav';
import SearchBar from '../../../../reusable/components/search-bar';
import { Table, Button, message } from 'ant-ui';
import showWarningModal from '../../../../reusable/components/deletion-warning-modal';
import { resolveCurrentPageNumber } from '../../../../reusable/browser-util/react-ant';
import { setNavTitle } from '../../../../universal/redux/reducers/navbar';

const ButtonGroup = Button.Group;

function fetchData({ state, dispatch, cookie }) {
  const promises = [];
  if (!isLoaded(state, 'importdelegate')) {
   let p = dispatch(loadDelegates(cookie, {
    tenantId: state.account.tenantId,
    pageSize: state.importdelegate.idlist.pageSize,
    currentPage: state.importdelegate.idlist.current
   }));
   promises.push(p);

   p = dispatch(loadStatus(cookie, {
    tenantId: state.account.tenantId
   }));
   promises.push(p);
   p = dispatch(loadCustomsBrokers(cookie, state.account.tenantId));
   promises.push(p);
 }
 return Promise.all(promises);
}

@connectFetch()(fetchData)
@connect(
  state => ({// 从初始化state中加载数据
    tenantId: state.account.tenantId,
    idlist: state.importdelegate.idlist,
    statusList: state.importdelegate.statusList,
    customsBrokerList: state.importdelegate.customsBrokerList,
    loading: state.importdelegate.loading
  }),
  { updateId, delId, loadDelegates, submitDelegate, edit, cancelEdit, loadStatus }
)
@connectNav((props, dispatch) => {
  dispatch(setNavTitle({
    depth: 2,
    text: '进口报关委托',
    moduleName: 'import',
    withModuleLayout: true,
    goBackFn: ''
  }));
})
export default class ImportDelegate extends React.Component {
  static propTypes = {// 属性检测
    history: PropTypes.object.isRequired,
    idlist: PropTypes.object.isRequired,
    statusList:PropTypes.object.isRequired,
    customsBrokerList: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired,
    updateId: PropTypes.func.isRequired,
    delId: PropTypes.func.isRequired,
    edit: PropTypes.func.isRequired,
    cancelEdit: PropTypes.func.isRequired,
    loadDelegates: PropTypes.func.isRequired,
    loadStatus: PropTypes.func.isRequired,
    submitDelegate: PropTypes.func.isRequired,
    tenantId: PropTypes.number.isRequired
  }
  constructor(props) {
    super(props);
    this.state = {// 设置默认视图状态
      showForm: false,
      statusAll:'ghost',
      statusNotSend:'primary',
      statusNotAccept:'ghost',
      statusAccept:'ghost',
      statusInvalid:'ghost',
      currentStatus:0,
      searchVal:''
    };
  }
  handleIdReg() {
    this.setState({ showForm: true });
  }
  handleIdRemove(idKey) {// 删除
    const { tenantId, idlist: { totalCount, current, pageSize } } = this.props;
    showWarningModal({
      title: '请输入DELETE进行下一步操作',
      content: '删除的数据将无法找回',
      onOk: () => this.props.delId(idKey).then(result => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          this.props.loadDelegates(null, {
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
      statusAll: type === 'statusAll' ? 'primary' : 'ghost',
      statusNotSend: type === 'statusNotSend' ? 'primary' : 'ghost',
      statusNotAccept: type === 'statusNotAccept' ? 'primary' : 'ghost',
      statusAccept: type === 'statusAccept' ? 'primary' : 'ghost',
      statusInvalid: type === 'statusInvalid' ? 'primary' : 'ghost',
      currentStatus: status
    });

    const filters = this.createFilters(this.state.searchVal);
    // 切换状态后更新table数据
    this.props.loadDelegates(null, {
      tenantId: this.props.tenantId,
      pageSize: this.props.idlist.pageSize,
      currentPage: 1,
      currentStatus:status,
      filters: JSON.stringify(filters)
    });
    // 切换状态的时候同时更新状态数量
    //  this.props.loadStatus(null, {
    //   tenantId: this.props.tenantId,
    //   filters: JSON.stringify(filters)
    // });
  }
  handleSearch(searchVal) {
    this.setState({
      searchVal
    });

    const filters = this.createFilters(searchVal);

    this.props.loadDelegates(null, {
      tenantId: this.props.tenantId,
      pageSize: this.props.idlist.pageSize,
      currentPage: 1,
      currentStatus:this.state.currentStatus,
      filters: JSON.stringify(filters)
    });

    this.props.loadStatus(null, {
      tenantId: this.props.tenantId,
      filters: JSON.stringify(filters)
    });
  }
  handleNavigationTo(to, query) {
    this.props.history.pushState(null, to, query);
  }
  createFilters(searchVal) {// 创建过滤
    return [[{
      name: 'del_no',
      value: searchVal
    }, {
      name: 'bill_no',
      value: searchVal
    }, {
      name: 'invoice_no',
      value: searchVal
    }]];
  }
  renderColumnText(status, text) {
    let style = {};
    if (status === 3) {
      style = {color: '#CCC'};
    }
    return <span style={style}>{text}</span>;
  }

  render() {
    const { customsBrokerList, statusList: {notSendCount, notAcceptCount, acceptCount, invalidCount}, idlist, loading } = this.props;
    const { statusAll, statusAccept, statusInvalid, statusNotAccept, statusNotSend, currentStatus } = this.state;
    const dataSource = new Table.DataSource({
      fetcher: (params) => this.props.loadDelegates(null, params),
      resolve: (result) => result.data,
      extraParams: { tenantId: this.props.tenantId },
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
          currentStatus,
          filters: []
        };
        for (const key in filters) {
          if (filters[key]) {
            params.filters.push({
              name: key,
              value: `'${filters[key].join("','")}'`
            });
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
      onSelect: (/* record, selected, selectedRows */) => {
      },
      onSelectAll: (/* selected, selectedRows */) => {
      }
    };

    const filterArray = [];
    // branches.map(br => <Select.Option key={br.key} value={`${br.key}`}>{br.name}</Select.Option>)
    customsBrokerList.map(item => {
      filterArray.push({text: item.short_name, value: `${item.key}`});
    });

    const columns = [{
      title: '报关业务单号',
      dataIndex: 'del_no',
      render:(text, record) => this.renderColumnText(record.status, text)
    }, {
      title: '报关行',
      sorter: true,
      dataIndex: 'short_name',
      filters:filterArray,
      render:(text, record) => this.renderColumnText(record.status, text)
    }, {
      title: '委托时间',
      sorter: true,
      dataIndex: 'del_date',
      render:(text, record) => this.renderColumnText(record.status, text)
    }, {
      title: '接单时间',
      dataIndex: 'rec_del_date',
      render:(text, record) => this.renderColumnText(record.status, text)
    }, {
      title: '提单号',
      dataIndex: 'bill_no',
      render:(text, record) => this.renderColumnText(record.status, text)
    }, {
      title: '状态',
      dataIndex: 'status',
      sorter: true,
      render: (text, record) => {// 根据状态定制显示状态中文描述
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
        return (<span style={{color:fontColor}}>
          {statusText}
          </span>);
      }
    }, {
      title: '操作',
      width: 150,
      render: (text, record) => {// 根据状态定制按钮显示
       switch (record.status) {
        case 0:
          return (
            <span>
              <a href="#" className="ant-dropdown-link">修改</a>
              <span className="ant-divider" />
              <a href="#" className="ant-dropdown-link">发送</a>
            </span>);
        case 1:
          return (
            <span>
              <a href="#" className="ant-dropdown-link">查看</a>
              <span className="ant-divider" />
              <a href="#" className="ant-dropdown-link">撤回</a>
            </span>);
        case 2:
          return (
            <span>
              <a href="#" className="ant-dropdown-link">变更</a>
            </span>);
        case 3:
          return (
            <span>
              <a href="#" className="ant-dropdown-link">查看</a>
              <span className="ant-divider" />
              <a role="button" onClick={() => this.handleIdRemove(record.key)} >删除</a>
            </span>);
        default:
          return (<span />);
      }
    }
  }];
  return (
    <div className="main-content">
      <div className="page-header">
        <div className="tools">
          <SearchBar placeholder="业务单号/发票号/提单号" onInputSearch={(val) => this.handleSearch(val)} />
          <a className="hidden-xs" role="button">高级搜索</a>
        </div>
        <ButtonGroup>
          <Button type={statusAll} size="large" onClick={ () => this.handleChangeStatus('statusAll', -1) } >
            <span>所有状态</span>
          </Button>
          <Button type={statusNotSend} size="large" onClick={ () => this.handleChangeStatus('statusNotSend', 0) } >
            <span>未发送 ({notSendCount})</span>
          </Button>
          <Button type={statusNotAccept} size="large" onClick={ () => this.handleChangeStatus('statusNotAccept', 1) } >
            <span>未受理 ({notAcceptCount})</span>
          </Button>
          <Button type={statusAccept} size="large" onClick={ () => this.handleChangeStatus('statusAccept', 2) } >
            <span>已接单 ({acceptCount})</span>
          </Button>
          <Button type={statusInvalid} size="large" onClick={ () => this.handleChangeStatus('statusInvalid', 2) } >
            <span>已作废 ({invalidCount})</span>
          </Button>
        </ButtonGroup>
      </div>
      <div className="page-body">
        <div className="panel-header">
          <Button type="primary" onClick={() => this.handleNavigationTo('/import/delegate/new')}>
            <span>新增</span>
          </Button>
        </div>
        <div className="panel-body body-responsive">
          <Table rowSelection={rowSelection} columns={ columns } loading={ loading } dataSource={ dataSource }/>
        </div>
      </div>
    </div>
    );
}
}
