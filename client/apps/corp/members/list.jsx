import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Breadcrumb, Button, Icon, Menu, Input, message, Layout } from 'antd';
import QueueAnim from 'rc-queue-anim';
import Table from 'client/components/remoteAntTable';
import MdIcon from 'client/components/MdIcon';
import { intlShape, injectIntl } from 'react-intl';
import { loadPersonnel, loadTenantsByMaster, delPersonnel, switchTenant, switchStatus } from
 'common/reducers/personnel';
import NavLink from 'client/components/nav-link';
import connectFetch from 'client/common/decorators/connect-fetch';
import withPrivilege, { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { resolveCurrentPageNumber } from 'client/util/react-ant';
import { isLoaded } from 'client/common/redux-actions';
import { ACCOUNT_STATUS, PRESET_TENANT_ROLE, PRESET_ROLE_NAME_KEYS } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import globalMessages from 'client/common/root.i18n';
import containerMessages from 'client/apps/message.i18n';

const formatMsg = format(messages);
const formatGlobalMsg = format(globalMessages);
const formatContainerMsg = format(containerMessages);
const { Header, Content, Sider } = Layout;
const Search = Input.Search;
const SubMenu = Menu.SubMenu;

function fetchData({ state, dispatch, cookie }) {
  const promises = [];
  if (!isLoaded(state, 'personnel')) {
    let p = dispatch(loadTenantsByMaster(cookie, state.account.tenantId));
    promises.push(p);
    // 当前选择租户可能被删除,所以重新加载到主租户
    p = dispatch(loadPersonnel(cookie, {
      tenantId: state.account.tenantId,
      pageSize: state.personnel.personnelist.pageSize,
      currentPage: state.personnel.personnelist.current,
    }));
    promises.push(p);
  }
  // 分别加载当前用户所有的租户列表和该用户所在租户下用户列表
  // 返回多个promise结果
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    code: state.account.code,
    personnelist: state.personnel.personnelist,
    filters: state.personnel.filters,
    branches: state.personnel.branches,
    tenant: state.personnel.tenant,
    loading: state.personnel.loading,
  }),
  { delPersonnel, switchTenant, switchStatus, loadPersonnel })
