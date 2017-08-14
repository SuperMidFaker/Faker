import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import {
  loadOrgans, delCorp, switchStatus, switchTenantApp,
  openTenantAppsEditor, closeTenantAppsEditor, INITIAL_LIST_PAGE_SIZE,
} from 'common/reducers/corps';
import { Button, Icon, message } from 'antd';
import Table from 'client/components/remoteAntTable';
import NavLink from '../../../components/NavLink';
import showWarningModal from 'client/components/deletion-warning-modal';
import AppEditor from '../../../components/appmodule-editor';
import { isLoaded } from 'client/common/redux-actions';
import { resolveCurrentPageNumber } from 'client/util/react-ant';
import connectFetch from 'client/common/decorators/connect-fetch';
import withPrivilege, { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { ACCOUNT_STATUS, MAX_STANDARD_TENANT, DEFAULT_MODULES }
  from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import globalMessages from 'client/common/root.i18n';
import containerMessages from 'client/apps/message.i18n';
const formatMsg = format(messages);
const formatGlobalMsg = format(globalMessages);
const formatContainerMsg = format(containerMessages);

function fetchData({ state, dispatch, cookie }) {
  if (!isLoaded(state, 'corps')) {
    return dispatch(loadOrgans(cookie, {
      tenantId: state.account.tenantId,
      pageSize: state.corps.corplist.pageSize,
      currentPage: state.corps.corplist.current,
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
    tenantId: state.account.tenantId,
  }),
  {
    loadOrgans,
    delCorp,
    switchStatus,
    switchTenantApp,
    openTenantAppsEditor,
    closeTenantAppsEditor,
  }
)
@withPrivilege({ module: 'corp', feature: 'organization' })
export default class CorpList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    corplist: PropTypes.object.isRequired,
    appEditor: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    switchStatus: PropTypes.func.isRequired,
    switchTenantApp: PropTypes.func.isRequired,
    openTenantAppsEditor: PropTypes.func.isRequired,
    closeTenantAppsEditor: PropTypes.func.isRequired,
    delCorp: PropTypes.func.isRequired,
    loadOrgans: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
  }
  handleSelectionClear = () => {
    this.setState({ selectedRowKeys: [] });
  }
  handleNavigationTo(to, query) {
    this.context.router.push({ pathname: to, query });
  }
  handleCorpDel(id) {
    const { tenantId, corplist: { totalCount, current, pageSize }, intl } = this.props;
    showWarningModal({
      title: formatMsg(intl, 'deleteTip'),
      content: formatMsg(intl, 'deleteWarn'),
      onOk: () => this.props.delCorp(id, tenantId).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          this.props.loadOrgans(null, {
            tenantId,
            pageSize,
            currentPage: resolveCurrentPageNumber(totalCount - 1, current, pageSize),
          });
        }
      }),
      confirmString: 'DELETE',
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
      style = { color: '#CCC' };
    }
    return <span style={style}>{text}</span>;
  }
  render() {
    const { intl, corplist, loading } = this.props;
    const dataSource = new Table.DataSource({
      fetcher: params => this.props.loadOrgans(null, params),
      resolve: result => result.data,
      getPagination: (result, currentResolve) => ({
        total: result.totalCount,
        current: currentResolve(result.totalCount, result.current, result.pageSize),
        showSizeChanger: true,
        showQuickJumper: false,
        pageSizeOptions: [`${INITIAL_LIST_PAGE_SIZE}`, `${INITIAL_LIST_PAGE_SIZE * 2}`],
        pageSize: result.pageSize,
        showTotal: total => `共 ${total} 条`,
      }),
      getParams: (pagination, filters, sorter) => {
        const params = {
          tenantId: this.props.tenantId,
          pageSize: pagination.pageSize,
          currentPage: pagination.current,
          sortField: sorter.field,
          sortOrder: sorter.order,
        };
        for (const key in filters) {
          if (filters[key]) {
            params[key] = filters[key];
          }
        }
        return params;
      },
      remotes: corplist,
    });
    // 通过 rowSelection 对象表明需要行选择
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const columns = [{
      title: formatMsg(intl, 'nameColumn'),
      dataIndex: 'name',
      width: 150,
      render: (o, record) => this.renderColumnText(record.status, record.name),
    }, {
      title: formatMsg(intl, 'subcodeColumn'),
      dataIndex: 'subCode',
      width: 100,
      render: (o, record) => this.renderColumnText(record.status, record.subCode),
    }, {
      title: formatMsg(intl, 'contactColumn'),
      dataIndex: 'contact',
      width: 100,
      render: (o, record) => this.renderColumnText(record.status, record.contact),
    }, {
      title: formatMsg(intl, 'phoneColumn'),
      dataIndex: 'phone',
      width: 100,
      render: (o, record) => this.renderColumnText(record.status, record.phone),
    }, {
      title: formatMsg(intl, 'emailColumn'),
      dataIndex: 'email',
      width: 100,
      render: (o, record) => this.renderColumnText(record.status, record.email),
    }, {
      title: formatMsg(intl, 'appsColumn'),
      width: 200,
      render: (o, record, index) => {
        const modComp = [];
        (record.apps || []).forEach((mod) => {
          modComp.push(
            <NavLink key={mod.id} to={DEFAULT_MODULES[mod.id].url}>
              {formatGlobalMsg(intl, DEFAULT_MODULES[mod.id].text)}
            </NavLink>
          );
          modComp.push(<span className="ant-divider" key={`divider${mod.id}`} />);
        });
        return (
          <span>
            {modComp}
            <PrivilegeCover module="corp" feature="organization" action="edit">
              <Button shape="circle" type="primary" title={formatGlobalMsg(intl, 'edit')}
                onClick={() => this.handleEnabledAppEdit(record, index)} size="small"
              >
                <Icon type="edit" />
              </Button>
            </PrivilegeCover>
          </span>);
      },
    }, {
      title: formatContainerMsg(intl, 'statusColumn'),
      width: 100,
      render: (o, record) => {
        let style = { color: '#51C23A' };
        if (record.status === ACCOUNT_STATUS.blocked.name) {
          style = { color: '#CCC' };
        }
        return <span style={style}>{formatContainerMsg(intl, ACCOUNT_STATUS[record.status].text)}</span>;
      },
    }, {
      title: formatContainerMsg(intl, 'opColumn'),
      width: 150,
      render: (text, record, index) => {
        if (record.status === ACCOUNT_STATUS.normal.name) {
          return (
            <PrivilegeCover module="corp" feature="organization" action="edit">
              <span>
                <NavLink to={`/corp/organization/edit/${record.key}`}>
                  {formatGlobalMsg(intl, 'modify')}
                </NavLink>
                <span className="ant-divider" />
                <a role="presentation" onClick={() => this.handleStatusSwitch(record, index)}>
                  {formatContainerMsg(intl, 'disableOp')}
                </a>
              </span>
            </PrivilegeCover>);
        } else if (record.status === ACCOUNT_STATUS.blocked.name) {
          return (
            <span>
              <PrivilegeCover module="corp" feature="organization" action="delete">
                <a role="presentation" onClick={() => this.handleCorpDel(record.key)}>
                  {formatGlobalMsg(intl, 'delete')}
                </a>
              </PrivilegeCover>
              <span className="ant-divider" />
              <PrivilegeCover module="corp" feature="organization" action="edit">
                <a role="presentation" onClick={() => this.handleStatusSwitch(record, index)}>
                  {formatContainerMsg(intl, 'enableOp')}
                </a>
              </PrivilegeCover>
            </span>);
        } else {
          return <span />;
        }
      },
    }];
    return (
      <div className="page-body">
        <div className="toolbar">
          <div className="toolbar-right">
            <span>{formatMsg(intl, 'quotas')}{' '}</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#51C23A' }}>{corplist.totalCount}</span>
            <span style={{ fontSize: 20, fontWeight: 400, color: '#333' }}>/</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#333' }}>10</span>
          </div>
          <PrivilegeCover module="corp" feature="organization" action="create">
            <Button disabled={this.props.corplist.totalCount >= MAX_STANDARD_TENANT} type="primary"
              onClick={() => this.handleNavigationTo('/corp/organization/new')} icon="plus-circle-o"
            >
              {formatGlobalMsg(intl, 'createNew')}
            </Button>
          </PrivilegeCover>
        </div>
        <div className="panel-body table-panel table-fixed-layout">
          <Table rowSelection={rowSelection} columns={columns} loading={loading} dataSource={dataSource} useFixedHeader />
        </div>
        <AppEditor {...this.props.appEditor} switchTenantApp={this.props.switchTenantApp}
          appPackage={this.props.corplist.tenantAppPackage} onCancel={this.handleEditorHide}
        />
      </div>);
  }
}
