import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {loadTask} from
'common/reducers/task';
import NavLink from 'client/components/nav-link';
import SearchBar from 'client/components/search-bar';
import {Table, Radio, Tag} from 'ant-ui';
import connectFetch from 'client/common/decorators/connect-fetch';
import {isLoaded} from 'client/common/redux-actions';
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

function fetchData({state, dispatch, cookie}) {
  if (!isLoaded(state, 'task')) {
    return dispatch(loadTask(cookie, {
      tenantId: state.account.tenantId,
      pageSize: state.task.tasklist.pageSize,
      loginId: state.account.loginId
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
    tenantId: PropTypes.number.isRequired,
    statusList: PropTypes.object.isRequired
  }
  constructor(props) {
    super(props);
    this.state = { // 设置默认视图状态
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
      loginId: this.props.loginId,
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
      loginId: this.props.loginId,
      pageSize: this.props.tasklist.pageSize,
      currentPage: 1,
      currentStatus: this.state.statusValue,
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
  renderColumnText(record, text) {
    switch (text) {
      case '报关单':
        return <Tag color="gray">{text}</Tag>;
      default:
        return <span>{text}</span>;
    }
    return <span>{text}</span>;
  }
  render() {
    const {
      statusList: {
        statusValue,
        haveOrderCount,
        closeOrderCount
      },
      tasklist,
      loading
    } = this.props;

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
          loginId: this.props.loginId,
          tenantId: this.props.tenantId,
          pageSize: pagination.pageSize,
          currentPage: pagination.current,
          sortField: sorter.field,
          sortOrder: sorter.order,
          currentStatus: statusValue,
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
        title: '平台单号',
        sorter: true,
        dataIndex: 'del_no',
        width: 120,
        render: (o, record) => this.renderColumnText(record, record.del_no)
      }, {
        title: '企业内部编号',
        sorter: true,
        dataIndex: 'external_no',
        width: 150,
        render: (o, record) => this.renderColumnText(record, record.external_no)
      }, {
        title: '委托方',
        dataIndex: 'short_name',
        width: 180,
        render: (o, record) => this.renderColumnText(record, record.short_name)
      }, {
        title: '提运单号',
        width: 150,
        render: (o, record) => this.renderColumnText(record, record.bill_no)
      }, {
        title: '发票号',
        width: 150,
        sorter: true,
        render: (o, record) => this.renderColumnText(record, record.invoice_no)
      }, {
        title: '接单日期',
        width: 100,
        render: (o, record) => this.renderColumnText(record, record.created_date)
      }, {
        title: '状态',
        width: 80,
        sorter: true,
        render: (text, record) => { // 根据状态定制显示状态中文描述
          let fontColor = '';
          let statusText = '';
          switch (record.status) {
            case 1:
              statusText = '委托中';
              fontColor = '#FF7F00';
              break;
            case 2:
              statusText = '受理中';
              fontColor = '#00CD00';
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
        width: 120,
        render: (text, record) => { // 根据状态定制显示状态中文描述
          let returnVal;
          if (record.bill_no !== undefined) {
            returnVal = (
              <span>
                <NavLink to={`/import/task/inputbill/${record.key}`}>查看报关清单</NavLink>
              </span>
            );
          } else {
            returnVal = (
              <span></span>
            );
          }
          return (returnVal);
        }
      }
    ];
    return (
      <div className="main-content">
        <div className="page-header fixed">
          <div className="tools">
            <SearchBar placeholder="平台单号/发票号/提运单号" onInputSearch={(val) => this.handleSearch(val)}/>
            <a className="hidden-xs" role="button">高级搜索</a>
          </div>
          <RadioGroup defaultValue="0" size="large" value={statusValue} onChange={(e) => this.handleChangeStatus(e)}>
            <RadioButton value="-1">
              <span>所有状态</span>
            </RadioButton>
            <RadioButton value="1">
              <span>委托中 ({haveOrderCount})</span>
            </RadioButton>
            <RadioButton value="2">
              <span>受理中 ({closeOrderCount})</span>
            </RadioButton>
          </RadioGroup>
        </div>
        <div className="page-body fixed">
          <div className="panel-min-header">&nbsp;</div>
          <div className="panel-body body-responsive">
            <Table useFixedHeader columns={columns} loading={loading} dataSource={dataSource}/>
          </div>
        </div>
      </div>
    );
  }
}
