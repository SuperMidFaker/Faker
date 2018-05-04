import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, Menu, Layout } from 'antd';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import DataTable from 'client/components/DataTable';
import SearchBox from 'client/components/SearchBox';
import PageHeader from 'client/components/PageHeader';
import ToolbarAction from 'client/components/ToolbarAction';
import { format } from 'client/common/i18n/helpers';
import { loadVendors, showVendorModal, deleteVendor } from 'common/reducers/sofVendors';
import { PARTNER_ROLES } from 'common/constants';
import TrimSpan from 'client/components/trimSpan';
import messages from './message.i18n';
import VendorModal from './modals/vendorModal';

const formatMsg = format(messages);
const { Content } = Layout;

function fetchData({ state, dispatch }) {
  return dispatch(loadVendors(state.account.tenantId));
}
@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    vendors: state.sofVendors.vendors,
    loading: state.sofVendors.loading,
    loaded: state.sofVendors.loaded,
  }),
  { loadVendors, deleteVendor, showVendorModal }
)
@connectNav({
  depth: 2,
  moduleName: 'scof',
})
@Form.create()
export default class SupplierList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    vendors: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.number })).isRequired,
    loadVendors: PropTypes.func.isRequired,
    deleteVendor: PropTypes.func.isRequired,
    showVendorModal: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
  }
  state = {
    vendor: {},
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.vendors !== this.props.vendors) {
      this.setState({
        vendor: nextProps.vendors.length === 0 ? {} : nextProps.vendors[0],
      });
    }
  }
  msg = key => formatMsg(this.props.intl, key)
  dataSource = new DataTable.DataSource({
    fetcher: params => this.props.loadVendors(this.props.tenantId, params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize,
      showTotal: total => `共 ${total} 条`,
    }),
    getParams: (pagination, tblfilters) => {
      const newfilters = { ...this.props.listFilter, ...tblfilters[0] };
      const params = {
        pageSize: pagination.pageSize,
        current: pagination.current,
        filter: JSON.stringify(newfilters),
      };
      return params;
    },
    remotes: this.props.vendors,
  })
  columns = [{
    title: this.msg('supplierCode'),
    dataIndex: 'code',
    render: o => (<span className="menu-sider-item"><TrimSpan text={o} maxLen={22} /></span>),
  }, {
    title: this.msg('supplierName'),
    dataIndex: 'name',
    render: o => (<span className="menu-sider-item"><TrimSpan text={o} maxLen={22} /></span>),
  }];

  handleTableLoad = () => {
    this.props.loadVendors(this.props.tenantId);
  }
  handleDelVendor = () => {
    this.props.deleteVendor(this.state.vendor.id, PARTNER_ROLES.CUS).then(() => {
      this.handleTableLoad();
    });
  }
  handleSearch = () => {
  }
  render() {
    const toolbarActions = (<span>
      <SearchBox
        placeholder={this.msg('searchPlaceholder')}
        onSearch={this.handleSearch}
      />
    </span>);
    const dropdown = (
      <Menu onClick={this.handleMenuClick}>
        <Menu.Item key="1">{this.msg('import')}</Menu.Item>
      </Menu>
    );
    return (
      <Layout>
        <PageHeader title={this.msg('vendor')}>
          <PageHeader.Actions>
            <ToolbarAction icon="export" label={this.msg('export')} />
            <ToolbarAction primary icon="plus" label={this.msg('create')} dropdown={dropdown} onClick={() => this.props.showVendorModal('add')} />
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content">
          <DataTable
            toolbarActions={toolbarActions}
            dataSource={this.dataSource}
            columns={this.columns}
            rowKey="id"
            loading={this.props.loading}
          />
        </Content>
        <VendorModal onOk={this.handleTableLoad} />
      </Layout>
    );
  }
}
