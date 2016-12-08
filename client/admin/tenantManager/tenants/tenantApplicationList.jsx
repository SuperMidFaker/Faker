import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import {
  loadPartners, setFormData,
} from 'common/reducers/tenants';
import { Button } from 'antd';
import Table from 'client/components/remoteAntTable';
import connectFetch from 'client/common/decorators/connect-fetch';

function fetchData({ state, dispatch, cookie }) {
  return dispatch(loadPartners(cookie, {
    pageSize: state.tenants.partners.pageSize,
    currentPage: state.tenants.partners.current,
  }));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    partners: state.tenants.partners,
    loading: state.tenants.loading,
  }),
  {
    loadPartners, setFormData,
  }
)

export default class TenantApplicationList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    partners: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    loadPartners: PropTypes.func.isRequired,
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
  handleCreateTenant = (partner) => {
    const formData = {
      name: partner.name,
      code: partner.partner_unique_code,
      phone: partner.phone,
      aspect: 0,
      email: partner.email,
    };
    this.props.setFormData(formData);
    this.handleNavigationTo('/manager/tenants/create');
  }
  render() {
    const { partners, loading } = this.props;
    const dataSource = new Table.DataSource({
      fetcher: params => this.props.loadPartners(null, params),
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
      remotes: partners,
    });
    // 通过 rowSelection 对象表明需要行选择
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const columns = [{
      title: '公司名称',
      dataIndex: 'name',
    }, {
      title: '企业唯一标识码',
      dataIndex: 'partner_unique_code',
    }, {
      title: '企业代码',
      dataIndex: 'partner_code',
    }, {
      title: '手机号',
      dataIndex: 'phone',
    }, {
      title: '邮箱',
      dataIndex: 'email',
    }, {
      title: '操作',
      width: 100,
      render: (text, record) => (
        <a role="button" onClick={() => this.handleCreateTenant(record)}>
          开通
          </a>
        ),
    }];
    return (
      <div className="main-content">
        <div className="page-body">
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
