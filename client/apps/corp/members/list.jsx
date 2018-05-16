import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Card, Icon, Menu, Input, Popover, message, Layout } from 'antd';
import connectFetch from 'client/common/decorators/connect-fetch';
import DataTable from 'client/components/DataTable';
import { MdIcon } from 'client/components/FontIcon';
import { intlShape, injectIntl } from 'react-intl';
import { loadMembers, loadDepartments, delMember, createDepartment, switchStatus, openMemberModal, toggleUserModal } from 'common/reducers/personnel';
import NavLink from 'client/components/NavLink';
import PageHeader from 'client/components/PageHeader';
import RowAction from 'client/components/RowAction';
import SearchBox from 'client/components/SearchBox';
import withPrivilege, { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { resolveCurrentPageNumber } from 'client/util/react-ant';
import { ACCOUNT_STATUS, PRESET_TENANT_ROLE, PRESET_ROLE_NAME_KEYS } from 'common/constants';
import CorpSiderMenu from '../menu';
import AddMemberModal from './modal/addMemberModal';
import AddUser from './modal/addUserModal';
import { formatMsg } from '../message.i18n';

const { Content, Sider } = Layout;
const { SubMenu } = Menu;

function fetchData({ state, dispatch }) {
  const promises = [
    dispatch(loadMembers({
      tenantId: state.account.tenantId,
      pageSize: state.personnel.memberlist.pageSize,
      current: state.personnel.memberlist.current,
      filters: JSON.stringify(state.personnel.memberFilters),
    })),
    dispatch(loadDepartments(state.account.tenantId)),
  ];
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    personnelist: state.personnel.memberlist,
    filters: state.personnel.memberFilters,
    departments: state.personnel.departments,
    tenantId: state.account.tenantId,
    loading: state.personnel.loading,
  }),
  {
    delMember,
    switchStatus,
    loadDepartments,
    createDepartment,
    loadMembers,
    openMemberModal,
    toggleUserModal,
  }
)
@withPrivilege({ module: 'corp', feature: 'personnel' })
export default class MemberDepartmentView extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    loading: PropTypes.bool.isRequired,
    personnelist: PropTypes.shape({ totalCount: PropTypes.number.isRequired }).isRequired,
    filters: PropTypes.shape({ dept_id: PropTypes.number, name: PropTypes.string }).isRequired,
    departments: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })).isRequired,
    tenantId: PropTypes.number.isRequired,
    loadMembers: PropTypes.func.isRequired,
    switchStatus: PropTypes.func.isRequired,
    delMember: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    departmentName: '',
    deptPopVisible: false,
  }
  msg = formatMsg(this.props.intl)
  columns = [{
    title: this.msg('fullName'),
    dataIndex: 'name',
    width: 100,
    sorter: true,
    render: (o, record) => this.renderColumnText(record.status, record.name),
  }, {
    title: this.msg('username'),
    width: 100,
    render: (o, record) => this.renderColumnText(
      record.status,
      record.username && record.username.split('@')[0]
    ),
  }, {
    title: this.msg('phone'),
    width: 150,
    render: (o, record) => this.renderColumnText(record.status, record.phone),
  }, {
    title: this.msg('email'),
    dataIndex: 'email',
    width: 200,
    sorter: true,
    render: (o, record) => this.renderColumnText(record.status, record.email),
  }, {
    title: this.msg('department'),
    dataIndex: 'department',
    render: (dept, record) => this.renderColumnText(record.status, dept),
  }, {
    title: this.msg('role'),
    sorter: true,
    dataIndex: 'role_name',
    width: 150,
    filters: [{
      text: this.msg('tenantManager'),
      value: PRESET_TENANT_ROLE.manager.name,
    }, {
      text: this.msg('tenantMember'),
      value: PRESET_TENANT_ROLE.member.name,
    }],
    render: (role, record) => this.renderColumnText(
      record.status,
      PRESET_ROLE_NAME_KEYS[role] ?
        this.msg(PRESET_ROLE_NAME_KEYS[role].text)
        : role,
    ),
  }, {
    title: this.msg('status'),
    dataIndex: 'status',
    width: 80,
    render: (o, record) => {
      let style = { color: '#51C23A' };
      let { text } = ACCOUNT_STATUS.normal;
      if (record.status === ACCOUNT_STATUS.blocked.id) {
        style = { color: '#CCC' };
        text = ACCOUNT_STATUS.blocked.text; // eslint-disable-line
      }
      return <span style={style}>{this.msg(text)}</span>;
    },
  }, {
    title: this.msg('opCol'),
    key: 'OP_COL',
    width: 100,
    fixed: 'right',
    render: (text, record, index) => {
      if (record.role === PRESET_TENANT_ROLE.owner.name) {
        return (
          <PrivilegeCover module="corp" feature="personnel" action="edit">
            <RowAction icon="edit" tooltip={this.msg('modify')} onClick={() => this.toggleUserModal(record.key)} />
          </PrivilegeCover>
        );
      } else if (record.status === ACCOUNT_STATUS.normal.id) {
        return (
          <PrivilegeCover module="corp" feature="personnel" action="edit">
            <RowAction icon="edit" tooltip={this.msg('modify')} onClick={() => this.toggleUserModal(record.key)} />
            <RowAction icon="pause-circle-o" tooltip={this.msg('disable')} onClick={() => this.handleStatusSwitch(record, index)} />
          </PrivilegeCover>
        );
      } else if (record.status === ACCOUNT_STATUS.blocked.id) {
        return (
          <span>
            <PrivilegeCover module="corp" feature="personnel" action="edit">
              <RowAction icon="play-circle-o" tooltip={this.msg('enable')} onClick={() => this.handleStatusSwitch(record, index)} />
            </PrivilegeCover>
            <PrivilegeCover module="corp" feature="personnel" action="delete">
              <RowAction danger icon="delete" tooltip={this.msg('delete')} confirm="确认删除？" onConfirm={() => this.handlePersonnelDel(record)} />
            </PrivilegeCover>
          </span>
        );
      }
      return <span />;
    },
  }]
  dataSource = new DataTable.DataSource({
    fetcher: params => this.props.loadMembers(params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      // 删除完一页时返回上一页
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize,
    }),
    getParams: (pagination, filters, sorter) => {
      const params = {
        tenantId: this.props.tenantId,
        pageSize: pagination.pageSize,
        current: pagination.current,
        sortField: sorter.field,
        sortOrder: sorter.order,
        filters: { ...this.props.filters },
      };
      Object.keys(filters).forEach((key) => { params.filters[key] = filters[key][0]; }); // eslint-disable-line
      params.filters = JSON.stringify(params.filters);
      return params;
    },
  })
  rowSelection = {
    selectedRowKeys: this.state.selectedRowKeys,
    onChange: (selectedRowKeys) => {
      this.setState({ selectedRowKeys });
    },
  }
  handleSelectionClear = () => {
    this.setState({
      selectedRowKeys: [],
    });
  }
  handleDepartNameChange = (ev) => {
    this.setState({ departmentName: ev.target.value });
  }
  handleDeptPopVisibleChange = (visible) => {
    this.setState({ deptPopVisible: visible });
  }
  handleDeptCreate = () => {
    if (this.state.departmentName) {
      this.props.createDepartment(this.props.tenantId, this.state.departmentName).then((result) => {
        if (!result.error) {
          this.setState({ departmentName: '', deptPopVisible: false });
          this.props.loadDepartments(this.props.tenantId);
          this.props.loadMembers({
            tenantId: this.props.tenantId,
            pageSize: this.props.personnelist.pageSize,
            current: 1,
            filters: JSON.stringify({ ...this.props.filters, dept_id: result.data }),
          });
        }
      });
    }
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
    const { tenantId, filters, personnelist: { totalCount, current, pageSize } } = this.props;
    this.props.delMember(record.key, record.login_id, tenantId).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.props.loadMembers({
          tenantId,
          pageSize,
          filters: JSON.stringify(filters),
          current: resolveCurrentPageNumber(totalCount - 1, current, pageSize),
        });
      }
    });
  }
  handleSearch = (searchVal) => {
    const filters = { ...this.props.filters, name: searchVal };
    this.props.loadMembers({
      tenantId: this.props.tenantId,
      pageSize: this.props.personnelist.pageSize,
      current: 1,
      filters: JSON.stringify(filters),
    });
  }
  handleMenuClick = (menukey) => {
    const filters = { ...this.props.filters };
    const { key } = menukey;
    if (key === 'members') {
      filters.dept_id = undefined;
    } else if (!isNaN(key)) { // eslint-disable-line
      filters.dept_id = parseInt(key, 10);
    }
    this.props.loadMembers({
      tenantId: this.props.tenantId,
      pageSize: this.props.personnelist.pageSize,
      current: 1,
      filters: JSON.stringify(filters),
    });
  }
  handleAddDepartMember = () => {
    this.props.openMemberModal();
  }
  handleDepartMembersLoad = () => {
    if (this.props.filters.dept_id &&
      (this.props.personnelist.data.length < this.props.personnelist.pageSize)) {
      this.props.loadMembers({
        tenantId: this.props.tenantId,
        pageSize: this.props.personnelist.pageSize,
        current: this.props.personnelist.current,
        filters: JSON.stringify(this.props.filters),
      });
    }
  }
  handleReloadAllMembers = () => {
    this.props.loadMembers({
      tenantId: this.props.tenantId,
      pageSize: this.props.personnelist.pageSize,
      current: 1,
      filters: JSON.stringify(this.props.filters),
    });
  }
  toggleUserModal = (key) => {
    this.props.toggleUserModal(true, key);
  }
  renderColumnText = (status, text) => {
    let style = {};
    if (status === ACCOUNT_STATUS.blocked.id) {
      style = { color: '#CCC' };
    }
    return <span style={style}>{text}</span>;
  }
  render() {
    const {
      personnelist, departments, filters, loading,
    } = this.props;
    this.dataSource.remotes = personnelist;
    const selectMenuKeys = [];
    let contentHeadAction;
    if (!isNaN(filters.dept_id)) { // eslint-disable-line
      selectMenuKeys.push(filters.dept_id.toString());
      contentHeadAction = (
        <PrivilegeCover module="corp" feature="personnel" action="create">
          <Button type="primary" onClick={this.handleAddDepartMember} icon="user-add">
            {this.msg('newDeptMember')}
          </Button>
        </PrivilegeCover>);
    } else {
      selectMenuKeys.push('members');
      contentHeadAction = (
        <PrivilegeCover module="corp" feature="personnel" action="create">
          <Button type="primary" onClick={() => this.toggleUserModal()} icon="plus-circle-o">
            {this.msg('newUser')}
          </Button>
        </PrivilegeCover>);
    }
    const departmentPopover = (
      <div>
        <Input value={this.state.departmentName} placeholder="部门名称" onChange={this.handleDepartNameChange} />
        <Button type="primary" style={{ width: '100%', marginTop: 10 }} onClick={this.handleDeptCreate}>创建</Button>
      </div>);
    return (
      <Layout>
        <CorpSiderMenu currentKey="members" />
        <Layout>
          <PageHeader title={this.msg('members')} />
          <Content className="page-content" key="main">
            <Card bodyStyle={{ padding: 0 }}>
              <Layout className="main-wrapper">
                <Sider className="nav-sider">
                  <div className="nav-sider-head">
                    <SearchBox onSearch={this.handleSearch} />
                  </div>
                  <Menu
                    defaultOpenKeys={['deptMenu']}
                    mode="inline"
                    selectedKeys={selectMenuKeys}
                    onClick={this.handleMenuClick}
                  >
                    <Menu.Item key="members"><NavLink to="/corp/members"><Icon type="team" />所有成员</NavLink></Menu.Item>
                    <SubMenu key="deptMenu" title={<span><MdIcon mode="fontello" type="sitemap" />部门</span>}>
                      {
                        departments.map(br => <Menu.Item key={br.id}>{br.name}</Menu.Item>)
                      }
                    </SubMenu>
                  </Menu>
                  <div className="nav-sider-footer">
                    <Popover
                      content={departmentPopover}
                      placement="bottom"
                      title="创建部门"
                      trigger="click"
                      visible={this.state.deptPopVisible}
                      onVisibleChange={this.handleDeptPopVisibleChange}
                    >
                      <Button type="dashed" icon="plus-circle">创建部门</Button>
                    </Popover>
                  </div>
                </Sider>
                <Content className="nav-content">
                  <DataTable
                    withBorder={false}
                    toolbarActions={contentHeadAction}
                    rowSelection={this.rowSelection}
                    columns={this.columns}
                    loading={loading}
                    dataSource={this.dataSource}
                  />
                </Content>
              </Layout>
            </Card>
            <AddMemberModal reload={this.handleDepartMembersLoad} />
            <AddUser reload={this.handleReloadAllMembers} />
          </Content>
        </Layout>
      </Layout>
    );
  }
}
