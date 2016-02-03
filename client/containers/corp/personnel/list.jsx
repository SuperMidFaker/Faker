import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { loadPersonnel, loadTenantsByMaster, delPersonnel, switchTenant, switchStatus } from
'../../../../universal/redux/reducers/personnel';
import { Table, Button, Select, message } from 'ant-ui';
import NavLink from '../../../../reusable/components/nav-link';
import SearchBar from '../../../../reusable/components/search-bar';
import connectFetch from '../../../../reusable/decorators/connect-fetch';
import { isLoaded } from '../../../../reusable/common/redux-actions';
import { ACCOUNT_STATUS, TENANT_ROLE } from '../../../../universal/constants';

function fetchData({state, dispatch, cookie}) {
  const promises = [];
  if (!isLoaded(state, 'personnel')) {
    let p = dispatch(loadTenantsByMaster(cookie, state.account.tenantId));
    promises.push(p);
    // 当前选择租户可能被删除,所以重新加载到主租户
    p = dispatch(loadPersonnel(cookie, {
      tenantId: state.account.tenantId,
      pageSize: state.personnel.personnelist.pageSize,
      currentPage: state.personnel.personnelist.current
    }));
    promises.push(p);
  }
  // 分别加载当前用户所有的租户列表和该用户所在租户下用户列表
  // 返回多个promise结果
  return Promise.all(promises);
}
@connectFetch()(fetchData)
@connect(
  state => ({
    personnelist: state.personnel.personnelist,
    branches: state.personnel.branches,
    tenant: state.personnel.tenant,
    code: state.account.code,
    loading: state.personnel.loading
  }),
  { delPersonnel, switchTenant, switchStatus, loadPersonnel })