@withPrivilege({ module: 'corp', feature: 'personnel' })
export default class PersonnelSetting extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    selectIndex: PropTypes.number,
    code: PropTypes.string.isRequired,
    loading: PropTypes.bool.isRequired,
    personnelist: PropTypes.object.isRequired,
    filters: PropTypes.array.isRequired,
    branches: PropTypes.array.isRequired,
    tenant: PropTypes.object.isRequired,
    loadPersonnel: PropTypes.func.isRequired,
    switchTenant: PropTypes.func.isRequired,
    switchStatus: PropTypes.func.isRequired,
    delPersonnel: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
  }
  handleSelectionClear = () => {
    this.setState({
      selectedRowKeys: [],
    });
  }
  handleTenantSwitch(val) {
    const { personnelist, filters } = this.props;
    this.props.loadPersonnel(null, {
      tenantId: val,
      pageSize: personnelist.pageSize,
      filters: JSON.stringify(filters),
      currentPage: 1,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        let tenant;
        this.props.branches.forEach((br) => {
          if (`${br.key}` === val) {
            tenant = {
              id: br.key,
              parentId: br.parentId,
            };
          }
        });
        this.props.switchTenant(tenant);
      }
    });
  }
  handleNavigationTo(to, query) {
    this.context.router.push({ pathname: to, query });
  }
  handleStatusSwitch(personnel, index) {
    this.props.switchStatus(index, personnel.key, personnel.status === ACCOUNT_STATUS.normal.id
      ? ACCOUNT_STATUS.blocked.id : ACCOUNT_STATUS.normal.id).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        }
      });
  }
  handlePersonnelDel(record) {
    const { tenant, filters, personnelist: { totalCount, current, pageSize } } = this.props;
    this.props.delPersonnel(record.key, record.loginId, tenant).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.props.loadPersonnel(null, {
          tenantId: tenant.id,
          pageSize,
          filters: JSON.stringify(filters),
          currentPage: resolveCurrentPageNumber(totalCount - 1, current, pageSize),
        });
      }
    });
  }
  handleSearch = (searchVal) => {
    const filters = this.props.filters.filter(
      flt => !(flt.length === 3 && flt[0].name === 'name' &&
        flt[1].name === 'email' && flt[2].name === 'phone')
    );
    if (searchVal) {
      // OR name column clause
      filters.push(
        [{
          name: 'name',
          value: searchVal,
        }, {
          name: 'email',
          value: searchVal,
        }, {
          name: 'phone',
          value: searchVal,
        }]
      );
    }
    this.props.loadPersonnel(null, {
      tenantId: this.props.tenant.id,
      pageSize: this.props.personnelist.pageSize,
      currentPage: 1,
      filters: JSON.stringify(filters),
    });
  }
  renderColumnText(status, text) {
    let style = {};
    if (status === ACCOUNT_STATUS.blocked.id) {
      style = { color: '#CCC' };
    }
    return <span style={style}>{text}</span>;
  }
  render() {
    const { intl, code, tenant, personnelist, branches, loading } = this.props;
    const msg = descriptor => formatMsg(intl, descriptor);
    const dataSource = new Table.DataSource({
      fetcher: params => this.props.loadPersonnel(null, params),
      resolve: result => result.data,
      getPagination: (result, resolve) => ({
        total: result.totalCount,
        // 删除完一页时返回上一页
        current: resolve(result.totalCount, result.current, result.pageSize),
        showSizeChanger: true,
        showQuickJumper: false,
        pageSize: result.pageSize,
        showTotal: total => `共 ${total} 条`,
      }),
      getParams: (pagination, filters, sorter) => {
        const params = {
          tenantId: tenant.id,
          pageSize: pagination.pageSize,
          currentPage: pagination.current,
          sortField: sorter.field,
          sortOrder: sorter.order,
          filters: this.props.filters,
        };
        // 首先去除不存在的过滤条件
        params.filters = params.filters.filter(
          flt => !flt.name || (flt.name in filters && filters[flt.name].length)
        );
        for (const key in filters) {
          if ((key in filters) && filters[key].length > 0) {
            params.filters = params.filters.filter(flt => flt.name !== key);
            params.filters.push({
              name: key,
              value: filters[key][0],
            });
          }
        }
        params.filters = JSON.stringify(params.filters);
        return params;
      },
      remotes: personnelist,
    });
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const columns = [{
      title: msg('fullName'),
      dataIndex: 'name',
      width: 100,
      sorter: true,
      render: (o, record) => this.renderColumnText(record.status, record.name),
    }, {
      title: msg('username'),
      width: 200,
      render: (o, record) => this.renderColumnText(record.status, `${record.loginName}@${code}`),
    }, {
      title: msg('phone'),
      width: 100,
      render: (o, record) => this.renderColumnText(record.status, record.phone),
    }, {
      title: msg('email'),
      dataIndex: 'email',
      width: 200,
      sorter: true,
      render: (o, record) => this.renderColumnText(record.status, record.email),
    }, {
      title: msg('position'),
      width: 100,
      render: (o, record) => this.renderColumnText(record.status, record.position),
    }, {
      title: msg('role'),
      sorter: true,
      dataIndex: 'role',
      width: 100,
      filters: [{
        text: formatContainerMsg(intl, 'tenantManager'),
        value: PRESET_TENANT_ROLE.manager.name,
      }, {
        text: formatContainerMsg(intl, 'tenantMember'),
        value: PRESET_TENANT_ROLE.member.name,
      }],
      render: (o, record) => this.renderColumnText(
        record.status,
        PRESET_ROLE_NAME_KEYS[record.role] ?
        formatContainerMsg(intl, PRESET_ROLE_NAME_KEYS[record.role].text)
        : record.role,
      ),
    }, {
      title: formatContainerMsg(intl, 'statusColumn'),
      width: 50,
      render: (o, record) => {
        let style = { color: '#51C23A' };
        let text = ACCOUNT_STATUS.normal.text;
        if (record.status === ACCOUNT_STATUS.blocked.id) {
          style = { color: '#CCC' };
          text = ACCOUNT_STATUS.blocked.text;
        }
        return <span style={style}>{formatContainerMsg(intl, text)}</span>;
      },
    }, {
      title: formatContainerMsg(intl, 'opColumn'),
      width: 80,
      render: (text, record, index) => {
        if (record.role === PRESET_TENANT_ROLE.owner.name) {
          return (
            <span>
              <PrivilegeCover module="corp" feature="personnel" action="edit">
                <NavLink to={`/corp/members/edit/${record.key}`}>
                  {formatGlobalMsg(intl, 'modify')}
                </NavLink>
              </PrivilegeCover>
            </span>
          );
        } else if (record.status === ACCOUNT_STATUS.normal.id) {
          return (
            <PrivilegeCover module="corp" feature="personnel" action="edit">
              <span>
                <NavLink to={`/corp/members/edit/${record.key}`}>
                  {formatGlobalMsg(intl, 'modify')}
                </NavLink>
                <span className="ant-divider" />
                <a role="button" onClick={() => this.handleStatusSwitch(record, index)}>
                  {formatContainerMsg(intl, 'disableOp')}
                </a>
              </span>
            </PrivilegeCover>
          );
        } else if (record.status === ACCOUNT_STATUS.blocked.id) {
          return (
            <span>
              <PrivilegeCover module="corp" feature="personnel" action="delete">
                <a role="button" onClick={() => this.handlePersonnelDel(record)}>
                  {formatGlobalMsg(intl, 'delete')}
                </a>
              </PrivilegeCover>
              <span className="ant-divider" />
              <PrivilegeCover module="corp" feature="personnel" action="edit">
                <a role="button" onClick={() => this.handleStatusSwitch(record, index)}>
                  {formatContainerMsg(intl, 'enableOp')}
                </a>
              </PrivilegeCover>
            </span>
          );
        } else {
          return <span />;
        }
      },
    }];
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              {msg('members')}
            </Breadcrumb.Item>
          </Breadcrumb>
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <Layout className="main-wrapper">
              <Sider className="nav-sider">
                <div className="nav-sider-head">
                  <Search
                    placeholder="搜索用户"
                    onSearch={this.handleSearch} size="large"
                  />
                </div>
                <Menu
                  defaultOpenKeys={['deptMenu']}
                  defaultSelectedKeys={['allMember']}
                  mode="inline"
                >
                  <Menu.Item key="allMember"><NavLink to="/corp/members"><Icon type="team" />所有成员</NavLink></Menu.Item>
                  <SubMenu key="deptMenu" title={<span><MdIcon mode="fontello" type="sitemap" />部门</span>}>
                    {
                      branches.map(br => <Menu.Item key={br.key}>{br.name}</Menu.Item>)
                    }
                  </SubMenu>
                </Menu>
                <div className="nav-sider-footer">
                  <Button type="dashed" size="large" icon="plus-circle">创建部门</Button>
                </div>
              </Sider>
              <Content className="nav-content">
                <div className="nav-content-head">
                  <PrivilegeCover module="corp" feature="personnel" action="create">
                    <Button size="large" type="primary" onClick={() => this.handleNavigationTo('/corp/members/new')} icon="user-add">
                      {msg('newUser')}
                    </Button>
                  </PrivilegeCover>
                </div>
                <div className="panel-body table-panel">
                  <Table rowSelection={rowSelection} columns={columns} loading={loading} dataSource={dataSource} useFixedHeader />
                </div>
              </Content>
            </Layout>
          </div>
        </Content>
      </QueueAnim>
    );
  }
}
