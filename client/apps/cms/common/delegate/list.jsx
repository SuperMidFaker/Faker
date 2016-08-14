import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Radio, Button, Popconfirm, message } from 'antd';
import Table from 'client/components/remoteAntTable';
import moment from 'moment';
import NavLink from 'client/components/nav-link';
import { TENANT_ASPECT, DELG_SOURCE } from 'common/constants';
import connectNav from 'client/common/decorators/connect-nav';
import { setNavTitle } from 'common/reducers/navbar';
import { loadDelegateTable, acceptDelg, delDelg, toggleSendDelegateModal, returnDelegate, showPreviewer } from 'common/reducers/cmsDelegation';
import SendPanel from '../modals/send-panel';
import PreviewPanel from '../modals/preview-panel';

const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

@connect(
  state => {
    return {
      aspect: state.account.aspect,
      tenantId: state.account.tenantId,
      loginId: state.account.loginId,
      loginName: state.account.username,
      delegationlist: state.cmsDelegation.delegationlist,
      delegateListFilter: state.cmsDelegation.delegateListFilter,
    };
  },
  { loadDelegateTable, acceptDelg, delDelg, toggleSendDelegateModal, returnDelegate, showPreviewer }
)
@connectNav((props, dispatch, router, lifecycle) => {
  if (lifecycle !== 'componentWillReceiveProps') {
    return;
  }
  dispatch(setNavTitle({
    depth: 2,
    text: '委托',
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
    delegateListFilter: PropTypes.object.isRequired,
    loadDelegateTable: PropTypes.func.isRequired,
    acceptDelg: PropTypes.func.isRequired,
    delDelg: PropTypes.func.isRequired,
    returnDelegate: PropTypes.func.isRequired,
    showPreviewer: PropTypes.func.isRequired,
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
    render: (o) => {
      return (
        <a onClick={() => this.props.showPreviewer({
          delgNo: o,
          tenantId: this.props.tenantId,
        }, this.props.delegateListFilter.status)}>
          {o}
        </a>);
    },
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
  }, {
    title: '创建时间',
    dataIndex: 'created_date',
    render: (o, record) => moment(record.created_date).format('YYYY.MM.DD'),
  }]
  dataSource = new Table.DataSource({
    fetcher: params => this.props.loadDelegateTable(null, params),
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
      const filter = { ...this.props.delegateListFilter, sortField: sorter.field, sortOrder: sorter.order };
      params.filter = JSON.stringify(filter);
      return params;
    },
    remotes: this.props.delegationlist,
  })
  handleCreateBtnClick = () => {
    this.context.router.push(`/${this.props.ietype}/delegate/create`);
  }
  handleRadioChange = (ev) => {
    if (ev.target.value === this.props.delegateListFilter.status) {
      return;
    }
    const filter = JSON.stringify({ ...this.props.delegateListFilter, status: ev.target.value });
    const { ietype, tenantId, delegationlist } = this.props;
    this.props.loadDelegateTable(null, {
      ietype,
      tenantId,
      filter,
      pageSize: delegationlist.pageSize,
      currentPage: delegationlist.current,
    });
  }
  handleDelegationAccept = (dispId) => {
    const { tenantId, loginId, loginName, delegateListFilter, ietype,
      delegationlist: { pageSize, current } } = this.props;
    this.props.acceptDelg(loginId, loginName, dispId).then(
      result => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          this.props.loadDelegateTable(null, {
            ietype,
            tenantId,
            filter: JSON.stringify(delegateListFilter),
            pageSize,
            currentPage: current,
          });
        }
      }
    );
  }
  handleDelgDel = (delgNo) => {
    const { tenantId, delegateListFilter, ietype, delegationlist: { pageSize, current } } = this.props;
    this.props.delDelg(delgNo).then(result => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        this.props.loadDelegateTable(null, {
          ietype,
          tenantId,
          filter: JSON.stringify(delegateListFilter),
          pageSize,
          currentPage: current,
        });
      }
    });
  }
  handleLoadSendModal = (row) => {
    const { tenantId, ietype } = this.props;
    this.props.toggleSendDelegateModal(true, { tenantId, ieType: ietype }, [row]).then(result => {
      if (result.error) {
        message.error(result.error.message);
      }
    });
  }
  handleNavigationTo = (to, query) => {
    this.context.router.push({ pathname: to, query });
  }
  handleReturn = (data) => {
    const { tenantId, delegateListFilter, ietype, delegationlist: { pageSize, current } } = this.props;
    this.props.returnDelegate(data).then(result => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        this.props.loadDelegateTable(null, {
          ietype,
          tenantId,
          filter: JSON.stringify(delegateListFilter),
          pageSize,
          currentPage: current,
        });
      }
    });
  }
  render() {
    const { delegationlist, delegateListFilter } = this.props;
    this.dataSource.remotes = delegationlist;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: selectedRowKeys => {
        this.setState({ selectedRowKeys });
      },
    };
    const columns = [...this.columns];

    if (delegateListFilter.status === 'undelg') {
      columns.push({
        title: '操作',
        render: (o, record) => {
          return (
            <span>
              <NavLink to={`/${this.props.ietype}/delegate/edit/${record.delg_no}`}>
              修改
              </NavLink>
              <span className="ant-divider" />
              <a onClick={() => { this.handleLoadSendModal(record); }} >
              发送
              </a>
              <span className="ant-divider" />
              <Popconfirm title="确定删除?" onConfirm={() => this.handleDelgDel(record.delg_no)}>
                <a role="button">删除</a>
              </Popconfirm>
            </span>
          );
        },
      });
    } else if (delegateListFilter.status === 'unaccepted') {
      columns.push({
        title: '操作',
        render: (o, record) => {
          return (
            <span>
              <NavLink to={`/${this.props.ietype}/delegate/edit/${record.delg_no}`}>
              修改
              </NavLink>
              <span className="ant-divider" />
              <a role="button" onClick={() => this.handleReturn({ delgNo: record.delg_no, dispId: record.dispId })}>
              退回
              </a>
            </span>
          );
        },
      });
      columns.splice(1, 0, {
        title: '报关行',
        dataIndex: 'ccb_name',
      });
    } else if (delegateListFilter.status === 'undeclared') {
      columns.push({
        title: '操作',
        render: (o, record) => {
          return (
            <span>
              <NavLink to={`/${this.props.ietype}/declare/view/${record.delg_no}`}>
              查看
              </NavLink>
            </span>
          );
        },
      });
      columns.splice(1, 0, {
        title: '报关行',
        dataIndex: 'ccb_name',
      });
    } else if (delegateListFilter.status === 'declared') {
      columns.push({
        title: '操作',
        render: (o, record) => {
          return (
            <span>
              <NavLink to={`/${this.props.ietype}/declare/view/${record.delg_no}`}>
              查看
              </NavLink>
            </span>
          );
        },
      });
      columns.splice(1, 0, {
        title: '报关单号',
        dataIndex: 'entry_id',
      }, {
        title: '报关行',
        dataIndex: 'ccb_name',
      });
    } else if (delegateListFilter.status === 'finished') {
      columns.push({
        title: '操作',
        render: (o, record) => {
          return (
            <span>
              <NavLink to={`/${this.props.ietype}/declare/view/${record.delg_no}`}>
              查看
              </NavLink>
            </span>
          );
        },
      });
      columns.splice(1, 0, {
        title: '报关单号',
        dataIndex: 'entry_id',
      }, {
        title: '报关行',
        dataIndex: 'ccb_name',
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
          <RadioGroup value={delegateListFilter.status} size="large" onChange={this.handleRadioChange}>
            <RadioButton value="undelg">待委托</RadioButton>
            <RadioButton value="unaccepted">委托中</RadioButton>
            <RadioButton value="undeclared">未申报</RadioButton>
            <RadioButton value="declared">已申报</RadioButton>
            <RadioButton value="finished">已结单</RadioButton>
          </RadioGroup>
        </div>
        <div className="page-body">
          <div className="panel-body table-panel">
            <Table columns={columns} dataSource={this.dataSource} rowSelection={rowSelection} />
          </div>
        </div>
        <SendPanel ietype={this.props.ietype} />
        <PreviewPanel />
      </div>
    );
  }
}
