import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Radio, Button, Popconfirm, message } from 'antd';
import Table from 'client/components/remoteAntTable';
import moment from 'moment';
import NavLink from 'client/components/nav-link';
import { TENANT_ASPECT, DELG_SOURCE } from 'common/constants';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { setNavTitle } from 'common/reducers/navbar';
import { loadAcceptanceTable, acceptDelg, delDelg } from 'common/reducers/cmsDelegation';

const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

function fetchData({ state, dispatch, cookie }) {
  return dispatch(loadAcceptanceTable(cookie, {
    tenantId: state.account.tenantId,
    filter: JSON.stringify(state.cmsDelegation.listFilter),
    pageSize: state.cmsDelegation.delegationlist.pageSize,
    currentPage: state.cmsDelegation.delegationlist.current,
  }));
}

@connectFetch()(fetchData)
@connect(
  state => ({
    aspect: state.account.aspect,
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    delegationlist: state.cmsDelegation.delegationlist,
    listFilter: state.cmsDelegation.listFilter,
  }),
  { loadAcceptanceTable, acceptDelg, delDelg }
)
@connectNav((props, dispatch, router, lifecycle) => {
  if (lifecycle !== 'componentWillReceiveProps') {
    return;
  }
  dispatch(setNavTitle({
    depth: 2,
    text: '受理',
    moduleName: props.type,
    withModuleLayout: false,
    goBackFn: null,
  }));
})
export default class AcceptanceList extends Component {
  static propTypes = {
    type: PropTypes.oneOf(['import', 'export']),
    aspect: PropTypes.number.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    delegationlist: PropTypes.object.isRequired,
    listFilter: PropTypes.object.isRequired,
    loadAcceptanceTable: PropTypes.func.isRequired,
    acceptDelg: PropTypes.func.isRequired,
    delDelg: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
  }
  columns = [{
    title: '报关委托号',
    dataIndex: 'delg_no',
  }, {
    title: '委托客户',
    dataIndex: 'customer_name',
  }, {
    title: '委托日期',
    dataIndex: 'delg_time',
    render: (o, record) => moment(record.delg_time).format('YYYY.MM.DD'),
  }, {
    title: '合同号',
    dataIndex: 'contract_no',
  }, {
    title: '提运单号',
    dataIndex: 'bl_wb_no',
  }, {
    title: '发票号',
    dataIndex: 'invoice_no',
  }, {
    title: '航名航次',
    dataIndex: 'voyage_no',
  }, {
    title: '企业内部编号',
    render: (o, record) => (
      this.props.aspect === TENANT_ASPECT.BO ? record.ref_delg_external_no
      : record.ref_recv_external_no
    ),
  }, {
    title: '件数',
    dataIndex: 'pieces',
  }, {
    title: '来源',
    dataIndex: 'source',
    render: (o, record) => (
      record.source === DELG_SOURCE.consigned ? '委托' : '分包'
    ),
  }]
  dataSource = new Table.DataSource({
    fetcher: params => this.props.loadAcceptanceTable(null, params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize,
    }),
    getParams: (pagination, filters, sorter) => {
      const params = {
        tenantId: this.props.tenantId,
        pageSize: pagination.pageSize,
        currentPage: pagination.current,
      };
      const filter = { ...this.props.listFilter, sortField: sorter.field, sortOrder: sorter.order };
      params.filter = JSON.stringify(filter);
      return params;
    },
    remotes: this.props.delegationlist,
  })
  handleCreateBtnClick = () => {
    this.context.router.push(`/${this.props.type}/accept/create`);
  }
  handleRadioChange = (ev) => {
    if (ev.target.value === this.props.listFilter.status) {
      return;
    }
    const filter = JSON.stringify({ ...this.props.listFilter, status: ev.target.value });
    const { tenantId, delegationlist } = this.props;
    this.props.loadAcceptanceTable(null, {
      tenantId,
      filter,
      pageSize: delegationlist.pageSize,
      currentPage: delegationlist.current,
    });
  }
  handleDelegationAccept = (dispId) => {
    const { tenantId, loginId, loginName, listFilter,
      delegationlist: { pageSize, current } } = this.props;
    this.props.acceptDelg(loginId, loginName, dispId).then(
      result => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          this.props.loadAcceptanceTable(null, {
            tenantId,
            filter: JSON.stringify(listFilter),
            pageSize,
            currentPage: current,
          });
        }
      }
    );
  }
  handleDelgDel = (delgNo) => {
    const { tenantId, listFilter, delegationlist: { pageSize, current } } = this.props;
    this.props.delDelg(delgNo).then(result => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        this.props.loadAcceptanceTable(null, {
          tenantId,
          filter: JSON.stringify(listFilter),
          pageSize,
          currentPage: current,
        });
      }
    });
  }
  render() {
    const { delegationlist, listFilter } = this.props;
    this.dataSource.remotes = delegationlist;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: selectedRowKeys => {
        this.setState({ selectedRowKeys });
      },
    };
    const columns = [...this.columns];
    if (listFilter.status === 'unaccepted') {
      columns.push({
        title: '操作',
        render: (o, record) => {
          return (
            <span>
              <a role="button" onClick={() => this.handleDelegationAccept(record.dispId)}>
              接单
              </a>
              <span className="ant-divider" />
              <NavLink to={`/${this.props.type}/accept/edit/${record.delg_no}`}>
              修改
              </NavLink>
              <span className="ant-divider" />
              <Popconfirm title="确定删除?" onConfirm={() => this.handleDelgDel(record.delg_no)}>
                <a role="button">删除</a>
              </Popconfirm>
            </span>
          );
        },
      });
    } else if (listFilter.status === 'accepted') {
      columns.push({
        title: '接单时间',
        dataIndex: 'acpt_time',
        render: (o, record) => moment(record.acpt_time).format('YYYY.MM.DD'),
      });
    }
    return (
      <div className="main-content">
        <div className="page-header">
          <div className="tools">
            <Button type="primary" size="large" onClick={this.handleCreateBtnClick}
              icon="plus-circle-o"
            >
            新建报关委托
            </Button>
          </div>
          <RadioGroup value={listFilter.status} size="large" onChange={this.handleRadioChange}>
            <RadioButton value="unaccepted">待接单</RadioButton>
            <RadioButton value="accepted">已接单</RadioButton>
          </RadioGroup>
        </div>
        <div className="page-body">
          <div className="panel-body table-panel">
            <Table columns={columns} dataSource={this.dataSource} rowSelection={rowSelection} />
          </div>
        </div>
      </div>
    );
  }
}
