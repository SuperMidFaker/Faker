import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {loadTracking, loadCustomsBrokers} from '../../../../universal/redux/reducers/importtracking';
import {isLoaded} from '../../../../reusable/common/redux-actions';
import connectFetch from '../../../../reusable/decorators/connect-fetch';
import SearchBar from '../../../../reusable/components/search-bar';
import {Table, Radio} from 'ant-ui';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

function fetchData({state, dispatch, cookie}) {
  const promises = [];
  if (!isLoaded(state, 'importtracking')) {
    let p = dispatch(loadTracking(cookie, {
      tenantId: state.account.tenantId,
      pageSize: state.importtracking.idlist.pageSize,
      currentPage: state.importtracking.idlist.current
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
  idlist: state.importtracking.idlist,
  customsBrokerList: state.importtracking.customsBrokerList,
  loading: state.importtracking.loading
}), {loadTracking})
export default class ImportTracking extends React.Component {
  static propTypes = { // 属性检测
    idlist: PropTypes.object.isRequired,
    customsBrokerList: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired,
    loadTracking: PropTypes.func.isRequired,
    tenantId: PropTypes.number.isRequired
  }
  static contextTypes = {
    router: React.PropTypes.object.isRequired
  }
  constructor(props) {
    super(props);
    this.state = { // 设置默认视图状态
      showForm: false,
      searchVal: ''
    };
  }
  handleIdReg() {
    this.setState({showForm: true});
  }

  handleSearch(value) {
    this.setState({searchVal: value});
    const filters = this.createFilters(value);
    this.props.loadTracking(null, {
      tenantId: this.props.tenantId,
      pageSize: this.props.idlist.pageSize,
      currentPage: 1,
      filters: JSON.stringify(filters)
    });
  }
  handleNavigationTo(to, query) {
    this.context.router.push({pathname: to, query});
  }

  createFilters(searchVal) { // 创建过滤
    return [
      [
        {
          name: 'del_no',
          value: searchVal
        }, {
          name: 'entry_id',
          value: searchVal
        }, {
          name: 'bill_no',
          value: searchVal
        }
      ]
    ];
  }

  render() {
    const {customsBrokerList, idlist, loading} = this.props;
    const dataSource = new Table.DataSource({
      fetcher: (params) => this.props.loadTracking(null, params),
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

    const filterArray = [];
    // branches.map(br => <Select.Option key={br.key} value={`${br.key}`}>{br.name}</Select.Option>)
    customsBrokerList.map(item => {
      filterArray.push({text: item.short_name, value: `${item.key}`});
    });
    const columns = [
      {
        title: '报关单号',
        dataIndex: 'entry_id',
        width: 120
      }, {
        title: '处理环节',
        dataIndex: 'process_name',
        width: 100
      }, {
        title: '处理时间',
        sorter: true,
        dataIndex: 'process_date',
        width: 100,
        filters: filterArray
      }, {
        title: '报关业务号',
        dataIndex: 'del_no',
        width: 120
      }, {
        title: '提运单号',
        dataIndex: 'bill_no',
        width: 150
      }, {
        title: '报关受理方',
        dataIndex: 'rec_tenant_name',
        width: 180
      }, {
        title: '报关委托方',
        dataIndex: 'send_tenant_name',
        width: 180
      }
    ];
    return (
      <div className="main-content">
        <div className="page-header fixed">
          <div className="tools">
            <SearchBar placeholder="报关单号/报关业务号/提运单号" onInputSearch={(val) => this.handleSearch(val)}/>
            <a className="hidden-xs" role="button">高级搜索</a>
          </div>
          <RadioGroup defaultValue="-1" size="large">
            <RadioButton value="-1">
              <span>所有处理环节</span>
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
