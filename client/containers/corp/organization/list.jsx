import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { loadOrgans, delCorp, switchStatus, switchTenantApp, openTenantAppsEditor,
  closeTenantAppsEditor } from '../../../../universal/redux/reducers/corps';
import { Table, Button, Icon, message } from 'ant-ui';
import NavLink from '../../../../reusable/components/nav-link';
import showWarningModal from '../../../../reusable/components/deletion-warning-modal';
import AppEditor from '../../../components/appmodule-editor';
import { isLoaded } from '../../../../reusable/common/redux-actions';
import { resolveCurrentPageNumber } from '../../../../reusable/browser-util/react-ant';
import connectFetch from '../../../../reusable/decorators/connect-fetch';
import connectNav from '../../../../reusable/decorators/connect-nav';
import { setNavTitle } from '../../../../universal/redux/reducers/navbar';
import { ACCOUNT_STATUS, MAX_STANDARD_TENANT, DEFAULT_MODULES } from '../../../../universal/constants';
import formatMsg from './message.i18n';
import globalMessages from 'client/root.i18n';
import { messages as containerMsgs } from 'client/containers/message.i18n';

function fetchData({ state, dispatch, cookie }) {
  if (!isLoaded(state, 'corps')) {
    return dispatch(loadOrgans(cookie, {
      tenantId: state.account.tenantId,
      pageSize: state.corps.corplist.pageSize,
      currentPage: state.corps.corplist.current
    }));
  }
}
@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    corplist: state.corps.corplist,
    loading: state.corps.loading,
    appEditor: state.corps.appEditor,
    tenantId: state.account.tenantId
  }),
  {
    loadOrgans, delCorp, switchStatus, switchTenantApp, openTenantAppsEditor,
    closeTenantAppsEditor
  }
)
@connectNav((props, dispatch, lifecycle) => {
  if (lifecycle !== 'componentDidMount') {
    return;
  }
  dispatch(setNavTitle({
    depth: 2,
    text: formatMsg(props.intl, 'organTitle', containerMsgs),
    moduleName: 'corp',
    withModuleLayout: false,
    goBackFn: ''
  }));
})
export default class CorpList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    history: PropTypes.object.isRequired,
    tenantId: PropTypes.number.isRequired,
    corplist: PropTypes.object.isRequired,
    appEditor: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    switchStatus: PropTypes.func.isRequired,
    switchTenantApp: PropTypes.func.isRequired,
    openTenantAppsEditor: PropTypes.func.isRequired,
    closeTenantAppsEditor: PropTypes.func.isRequired,
    delCorp: PropTypes.func.isRequired,
    loadOrgans: PropTypes.func.isRequired
  }
  state = {
    selectedRowKeys: []
  };
  handleSelectionClear = () => {
    this.setState({selectedRowKeys: []});
  }
  handleNavigationTo(to, query) {
    this.props.history.pushState(null, to, query);
  }
  handleCorpDel(id) {
    const { tenantId, corplist: { totalCount, current, pageSize }, intl } = this.props;
    showWarningModal({
      title: formatMsg(intl, 'deleteTip'),
      content: formatMsg(intl, 'deleteWarn'),
      onOk: () => this.props.delCorp(id, tenantId).then(result => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          this.props.loadOrgans(null, {
            tenantId,
            pageSize,
            currentPage: resolveCurrentPageNumber(totalCount - 1, current, pageSize)
          });
        }
      }),
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
  handleEditorHide = () => {
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
    const { intl, corplist, loading } = this.props;
    const dataSource = new Table.DataSource({
      fetcher: (params) => this.props.loadOrgans(null, params),
      resolve: (result) => result.data,
      getPagination: (result, currentResolve) => ({
        total: result.totalCount,
        current: currentResolve(result.totalCount, result.current, result.pageSize),
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
      },
      remotes: corplist
    });
    // 通过 rowSelection 对象表明需要行选择
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({selectedRowKeys});
      }
    };
    const columns = [{
      title: formatMsg(intl, 'nameColumn'),
      dataIndex: 'name',
      render: (o, record) => this.renderColumnText(record.status, record.name)
    }, {
      title: formatMsg(intl, 'contactColumn'),
      dataIndex: 'contact',
      render: (o, record) => this.renderColumnText(record.status, record.contact)
    }, {
      title: formatMsg(intl, 'phoneColumn'),
      dataIndex: 'phone',
      render: (o, record) => this.renderColumnText(record.status, record.phone)
    }, {
      title: formatMsg(intl, 'emailColumn'),
      dataIndex: 'email',
      render: (o, record) => this.renderColumnText(record.status, record.email)
    }, {
      title: formatMsg(intl, 'appsColumn'),
      render: (o, record, index) => {
        const modComp = [];
        (record.apps || []).forEach((mod, idx) => {
          modComp.push(<NavLink key={mod.name} to={DEFAULT_MODULES[mod.id].url}>{mod.name}</NavLink>);
          modComp.push(<span className="ant-divider" key={`divider${idx}`}></span>);
        });
        return (
          <span>
            {modComp}
            <Button shape="circle" type="primary" title={formatMsg(intl, 'edit', globalMessages)}
              onClick={() => this.handleEnabledAppEdit(record, index)} size="small"
            >
              <Icon type="edit" />
            </Button>
          </span>);
      }
    }, {
      title: formatMsg(intl, 'statusColumn'),
      render: (o, record) => {
        let style = {color: '#51C23A'};
        if (record.status === ACCOUNT_STATUS.blocked.name) {
          style = {color: '#CCC'};
        }
        return <span style={style}>{ACCOUNT_STATUS[record.status].text}</span>;
      }
    }, {
      title: formatMsg(intl, 'opColumn'),
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
            <span>限额使用 </span>
            <span style={{fontSize: 20, fontWeight:700, color:'#51C23A'}}>{corplist.totalCount}</span>
            <span style={{fontSize: 20, fontWeight:400, color:'#333'}}>/</span>
            <span style={{fontSize: 20, fontWeight:700, color:'#333'}}>10</span>
          </div>
          <Button disabled={this.props.corplist.totalCount >= MAX_STANDARD_TENANT} type="primary"
              onClick={() => this.handleNavigationTo('/corp/organization/new')}>
              <Icon type="plus-circle-o" />新建
          </Button>
        </div>
        <div className="panel-body body-responsive">
          <Table rowSelection={rowSelection} columns={columns} loading={loading} dataSource={dataSource} />
        </div>
        <div className={`bottom-fixed-row ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
          <Button size="large" onClick={ this.handleSelectionClear } className="pull-right">清除选择</Button>
        </div>
        <AppEditor { ...this.props.appEditor } switchTenantApp={this.props.switchTenantApp}
          appPackage={this.props.corplist.tenantAppPackage} onCancel={ this.handleEditorHide }/>
      </div>);
  }
}