export default class PersonnelSetting extends React.Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
    selectIndex: PropTypes.number,
    code: PropTypes.string.isRequired,
    loading: PropTypes.bool.isRequired,
    personnelist: PropTypes.object.isRequired,
    branches: PropTypes.array.isRequired,
    tenant: PropTypes.object.isRequired,
    loadPersonnel: PropTypes.func.isRequired,
    switchTenant: PropTypes.func.isRequired,
    switchStatus: PropTypes.func.isRequired,
    delPersonnel: PropTypes.func.isRequired
  }
  constructor() {
    super();
    this.state = {
      selectedRowKeys: []
    };
  }
  handleSelectionClear() {
    this.setState({selectedRowKeys: []});
  }
  handleTenantSwitch(val) {
    const {personnelist} = this.props;
    this.props.loadPersonnel(null, {
      tenantId: val,
      pageSize: personnelist.pageSize,
      currentPage: 1
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        let tenant;
        this.props.branches.forEach(br => {
          if (`${br.key}` === val) {
            tenant = {
              id: br.key,
              parentId: br.parentId
            };
            return;
          }
        });
        this.props.switchTenant(tenant);
      }
    });
  }
  handleNavigationTo(to, query) {
    this.props.history.pushState(null, to, query);
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
    this.props.delPersonnel(record.key, record.loginId, this.props.tenant).then(result => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.props.loadPersonnel(null, {
          tenantId: this.props.tenant.id,
          pageSize: this.props.personnelist.pageSize,
          currentPage: 1
        });
      }
    });
  }
  handleSearch(searchVal) {
    // OR name condition
    const filters = [[{
      name: 'name',
      value: searchVal
    }, {
      name: 'email',
      value: searchVal
    }, {
      name: 'phone',
      value: searchVal
    }]];
    // todo how to concatenation the table sort filter params
    // in new Table impl the filter and sort can't be emptied
    this.props.loadPersonnel(null, {
      tenantId: this.props.tenant.id,
      pageSize: this.props.personnelist.pageSize,
      currentPage: 1,
      filters: JSON.stringify(filters)
    });
  }
  renderColumnText(status, text) {
    let style = {};
    if (status === ACCOUNT_STATUS.blocked.id) {
      style = {color: '#CCC'};
    }
    return <span style={style}>{text}</span>;
  }
  render() {
    const { code, tenant, personnelist, branches, loading } = this.props;
    const dataSource = new Table.DataSource({
      fetcher: (params) => this.props.loadPersonnel(null, params),
      resolve: (result) => result.data,
      getPagination: (result, resolve) => ({
        total: result.totalCount,
        // 删除完一页时返回上一页
        current: resolve(result.totalCount, result.current, result.pageSize),
        showSizeChanger: true,
        showQuickJumper: false,
        pageSize: result.pageSize
      }),
      getParams: (pagination, filters, sorter) => {
        const params = {
          tenantId: tenant.id,
          pageSize: pagination.pageSize,
          currentPage: pagination.current,
          sortField: sorter.field,
          sortOrder: sorter.order,
          filters: []
        };
        for (const key in filters) {
          if (filters[key]) {
            params.filters.push({
              name: key,
              value: filters[key][0]
            });
          }
        }
        params.filters = JSON.stringify(params.filters);
        return params;
      },
      remotes: personnelist
    });
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({selectedRowKeys});
      }
    };
    const columns = [{
      title: '姓名',
      dataIndex: 'name',
      sorter: true,
      render: (o, record) => this.renderColumnText(record.status, record.name)
    }, {
      title: '用户名',
      render: (o, record) => this.renderColumnText(record.status, `${record.loginName}@${code}`)
    }, {
      title: '手机号',
      render: (o, record) => this.renderColumnText(record.status, record.phone)
    }, {
      title: '邮箱',
      dataIndex: 'email',
      sorter: true,
      render: (o, record) => this.renderColumnText(record.status, record.email)
    }, {
      title: '职位',
      render: (o, record) => this.renderColumnText(record.status, record.position)
    }, {
      title: '角色',
      sorter: true,
      dataIndex: 'role',
      filters: [{
        text: TENANT_ROLE.manager.text,
        value: TENANT_ROLE.manager.name
      }, {
        text: TENANT_ROLE.member.text,
        value: TENANT_ROLE.member.name
      }],
      render: (o, record) => this.renderColumnText(record.status, TENANT_ROLE[record.role].text)
    }, {
      title: '状态',
      render: (o, record) => {
        let style = {color: '#51C23A'};
        let text = ACCOUNT_STATUS.normal.text;
        if (record.status === ACCOUNT_STATUS.blocked.id) {
          style = {color: '#CCC'};
          text = ACCOUNT_STATUS.blocked.text;
        }
        return <span style={style}>{text}</span>;
      }
    }, {
      title: '操作',
      width: 150,
      render: (text, record, index) => {
        if (record.role === TENANT_ROLE.owner.name) {
          return (
            <span>
              <NavLink to={`/corp/personnel/edit/${record.key}`}>修改</NavLink>
            </span>);
        } else if (record.status === ACCOUNT_STATUS.normal.id) {
          return (
            <span>
              <NavLink to={`/corp/personnel/edit/${record.key}`}>修改</NavLink>
              <span className="ant-divider"></span>
              <a role="button" onClick={() => this.handleStatusSwitch(record, index)}>停用</a>
            </span>);
        } else if (record.status === ACCOUNT_STATUS.blocked.id) {
          return (
            <span>
              <a role="button" onClick={() => this.handlePersonnelDel(record)}>删除</a>
              <span className="ant-divider"></span>
              <a role="button" onClick={() => this.handleStatusSwitch(record, index)}>启用</a>
            </span>);
        } else {
          return <span />;
        }
      }
    }];
    return (
      <div className="main-content">
        <div className="page-header">
          <div className="pull-right action-btns">
            <SearchBar placeholder="搜索姓名/手机号/邮箱" onInputSearch={(val) => this.handleSearch(val)} />
            <a role="button">高级搜索</a>
          </div>
          <h2>用户管理</h2>
        </div>
        <div className="page-body">
          <div className="panel-header">
            <div className="pull-right action-btns">
              <Button type="primary" onClick={() => this.handleNavigationTo('/corp/personnel/new')}>
                <span>添加用户</span>
              </Button>
            </div>
            <span style={{paddingRight: 10, color: '#09C', fontSize: 13}}>所属组织</span>
            <Select style={{width: 200}} value={`${tenant.id}`}
              onChange={(value) => this.handleTenantSwitch(value)}>
            {
              branches.map(br => <Select.Option key={br.key} value={`${br.key}`}>{br.name}</Select.Option>)
            }
            </Select>
          </div>
          <div className="panel-body body-responsive">
            <Table rowSelection={rowSelection} columns={columns} loading={loading} dataSource={dataSource}/>
          </div>
          <div className={`bottom-fixed-row ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
            <Button size="large" onClick={() => this.handleSelectionClear()} className="pull-right">清除选择</Button>
          </div>
        </div>
      </div>
    );
  }
}
