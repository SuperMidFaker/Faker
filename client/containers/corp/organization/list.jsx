import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { loadOrgans, delCorp, switchStatus, switchTenantApp, openTenantAppsEditor,
  closeTenantAppsEditor } from '../../../../universal/redux/reducers/corps';
import { Table, Button, AntIcon, message } from '../../../../reusable/ant-ui';
import NavLink from '../../../../reusable/components/nav-link';
import showWarningModal from '../../../../reusable/components/deletion-warning-modal';
import AppEditor from '../../../components/appmodule-editor';
import { isLoaded } from '../../../../reusable/common/redux-actions';
import connectFetch from '../../../../reusable/decorators/connect-fetch';
import { ACCOUNT_STATUS, MAX_STANDARD_TENANT, DEFAULT_MODULES } from '../../../../universal/constants';

function fetchData({state, dispatch, cookie}) {
  if (!isLoaded(state, 'corps')) {
    return dispatch(loadOrgans(cookie, {
      tenantId: state.account.tenantId,
      pageSize: state.corps.corplist.pageSize,
      currentPage: state.corps.corplist.current
    }));
  }
}
@connectFetch()(fetchData)
@connect(
  state => ({
    corplist: state.corps.corplist,
    needUpdate: state.corps.needUpdate,
    loading: state.corps.loading,
    appEditor: state.corps.appEditor,
    tenantId: state.account.tenantId
  }),
  { loadOrgans, delCorp, switchStatus, switchTenantApp, openTenantAppsEditor, closeTenantAppsEditor }
)
export default class CorpList extends React.Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
    tenantId: PropTypes.number.isRequired,
    corplist: PropTypes.object.isRequired,
    appEditor: PropTypes.object.isRequired,
    needUpdate: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
    switchStatus: PropTypes.func.isRequired,
    switchTenantApp: PropTypes.func.isRequired,
    openTenantAppsEditor: PropTypes.func.isRequired,
    closeTenantAppsEditor: PropTypes.func.isRequired,
    delCorp: PropTypes.func.isRequired,
    loadOrgans: PropTypes.func.isRequired
  }
  constructor() {
    super();
    this.state = {
      selectedRowKeys: []
    };
    this.handleSelectionClear = this.handleSelectionClear.bind(this);
    this.handleEditorHide = this.handleEditorHide.bind(this);
  }
  handleSelectionClear() {
    this.setState({selectedRowKeys: []});
  }
  handleNavigationTo(to, query) {
    this.props.history.pushState(null, to, query);
  }
  handleCorpDel(id) {
    showWarningModal({
      title: '请输入DELETE进行下一步操作',
      content: '点击确定会删除该机构及其下所有帐户信息',
      onOk: () => this.props.delCorp(id, this.props.tenantId),
      confirmString: 'DELETE'
    });
  }
  handleStatusSwitch(tenant, index) {
    this.props.switchStatus(index, tenant.key, tenant.status === ACCOUNT_STATUS.normal.name
      ? ACCOUNT_STATUS.blocked.name : ACCOUNT_STATUS.normal.name).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        }
      });
  }
  handleEnabledAppEdit(record, index) {
    this.props.openTenantAppsEditor(record, index);
  }
  handleEditorHide() {
    this.props.closeTenantAppsEditor();
  }
  renderColumnText(status, text) {
    let style = {};
    if (status === ACCOUNT_STATUS.blocked.name) {
      style = {color: '#CCC'};
    }
    return <span style={style}>{text}</span>;
  }
  render() {
    const { corplist, loading, needUpdate } = this.props;
    const dataSource = new Table.DataSource({
      fetcher: (params) => this.props.loadOrgans(null, params),
      resolve: (result) => result.data,
      needUpdate,
      getPagination: (result) => ({
        total: result.totalCount,
        // 删除完一页时返回上一页
        current: result.totalCount > 0 && (result.current - 1) * result.pageSize <= result.totalCount
          && result.current * result.pageSize > result.totalCount ?
          Math.ceil(result.totalCount / result.pageSize) : result.current,
        showSizeChanger: true,
        showQuickJumper: false,
        pageSizeOptions: ['5', '10'], // todo how to make it sync with initialstate pageSize
        pageSize: result.pageSize
      }),
      getParams: (pagination, filters, sorter) => {
        const params = {
          tenantId: this.props.tenantId,
          pageSize: pagination.pageSize,
          currentPage: pagination.current,
          sortField: sorter.field,
          sortOrder: sorter.order
        };
        for (const key in filters) {
          if (filters[key]) {
            params[key] = filters[key];
          }
        }
        return params;
      }
    });
    // 通过 rowSelection 对象表明需要行选择
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({selectedRowKeys});
      }
    };
    const columns = [{
      title: '部门/分支机构',
      dataIndex: 'name',
      render: (o, record) => this.renderColumnText(record.status, record.name)
    }, {
      title: '负责人',
      dataIndex: 'contact',
      render: (o, record) => this.renderColumnText(record.status, record.contact)
    }, {
      title: '手机号',
      dataIndex: 'phone',
      render: (o, record) => this.renderColumnText(record.status, record.phone)
    }, {
      title: '邮箱',
      dataIndex: 'email',
      render: (o, record) => this.renderColumnText(record.status, record.email)
    }, {
      title: '已开通应用',
      render: (o, record, index) => {
        const modComp = [];
        (record.apps || []).forEach((mod, idx) => {
          modComp.push(<NavLink key={mod.name} to={DEFAULT_MODULES[mod.id].url}>{mod.name}</NavLink>);
          modComp.push(<span className="ant-divider" key={`divider${idx}`}></span>);
        });
        return (
          <span>
            {modComp}
            <Button shape="circle" type="primary" title="编辑" onClick={() => this.handleEnabledAppEdit(record, index)} size="small"><AntIcon type="edit" /></Button>
          </span>);
      }
    }, {
      title: '状态',
      render: (o, record) => {
        let style = {color: '#51C23A'};
        if (record.status === ACCOUNT_STATUS.blocked.name) {
          style = {color: '#CCC'};
        }
        return <span style={style}>{ACCOUNT_STATUS[record.status].text}</span>;
      }
    }, {
      title: '操作',
      width: 150,
      render: (text, record, index) => {
        if (record.status === ACCOUNT_STATUS.normal.name) {
          return (
            <span>
              <NavLink to={`/corp/organization/edit/${record.key}`}>修改</NavLink>
              <span className="ant-divider"></span>
              <a role="button" onClick={() => this.handleStatusSwitch(record, index)}>停用</a>
            </span>);
        } else if (record.status === ACCOUNT_STATUS.blocked.name) {
          return (
            <span>
              <a role="button" onClick={() => this.handleCorpDel(record.key)}>删除</a>
              <span className="ant-divider"></span>
              <a role="button" onClick={() => this.handleStatusSwitch(record, index)}>启用</a>
            </span>);
        } else {
          return <span />;
        }
      }
    }];
    return (
      <div className="page-body">
        <div className="panel-header">
          <div className="pull-right action-btns">
            <Button disabled={this.props.corplist.totalCount >= MAX_STANDARD_TENANT} type="primary"
              onClick={() => this.handleNavigationTo('/corp/organization/new')}>
              <span>新增</span>
            </Button>
          </div>
          <span>限额使用 </span>
          <span style={{fontSize: 20, fontWeight:700, color:'#51C23A'}}>{this.props.corplist.totalCount}</span>
          <span style={{fontSize: 20, fontWeight:400, color:'#333'}}>/</span>
          <span style={{fontSize: 20, fontWeight:700, color:'#333'}}>10</span>
        </div>
        <div className="panel-body body-responsive">
          <Table rowSelection={rowSelection} columns={columns} loading={loading} remoteData={corplist} dataSource={dataSource} />
        </div>
        <div className={`bottom-fixed-row ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
          <Button size="large" onClick={ this.handleSelectionClear } className="pull-right">清除选择</Button>
        </div>
        <AppEditor { ...this.props.appEditor } switchTenantApp={this.props.switchTenantApp}
          appPackage={this.props.corplist.tenantAppPackage} onCancel={ this.handleEditorHide }/>
      </div>);
  }
}
