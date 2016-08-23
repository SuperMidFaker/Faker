import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Radio, Button, Popconfirm, message } from 'antd';
import Table from 'client/components/remoteAntTable';
import moment from 'moment';
import NavLink from 'client/components/nav-link';
import { TENANT_ASPECT, CMS_DELEGATION_STATUS } from 'common/constants';
import connectNav from 'client/common/decorators/connect-nav';
import { setNavTitle } from 'common/reducers/navbar';
import SearchBar from 'client/components/search-bar';
import BillSubTable from './billSubTable';
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
  }),
  { loadAcceptanceTable, loadSubdelgsTable, acceptDelg, delDelg, showPreviewer }
)
@connectNav((props, dispatch, router, lifecycle) => {
  if (lifecycle !== 'componentWillReceiveProps') {
    return;
  }
  dispatch(setNavTitle({
    depth: 2,
    text: props.ietype === 'import' ? '进口' : '出口',
    moduleName: 'clearance',
    withModuleLayout: false,
    goBackFn: null,
  }));
})
export default class DelegationList extends Component {
  static propTypes = {
    ietype: PropTypes.oneOf(['import', 'export']),
    aspect: PropTypes.number.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    delegationlist: PropTypes.object.isRequired,
    listFilter: PropTypes.object.isRequired,
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
    width: 180,
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
    width: 170,
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
      <BillSubTable delgNo={record.delg_no} />
    );
  }

  render() {
    const { delegationlist, listFilter } = this.props;
    this.dataSource.remotes = delegationlist;
    const columns = [...this.columns];
    if (listFilter.status === 'all') {
      columns.push({
        title: '接单时间',
        dataIndex: 'acpt_time',
        render: (o, record) =>
          record.acpt_time && moment(record.acpt_time).format('YYYY.MM.DD'),
      }, {
        title: '创建时间',
        dataIndex: 'created_date',
        render: (o, record) =>
          moment(record.created_date).format('YYYY.MM.DD'),
      });
    }
    columns.push({
      title: '操作',
      width: 150,
      render: (o, record) => {
        if (listFilter.status === CMS_DELEGATION_STATUS.unaccepted) {
          return (
            <span>
              <a role="button" onClick={() => this.handleDelegationAccept(record.dispId)}>
              接单
              </a>
              <span className="ant-divider" />
              <NavLink to={`/clearance/${this.props.ietype}/edit/${record.delg_no}`}>
              修改
              </NavLink>
              <span className="ant-divider" />
              <Popconfirm title="确定删除?" onConfirm={() => this.handleDelgDel(record.delg_no)}>
                <a role="button">删除</a>
              </Popconfirm>
            </span>
          );
        } else if (listFilter.status === 'undeclared') {
          return (
            <span>
              <a role="button" onClick={() => this.handleDelegationAccept(record.dispId)}>
              分配
              </a>
              <span className="ant-divider" />
              <NavLink to={`/clearance/${this.props.ietype}/declare/make/${record.delg_no}`}>
              制单
              </NavLink>
            </span>
          );
        } else {
          return (
            <NavLink to={`/clearance/${this.props.ietype}/declare/view/${record.delg_no}`}>
            查看
            </NavLink>
          );
        }
      },
    });
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
          <span />
          <SearchBar placeholder={'委托编号/发票号'}
            value={this.state.searchInput}
          />
        </div>
        <div className="page-body">
          <div className="panel-body table-panel expandable">
            <Table columns={columns} dataSource={this.dataSource}
              expandedRowRender={this.handleSubdelgsList} scroll={{ x: 1500 }}
            />
          </div>
        </div>
      </div>
    );
  }
}
