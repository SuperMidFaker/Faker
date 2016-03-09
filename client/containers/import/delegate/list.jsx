import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import NavLink from '../../../../reusable/components/nav-link';
import {
  loadDelegates,
  updateId,
  delId,
  beginEdit,
  edit,
  cancelEdit,
  loadCustomsBrokers
} from '../../../../universal/redux/reducers/importdelegate';
import {isLoaded} from '../../../../reusable/common/redux-actions';
import connectFetch from '../../../../reusable/decorators/connect-fetch';
import SearchBar from '../../../../reusable/components/search-bar';
import {Table, Button, message, Radio, Tag} from 'ant-ui';
import showWarningModal from '../../../../reusable/components/deletion-warning-modal';
import {resolveCurrentPageNumber} from '../../../../reusable/browser-util/react-ant';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

function fetchData({state, dispatch, cookie}) {
  const promises = [];
  if (!isLoaded(state, 'importdelegate')) {
    let p = dispatch(loadDelegates(cookie, {
      tenantId: state.account.tenantId,
      pageSize: state.importdelegate.idlist.pageSize,
      currentPage: state.importdelegate.idlist.current
    }));
    promises.push(p);
    p = dispatch(loadCustomsBrokers(cookie, state.account.tenantId));
    promises.push(p);
  }
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@connect(state => ({ // 从初始化state中加载数据
  tenantId: state.account.tenantId,
  idlist: state.importdelegate.idlist,
  sendlist: state.importdelegate.sendlist,
  statusList: state.importdelegate.statusList,
  customsBrokerList: state.importdelegate.customsBrokerList,
  needUpdate: state.importdelegate.needUpdate,
  formData: state.importdelegate.formData,
  loading: state.importdelegate.loading
}), {
  updateId,
  delId,
  loadDelegates,
  beginEdit,
  edit,
  cancelEdit
})
export default class ImportDelegate extends React.Component {
  static propTypes = { // 属性检测
    history: PropTypes.object.isRequired,
    idlist: PropTypes.object.isRequired,
    statusList: PropTypes.object.isRequired,
    customsBrokerList: PropTypes.array.isRequired,
    formData: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    updateId: PropTypes.func.isRequired,
    delId: PropTypes.func.isRequired,
    edit: PropTypes.func.isRequired,
    cancelEdit: PropTypes.func.isRequired,
    loadDelegates: PropTypes.func.isRequired,
    tenantId: PropTypes.number.isRequired,
    sendlist: PropTypes.object.isRequired
  }
  constructor(props) {
    super(props);
    this.state = { // 设置默认视图状态
      showForm: false,
      curStatus: 0,
      statusValue: '',
      searchVal: '',
      sendlist: [],
      buttonText: '撤回',
      sendStatus: 1
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
  handleChangeStatus(e) {
    const filters = this.createFilters(this.state.searchVal);
    // 切换状态后更新table数据
    this.props.loadDelegates(null, {
      tenantId: this.props.tenantId,
      pageSize: this.props.idlist.pageSize,
      currentPage: 1,
      currentStatus: e.target.value,
      filters: JSON.stringify(filters)
    });

    this.setState({statusValue: e.target.value});
  }

  handleSearch(value) {
    this.setState({searchVal: value});
    const filters = this.createFilters(value);
    this.props.loadDelegates(null, {
      tenantId: this.props.tenantId,
      pageSize: this.props.idlist.pageSize,
      currentPage: 1,
      currentStatus: this.state.curStatus,
      filters: JSON.stringify(filters)
    });
  }
  handleNavigationTo(to, query) {
    this.props.history.pushState(null, to, query);
  }
  handleSend(status, record) {
    this.props.sendlist.data = [];
    if (!record) {
      this.state.sendlist.map((item) => (this.props.sendlist.data.push(item)));
    } else {
      this.props.sendlist.data.push(record);
    }
    this.props.history.pushState(null, `/import/delegate/send/${status}`);
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
      return <NavLink to={`/import/delegate/edit/${record.key}`}>{text}</NavLink>;
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
      idlist,
      loading
    } = this.props;
    const {curStatus, buttonText} = this.state;
    const dataSource = new Table.DataSource({
      fetcher: (params) => this.props.loadDelegates(null, params),
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
          currentStatus: curStatus,
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
      // selectedRowKeys: this.state.selectedRowKeys,
      onSelect: (record, selected, selectedRows) => {
        this.handleSetSendList(selectedRows);
      },
      onSelectAll: (selected, selectedRows) => {
        this.handleSetSendList(selectedRows);
      }
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
        render: (text, record) => this.renderColumnText(record, text, true)
      }, {
        title: '报关行',
        sorter: true,
        dataIndex: 'short_name',
        filters: filterArray,
        render: (text, record) => this.renderColumnText(record, text)
      }, {
        title: '委托时间',
        sorter: true,
        dataIndex: 'del_date',
        render: (text, record) => this.renderColumnText(record, text)
      }, {
        title: '接单时间',
        dataIndex: 'rec_del_date',
        render: (text, record) => this.renderColumnText(record, text)
      }, {
        title: '提单号',
        dataIndex: 'bill_no',
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
                  <NavLink to={`/import/delegate/edit/${record.key}`}>修改</NavLink>
                  <span className="ant-divider"/>
                  <a role="button" onClick={() => this.handleSend(0, record)}>发送</a>
                </span>
              );
            case 1:
              return (
                <span>
                  <NavLink to={`/import/delegate/edit/${record.key}`}>查看</NavLink>
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
                  <NavLink to={`/import/delegate/edit/${record.key}`}>查看</NavLink>
                  <span className="ant-divider"/>
                  <a role="button" onClick={() => this.handleIdRemove(record.key)}>删除</a>
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
          <div className="tools">
            <SearchBar placeholder="业务单号/发票号/提单号" onInputSearch={(val) => this.handleSearch(val)}/>
            <a className="hidden-xs" role="button">高级搜索</a>
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
        <div className="page-body">
          <div className="panel-header">
            <Button type="primary" onClick={() => this.handleNavigationTo('/import/delegate/new')}>
              <span>新增</span>
            </Button>
          </div>
          <div className="panel-body body-responsive">
            <Table rowSelection={rowSelection} columns={columns} loading={loading} dataSource={dataSource}/>
          </div>
          <div className={`bottom-fixed-row ${this.state.sendlist.length === 0
            ? 'hide'
            : ''}`}>
            <Button size="large" type="primary" onClick={() => this.handleSend(this.state.sendStatus)}>{buttonText}</Button>
          </div>
        </div>
      </div>
    );
  }
}
