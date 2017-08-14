import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button } from 'antd';
import Table from 'client/components/remoteAntTable';
import NavLink from 'client/components/NavLink';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import withPrivilege, { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { loadRoles, switchEnable } from 'common/reducers/role';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import globalMessages from 'client/common/root.i18n';
import containerMessages from 'client/apps/message.i18n';

const formatMsg = format(messages);
const formatGlobalMsg = format(globalMessages);
const formatContainerMsg = format(containerMessages);

function fetchData({ state, dispatch }) {
  if (!state.role.loaded) {
    return dispatch(loadRoles({
      tenantId: state.account.tenantId,
      pageSize: state.role.list.pageSize,
      current: state.role.list.current,
    }));
  }
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    rolelist: state.role.list,
    loading: state.role.loading,
    tenantId: state.account.tenantId,
  }),
  { loadRoles, switchEnable }
)
@connectNav({
  depth: 1,
  text: props => formatContainerMsg(props.intl, 'roleTitle'),
  moduleName: 'corp',
})
@withPrivilege({ module: 'corp', feature: 'role' })
export default class RoleList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    rolelist: PropTypes.shape({
      totalCount: PropTypes.number.isRequired,
      current: PropTypes.number.isRequired,
      pageSize: PropTypes.number.isRequired,
      data: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        desc: PropTypes.string.isRequired,
        status: PropTypes.number.isRequired,
      })),
    }).isRequired,
    loading: PropTypes.bool.isRequired,
    switchEnable: PropTypes.func.isRequired,
    loadRoles: PropTypes.func.isRequired,
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
  handleCreate = () => {
    this.context.router.push('/corp/role/new');
  }
  handleEnable(role, index) {
    this.props.switchEnable(role, index, true);
  }
  handleDisable(role, index) {
    this.props.switchEnable(role, index, false);
  }
  renderColumnText(status, text) {
    let style = {};
    if (status === 0) {
      style = { color: '#CCC' };
    }
    return <span style={style}>{text}</span>;
  }
  render() {
    const { intl, rolelist, loading } = this.props;
    const dataSource = new Table.DataSource({
      fetcher: params => this.props.loadRoles(params),
      resolve: result => result.data,
      getPagination: (result, currentResolve) => ({
        total: result.totalCount,
        current: currentResolve(result.totalCount, result.current, result.pageSize),
        showSizeChanger: true,
        showQuickJumper: false,
        pageSize: result.pageSize,
        showTotal: total => `共 ${total} 条`,
      }),
      getParams: (pagination, filters, sorter) => {
        const params = {
          tenantId: this.props.tenantId,
          pageSize: pagination.pageSize,
          current: pagination.current,
          sortField: sorter.field,
          sortOrder: sorter.order,
        };
        return params;
      },
      remotes: rolelist,
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
      title: formatMsg(intl, 'descColumn'),
      dataIndex: 'desc',
      width: 100,
      render: (o, record) => this.renderColumnText(record.status, record.desc),
    }, {
      title: formatContainerMsg(intl, 'statusColumn'),
      width: 100,
      render: (o, record) => {
        let style = { color: '#51C23A' };
        let text = 'accountNormal';
        if (record.status === 0) {
          style = { color: '#CCC' };
          text = 'accountDisabled';
        }
        return <span style={style}>{formatContainerMsg(intl, text)}</span>;
      },
    }, {
      title: formatContainerMsg(intl, 'opColumn'),
      width: 150,
      render: (text, record, index) => {
        if (record.status === 1) {
          return (
            <PrivilegeCover module="corp" feature="role" action="edit">
              <span>
                <NavLink to={`/corp/role/edit/${record.id}`}>
                  {formatGlobalMsg(intl, 'modify')}
                </NavLink>
                <span className="ant-divider" />
                <a role="presentation" onClick={() => this.handleDisable(record, index)}>
                  {formatContainerMsg(intl, 'disableOp')}
                </a>
              </span>
            </PrivilegeCover>);
        } else {
          return (
            <span>
              <PrivilegeCover module="corp" feature="role" action="edit">
                <a role="presentation" onClick={() => this.handleEnable(record, index)}>
                  {formatContainerMsg(intl, 'enableOp')}
                </a>
              </PrivilegeCover>
            </span>);
        }
      },
    }];
    return (
      <div className="page-body">
        <div className="toolbar">
          <PrivilegeCover module="corp" feature="role" action="create">
            <Button type="primary" onClick={this.handleCreate} icon="plus-circle-o">
              {formatGlobalMsg(intl, 'createNew')}
            </Button>
          </PrivilegeCover>
        </div>
        <div className="panel-body table-panel table-fixed-layout">
          <Table rowSelection={rowSelection} columns={columns} loading={loading}
            dataSource={dataSource} useFixedHeader
          />
        </div>
      </div>);
  }
}
