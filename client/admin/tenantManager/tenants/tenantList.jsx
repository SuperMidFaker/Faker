import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import {
  loadTenants, delTenant, switchStatus, setFormData,
} from 'common/reducers/tenants';
import { Button, message, Popconfirm } from 'antd';
import Table from 'client/components/remoteAntTable';
import NavLink from '../../../components/nav-link';
import { resolveCurrentPageNumber } from 'client/util/react-ant';
import connectFetch from 'client/common/decorators/connect-fetch';
import { ACCOUNT_STATUS }
  from 'common/constants';

function fetchData({ state, dispatch, cookie }) {
  return dispatch(loadTenants(cookie, {
    pageSize: state.tenants.corplist.pageSize,
    currentPage: state.tenants.corplist.current,
  }));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    corplist: state.tenants.corplist,
    loading: state.tenants.loading,
  }),
  {
    loadTenants, delTenant, switchStatus, setFormData,
  }
)

export default class TenantList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    corplist: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    switchStatus: PropTypes.func.isRequired,
    delTenant: PropTypes.func.isRequired,
    loadTenants: PropTypes.func.isRequired,
    setFormData: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
  };
  handleSelectionClear = () => {
    this.setState({ selectedRowKeys: [] });
  }
  handleNavigationTo(to, query) {
    this.context.router.push({ pathname: to, query });
  }
  handleTenantDel(id) {
    const { corplist: { totalCount, current, pageSize } } = this.props;
    this.props.delTenant(id).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.props.loadTenants(null, {
          pageSize,
          currentPage: resolveCurrentPageNumber(totalCount - 1, current, pageSize),
        });
      }
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
  handleNewTenant = () => {
    this.props.setFormData({
      name: '',
      code: '',
      subdomain: '',
      phone: '',
      tenantAppValueList: [],
      aspect: 0,
      email: '',
      logo: '',
    });
    this.handleNavigationTo('/manager/tenants/create');
  }
  renderColumnText(status, text) {
    let style = {};
    if (status === ACCOUNT_STATUS.blocked.name) {
      style = { color: '#CCC' };
    }
    return <span style={style}>{text}</span>;
  }
  render() {
    const { corplist, loading } = this.props;
    const dataSource = new Table.DataSource({
      fetcher: params => this.props.loadTenants(null, params),
      resolve: result => result.data,
      getPagination: (result, currentResolve) => ({
        total: result.totalCount,
        current: currentResolve(result.totalCount, result.current, result.pageSize),
        showSizeChanger: true,
        showQuickJumper: false,
        pageSize: result.pageSize,
      }),
      getParams: (pagination, filters, sorter) => {
        const params = {
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
      title: '租户id',
      dataIndex: 'key',
      render: (o, record) => this.renderColumnText(record.status, record.key),
    }, {
      title: '公司名称',
      dataIndex: 'name',
      render: (o, record) => this.renderColumnText(record.status, record.name),
    }, {
      title: '租户代码',
      dataIndex: 'subCode',
      render: (o, record) => this.renderColumnText(record.status, record.subCode),
    }, {
      title: '联系人',
      dataIndex: 'contact',
      render: (o, record) => this.renderColumnText(record.status, record.contact),
    }, {
      title: '手机号',
      dataIndex: 'phone',
      render: (o, record) => this.renderColumnText(record.status, record.phone),
    }, {
      title: '邮箱',
      dataIndex: 'email',
      render: (o, record) => this.renderColumnText(record.status, record.email),
    }, {
      title: '状态',
      width: 50,
      render: (o, record) => {
        let style = { color: '#51C23A' };
        let text = '正常';
        if (record.status === ACCOUNT_STATUS.blocked.name) {
          style = { color: '#CCC' };
          text = '停用';
        }
        return <span style={style}>{text}</span>;
      },
    }, {
      title: '操作',
      width: 100,
      render: (text, record, index) => {
        if (record.status === ACCOUNT_STATUS.normal.name) {
          return (
            <span>
              <NavLink to={`/manager/tenants/edit/${record.key}`}>
              修改
              </NavLink>
              <span className="ant-divider" />
              <a role="button" onClick={() => this.handleStatusSwitch(record, index)}>
              停用
              </a>
            </span>);
        } else if (record.status === ACCOUNT_STATUS.blocked.name) {
          return (
            <span>
              <Popconfirm placement="top" title={`确认删除 ${record.name}`} onConfirm={() => this.handleTenantDel(record.key)} onCancel={() => {}} onVisibleChange={() => {}}>
                <a role="button" href="#">
              删除
                </a>
              </Popconfirm>
              <span className="ant-divider" />
              <a role="button" onClick={() => this.handleStatusSwitch(record, index)}>
              启用
              </a>
            </span>);
        } else {
          return <span />;
        }
      },
    }];
    return (
      <div className="main-content">
        <div className="page-body">
          <div className="toolbar">
            <Button type="primary" icon="plus-circle-o" onClick={this.handleNewTenant}>
                新建租户
            </Button>
          </div>
          <div className="panel-body table-panel">
            <Table rowSelection={rowSelection} columns={columns} loading={loading} dataSource={dataSource} />
          </div>
          <div className={`bottom-fixed-row ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
            <Button size="large" onClick={this.handleSelectionClear} className="pull-right">
            清除所选
            </Button>
          </div>
        </div>
      </div>);
  }
}
