import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Radio, Button, Popconfirm, message } from 'antd';
import Table from 'client/components/remoteAntTable';
import moment from 'moment';
import NavLink from 'client/components/nav-link';
import { TENANT_ASPECT } from 'common/constants';
import connectNav from 'client/common/decorators/connect-nav';
import { setNavTitle } from 'common/reducers/navbar';
import SearchBar from 'client/components/search-bar';
import SubdelgTable from './subdelgTable';
import { loadAcceptanceTable, loadSubdelgsTable, acceptDelg, delDelg, showPreviewer } from 'common/reducers/cmsDelegation';
// import PreviewPanel from 'common/modals/preview-panel';
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

@connect(
  state => ({
    aspect: state.account.aspect,
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    delegationlist: state.cmsDelegation.delegationlist,
    listFilter: state.cmsDelegation.listFilter,
    subdelgs: state.cmsDelegation.subdelgs,
  }),
  { loadAcceptanceTable, loadSubdelgsTable, acceptDelg, delDelg, showPreviewer }
)
@connectNav((props, dispatch, router, lifecycle) => {
  if (lifecycle !== 'componentWillReceiveProps') {
    return;
  }
  dispatch(setNavTitle({
    depth: 2,
    text: '进口',
    moduleName: props.ietype,
    withModuleLayout: false,
    goBackFn: null,
  }));
})
export default class AcceptanceList extends Component {
  static propTypes = {
    ietype: PropTypes.oneOf(['import', 'export']),
    aspect: PropTypes.number.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    delegationlist: PropTypes.object.isRequired,
    listFilter: PropTypes.object.isRequired,
    subdelgs: PropTypes.object.isRequired,
    loadAcceptanceTable: PropTypes.func.isRequired,
    loadSubdelgsTable: PropTypes.func.isRequired,
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
    title: '委托编号',
    dataIndex: 'delg_no',
    render: (o) => {
      return (
        <a onClick={() => this.props.showPreviewer({
          delgNo: o,
          tenantId: this.props.tenantId,
        }, this.props.listFilter.status)}>
          {o}
        </a>);
    },
  }, {
    title: '委托方',
    dataIndex: 'customer_name',
  }, {
    title: '客户订单号',
    dataIndex: 'order_no',
  }, {
    title: '客户发票号',
    dataIndex: 'invoice_no',
  }, {
    title: '外部编号',
    render: (o, record) => (
      this.props.aspect === TENANT_ASPECT.BO ? record.ref_delg_external_no
      : record.ref_recv_external_no
    ),
  }, {
    title: '运单号',
    dataIndex: 'shipping_no',
  }, {
    title: '提运单号',
    dataIndex: 'bl_wb_no',
  }, {
    title: '件数',
    dataIndex: 'pieces',
  }, {
    title: '毛重',
    dataIndex: 'weight',
  }, {
    title: '货物性质',
    dataIndex: 'goods_type',
  }, {
    title: '申报企业',
    dataIndex: 'ccb_name',
  }, {
    title: '状态',
    dataIndex: 'status',
  }, {
    title: '委托时间',
    dataIndex: 'delg_time',
    render: (o, record) => moment(record.delg_time).format('YYYY.MM.DD'),
  }]

  ccols = [{
    title: '子委托编号',
    dataIndex: 'bill_seq_no',
  }, {
    title: '报关方式',
    dataIndex: 'decl_way_code',
  }, {
    title: '备案编号',
    dataIndex: 'manual_no',
  }, {
    title: '统一编号',
    dataIndex: 'mawb_no',
  }, {
    title: '报关单号',
    dataIndex: 'ra_decl_no',
  }, {
    title: '件数',
    dataIndex: 'pack_count',
  }, {
    title: '毛重',
    dataIndex: 'gross_wt',
  }, {
    title: '回执状态',
    dataIndex: 'status',
  }, {
    title: '回执时间',
    dataIndex: 'delg_time',
    render: (o, record) => moment(record.delg_time).format('YYYY.MM.DD'),
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
        ietype: this.props.ietype,
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
    this.context.router.push(`/clearance/${this.props.ietype}/create`);
  }

  handleRadioChange = (ev) => {
    if (ev.target.value === this.props.listFilter.status) {
      return;
    }
    const filter = JSON.stringify({ ...this.props.listFilter, status: ev.target.value });
    const { ietype, tenantId, delegationlist } = this.props;
    this.props.loadAcceptanceTable(null, {
      ietype,
      tenantId,
      filter,
      pageSize: delegationlist.pageSize,
      currentPage: delegationlist.current,
    });
  }
  handleDelegationAccept = (dispId) => {
    const { tenantId, loginId, loginName, listFilter, ietype,
      delegationlist: { pageSize, current } } = this.props;
    this.props.acceptDelg(loginId, loginName, dispId).then(
      result => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          this.props.loadAcceptanceTable(null, {
            ietype,
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
    const { tenantId, listFilter, ietype, delegationlist: { pageSize, current } } = this.props;
    this.props.delDelg(delgNo).then(result => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        this.props.loadAcceptanceTable(null, {
          ietype,
          tenantId,
          filter: JSON.stringify(listFilter),
          pageSize,
          currentPage: current,
        });
      }
    });
  }

  handleSubdelgsList = (record) => {
    return (
      <SubdelgTable delgNo={record.delg_no} />
    );
  }

  render() {
    const { delegationlist, listFilter } = this.props;
    this.dataSource.remotes = delegationlist;
    const columns = [...this.columns];
    if (listFilter.status === 'accept') {
      columns.push({
        title: '操作',
        render: (o, record) => {
          return (
            <span>
              <a role="button" onClick={() => this.handleDelegationAccept(record.dispId)}>
              接单
              </a>
              <span className="ant-divider" />
              <NavLink to={`/clearance/${this.props.ietype}/accept/edit/${record.delg_no}`}>
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
    }
    if (listFilter.status === 'undeclared') {
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
            新建委托
            </Button>
          </div>
          <RadioGroup value={listFilter.status} size="large" onChange={this.handleRadioChange}>
            <RadioButton value="all">全部</RadioButton>
            <RadioButton value="accept">接单</RadioButton>
            <RadioButton value="undeclared">制单</RadioButton>
            <RadioButton value="declared">已申报</RadioButton>
            <RadioButton value="finished">已放行</RadioButton>
          </RadioGroup>
          <SearchBar placeholder={'委托编号／发票号'}
            value={this.state.searchInput}
          />
        </div>
        <div className="page-body">
          <div className="panel-body table-panel">
            <Table columns={columns} dataSource={this.dataSource} expandedRowRender={this.handleSubdelgsList} />
          </div>
        </div>
      </div>
    );
  }
}
