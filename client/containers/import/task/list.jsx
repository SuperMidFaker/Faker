import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {loadTask} from
'../../../../universal/redux/reducers/task';
// import NavLink from '../../../../reusable/components/nav-link';
import SearchBar from '../../../../reusable/components/search-bar';
import {Table, Radio} from 'ant-ui';
import connectFetch from '../../../../reusable/decorators/connect-fetch';
import {isLoaded} from '../../../../reusable/common/redux-actions';
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

function fetchData({state, dispatch, cookie}) {
  if (!isLoaded(state, 'task')) {
    // 当前选择租户可能被删除,所以重新加载到主租户
    return dispatch(loadTask(cookie, {
      tenantId: state.account.tenantId,
      pageSize: state.task.tasklist.pageSize,
      loginId: state.account.loginId,
      currentPage: state.task.tasklist.current
    }));
  }
}
@connectFetch()(fetchData)
@connect(state => ({statusList: state.task.statusList, tasklist: state.task.tasklist, loading: state.task.loading, loginId: state.account.loginId, tenantId: state.account.tenantId}), {loadTask})
export default class TaskSetting extends React.Component {
  static propTypes = {
    loading: PropTypes.bool.isRequired,
    tasklist: PropTypes.object.isRequired,
    loadTask: PropTypes.func.isRequired,
    loginId: PropTypes.number.isRequired,
    tenantId: PropTypes.object.isRequired,
    statusList: PropTypes.object.isRequired
  }
  constructor(props) {
    super(props);
    this.state = { // 设置默认视图状态
      curStatus: -1,
      statusValue: '',
      searchVal: ''
    };
  }

  handleNavigationTo(to, query) {
    this.context.router.push({pathname: to, query});
  }
  handleChangeStatus(e) {
    const filters = this.createFilters(this.state.searchVal);
    // 切换状态后更新table数据
    this.props.loadTask(null, {
      tenantId: this.props.tenantId,
      loginId:this.props.loginId,
      pageSize: this.props.tasklist.pageSize,
      currentPage: 1,
      currentStatus: e.target.value,
      filters: JSON.stringify(filters)
    });
    this.setState({statusValue: e.target.value});
  }
  handleSearch(value) {
    this.setState({searchVal: value});
    const filters = this.createFilters(value);
    this.props.loadTask(null, {
      tenantId: this.props.tenantId,
      loginId:this.props.loginId,
      pageSize: this.props.tasklist.pageSize,
      currentPage: 1,
      currentStatus: this.state.curStatus,
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
    return <span>{text}</span>;
  }
  render() {
    const {
      statusList: {
        statusValue,
        notAcceptCount,
        haveOrderCount,
        closeOrderCount
      },
      tasklist,
      loading
    } = this.props;
    const {curStatus} = this.state;

    const dataSource = new Table.DataSource({
      fetcher: (params) => this.props.loadTask(null, params),
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
          loginId:this.props.loginId,
          tenantId: this.props.tenantId,
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
              statusText = '未受理';
              fontColor = '#FFD700';
              break;
            case 1:
              statusText = '已接单';
              fontColor = '#00CD00';
              break;
            case 2:
              statusText = '已结单';
              fontColor = '#FF7F00';
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
        width: 150
      }
    ];
    return (
      <div className="main-content">
        <div className="page-header">
          <div className="tools">
            <SearchBar placeholder="业务单号/发票号/提运单号" onInputSearch={(val) => this.handleSearch(val)}/>
            <a className="hidden-xs" role="button">高级搜索{statusValue}</a>
          </div>
          <RadioGroup defaultValue="0" size="large" value={statusValue} onChange={(e) => this.handleChangeStatus(e)}>
            <RadioButton value="-1">
              <span>所有</span>
            </RadioButton>
            <RadioButton value="0">
              <span>未受理 ({notAcceptCount})</span>
            </RadioButton>
            <RadioButton value="1">
              <span>已接单 ({haveOrderCount})</span>
            </RadioButton>
            <RadioButton value="2">
              <span>已结单 ({closeOrderCount})</span>
            </RadioButton>
          </RadioGroup>
        </div>
        <div className="page-body">
          <div className="panel-header"></div>
          <div className="panel-body body-responsive">
            <Table columns={columns} loading={loading} dataSource={dataSource}/>
          </div>
        </div>
      </div>
    );
  }
}
