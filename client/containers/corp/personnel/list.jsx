import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { loadPersonnel, loadTenantsByMaster, delPersonnel, changeCurrentPage, switchTenant, switchStatus} from '../../../../universal/redux/reducers/personnel';
import {Table, Button, Select, Row, Col, message} from '../../../../reusable/ant-ui';
import NavLink from '../../../../reusable/components/nav-link';
import SearchBar from '../../../../reusable/components/search-bar';
import connectFetch from '../../../../reusable/decorators/connect-fetch';
import {ACCOUNT_STATUS, TENANT_ROLE} from '../../../../universal/constants';

function fetchData({state, dispatch, location, cookie}) {
  const promises = [];
  if (location.action !== 'POP' || cookie) {
    // 当从Edit页面切回来不重新加载
    // 从其他页面切过来或者在服务端重新加载
    let p = dispatch(loadTenantsByMaster(cookie, state.account.tenantId));
    promises.push(p);
    p = dispatch(loadPersonnel(cookie, {
      tenantId: state.account.tenantId,
      pageSize: state.personnel.personnelist.pageSize,
      currentPage: state.personnel.personnelist.current
    }));
    promises.push(p);
  }
  return Promise.all(promises);
}
@connectFetch()(fetchData)
@connect(
  state => ({
    personnelist: state.personnel.personnelist,
    branches: state.personnel.branches,
    tenant: state.personnel.tenant,
    loading: state.personnel.loading,
    needUpdate: state.personnel.needUpdate
  }),
  { delPersonnel, changeCurrentPage, switchTenant, switchStatus, loadPersonnel })
export default class PersonnelSetting extends React.Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
    selectIndex: PropTypes.number,
    needUpdate: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
    personnelist: PropTypes.object.isRequired,
    branches: PropTypes.array.isRequired,
    tenant: PropTypes.object.isRequired,
    loadPersonnel: PropTypes.func.isRequired,
    switchTenant: PropTypes.func.isRequired,
    switchStatus: PropTypes.func.isRequired,
    delPersonnel: PropTypes.func.isRequired,
    changeCurrentPage: PropTypes.func.isRequired
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
          if ('' + br.key === val) {
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
    this.props.delPersonnel(record.key, record.loginId, this.props.tenant);
  }
  handleSearch(searchVal) {
    // OR this name condition
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
    const { tenant, personnelist, branches, loading, needUpdate } = this.props;
    const dataSource = new Table.DataSource({
      fetcher: (params) => this.props.loadPersonnel(null, params),
      resolve: (result) => result.data,
      needUpdate,
      getPagination: (result) => ({
        total: result.totalCount,
        // 删除完一页时返回上一页
        current: (result.current - 1) * result.pageSize <= result.totalCount &&
          result.current * result.pageSize > result.totalCount ?
          Math.ceil(result.totalCount / result.pageSize) : result.current,
        showSizeChanger: true,
        showQuickJumper: false,
        onChange: (page) => this.props.changeCurrentPage(page),
        pageSizeOptions: [`${result.pageSize}`, `${2 * result.pageSize}`, `${3 * result.pageSize}`],
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
      }
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
      render: (o, record) => this.renderColumnText(record.status, record.loginName)
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
        <Row>
          <Col span="6">
            <h2>用户管理</h2>
          </Col>
          <Col span="18">
          <div className="pull-right action-btns">
            <SearchBar placeholder="搜索姓名/手机号/邮箱" onInputSearch={(val) => this.handleSearch(val)} />
            <Button type="ghost" onClick={() => this.handleNavigationTo('/corp/personnel/new')}>
              <span>高级搜索</span>
            </Button>
          </div>
          </Col>
          </Row>
        </div>
        <div className="page-body">
          <div className="panel-header">
            <div className="pull-right action-btns">
              <Button type="primary" onClick={() => this.handleNavigationTo('/corp/personnel/new')}>
                <span>新增</span>
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
          <Table rowSelection={rowSelection} columns={columns} loading={loading} remoteData={personnelist} dataSource={dataSource}/>
          <div className={'bottom-fixed-row' + (this.state.selectedRowKeys.length === 0 ? ' hide' : '')}>
            <Row>
              <Col span="2" offset="20">
                <Button size="large" onClick={() => this.handleSelectionClear()}>清除选择</Button>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    );
  }
}
