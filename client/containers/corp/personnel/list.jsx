import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { loadPersonnel, loadTenantsByMaster, delPersonnel, editPersonnel, switchTenant, switchStatus, submitPersonnel } from '../../../../universal/redux/reducers/personnel';
import { isLoaded } from '../../../../reusable/common/redux-actions';
import {Table, Button, AntIcon, Select, Row, Col, message} from '../../../../reusable/ant-ui';
import NavLink from '../../../../reusable/components/nav-link';
import connectFetch from '../../../../reusable/decorators/connect-fetch';
import {ACCOUNT_STATUS, TENANT_ROLE} from '../../../../universal/constants';

function fetchData({state, dispatch, cookie}) {
  const promises = [];
  if (!isLoaded(state, 'personnel')) {
    let p = dispatch(loadTenantsByMaster(cookie, state.account.tenantId));
    promises.push(p);
    p = dispatch(loadPersonnel(cookie, {
      tenantId: state.account.tenantId,
      pageSize: state.personnel.personnelist.pageSize,
      currentPage: state.personnel.personnelist.current
    }));
    promises.push(p);
  }
  return promises;
}
@connectFetch()(fetchData)
@connect(
  state => ({
    personnelist: state.personnel.personnelist,
    branches: state.personnel.branches,
    tenantId: state.personnel.tenantId,
    loading: state.personnel.loading,
    needUpdate: state.personnel.needUpdate
  }),
  { delPersonnel, editPersonnel, switchTenant, switchStatus, submitPersonnel, loadPersonnel })
export default class PersonnelSetting extends React.Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
    selectIndex: PropTypes.number,
    needUpdate: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
    personnelist: PropTypes.object.isRequired,
    branches: PropTypes.array.isRequired,
    tenantId: PropTypes.string.isRequired,
    loadPersonnel: PropTypes.func.isRequired,
    switchTenant: PropTypes.func.isRequired,
    switchStatus: PropTypes.func.isRequired,
    submitPersonnel: PropTypes.func.isRequired,
    delPersonnel: PropTypes.func.isRequired,
    editPersonnel: PropTypes.func.isRequired
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
      currentPage: personnelist.current
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.props.switchTenant(val);
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
  handlePersonnelReg() {
    this.refs.personnelform.reset();
  }
  handlePersonnelEdit(idx) {
    this.refs.personnelform.reset();
  }
  handlePersonnelDel(record) {
    this.props.delPersonnel(record.key, record.accountId);
  }
  handlePersonnelSubmit() {
  }
  renderColumnText(status, text) {
    let style = {};
    if (status === ACCOUNT_STATUS.blocked.id) {
      style = {color: '#CCC'};
    }
    return <span style={style}>{text}</span>;
  }
  render() {
    const { tenantId, personnelist, branches, loading, needUpdate } = this.props;
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
        pageSize: result.pageSize
      }),
      getParams: (pagination, filters, sorter) => {
        const params = {
          tenantId,
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
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({selectedRowKeys});
      }
    };
    const columns = [{
      title: '姓名',
      render: (o, record) => this.renderColumnText(record.status, record.name)
    }, {
      title: '用户名',
      render: (o, record) => this.renderColumnText(record.status, record.loginName)
    }, {
      title: '手机号',
      render: (o, record) => this.renderColumnText(record.status, record.phone)
    }, {
      title: '邮箱',
      render: (o, record) => this.renderColumnText(record.status, record.email)
    }, {
      title: '职位',
      render: (o, record) => this.renderColumnText(record.status, record.position)
    }, {
      title: '角色',
      render: (o, record) => this.renderColumnText(record.status, record.role)
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
              <span className="ant-divider"></span>
              <a href="#" className="ant-dropdown-link">
              更多 <AntIcon type="down" />
              </a>
            </span>);
        } else if (record.status === ACCOUNT_STATUS.blocked.id) {
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
      <div className="main-content">
        <div className="page-header">
          <h2>用户管理</h2>
        </div>
        <div className="page-body">
          <div className="panel-header">
            <div className="pull-right action-btns">
              <Button type="primary" onClick={() => this.handleNavigationTo('/corp/personnel/new')}>
                <span>新增</span>
              </Button>
            </div>
            <span>所属组织</span>
            <Select style={{width: 200}} value={tenantId}
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
