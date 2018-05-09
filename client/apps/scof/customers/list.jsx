import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Menu, Layout } from 'antd';
import moment from 'moment';
import connectNav from 'client/common/decorators/connect-nav';
import PageHeader from 'client/components/PageHeader';
import DataTable from 'client/components/DataTable';
import RowAction from 'client/components/RowAction';
import SearchBox from 'client/components/SearchBox';
import TrimSpan from 'client/components/trimSpan';
import ToolbarAction from 'client/components/ToolbarAction';
import { loadPartnerList, showCustomerModal, showCustomerPanel, changePartnerStatus, deletePartner } from 'common/reducers/partner';
import { PARTNER_ROLES } from 'common/constants';
import CustomerPanel from './pane/customerPanel';
import CustomerModal from './modals/customerModal';
import { formatMsg, formatGlobalMsg } from '../message.i18n';

const { Content } = Layout;

@injectIntl
@connect(
  state => ({
    customerlist: state.partner.partnerlist,
    listFilter: state.partner.partnerFilter,
    loading: state.partner.loading,
    loaded: state.partner.loaded,
  }),
  {
    loadPartnerList, changePartnerStatus, deletePartner, showCustomerPanel, showCustomerModal,
  }
)
@connectNav({
  depth: 2,
  moduleName: 'scof',
})
export default class VendorList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    loaded: PropTypes.bool.isRequired,
    customerlist: PropTypes.shape({ totalCount: PropTypes.number }).isRequired,
    loadPartnerList: PropTypes.func.isRequired,
    deletePartner: PropTypes.func.isRequired,
    showCustomerModal: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
  }
  componentDidMount() {
    this.handleTableLoad();
  }
  componentWillReceiveProps(nextProps) {
    if (!nextProps.loaded) {
      this.handleTableLoad();
    }
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  dataSource = new DataTable.DataSource({
    fetcher: params => this.handleTableLoad(params.pageSize, params.current),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize,
      showTotal: total => `共 ${total} 条`,
    }),
    getParams: (pagination) => {
      const params = {
        pageSize: pagination.pageSize,
        current: pagination.current,
      };
      return params;
    },
    remotes: this.props.customerlist,
  })
  columns = [{
    title: this.msg('customerCode'),
    dataIndex: 'partner_code',
    width: 100,
  }, {
    title: this.msg('customerName'),
    dataIndex: 'name',
    render: o => (<span className="menu-sider-item"><TrimSpan text={o} maxLen={22} /></span>),
  }, {
    title: this.msg('displayName'),
    dataIndex: 'display_name',
    width: 180,
  }, {
    title: this.msg('uscCode'),
    dataIndex: 'partner_unique_code',
    width: 200,
  }, {
    title: this.msg('customsCode'),
    dataIndex: 'customs_code',
    width: 100,
  }, {
    title: this.msg('contact'),
    dataIndex: 'contact',
    width: 100,
  }, {
    title: this.msg('phone'),
    dataIndex: 'phone',
    width: 100,
  }, {
    title: this.msg('email'),
    dataIndex: 'email',
    width: 150,
  }, {
    title: this.msg('country'),
    dataIndex: 'country',
    width: 100,
  }, {
    title: this.msg('internalId'),
    dataIndex: 'id',
    width: 100,
  }, {
    title: this.gmsg('createdDate'),
    dataIndex: 'created_date',
    render: cdt => cdt && moment(cdt).format('YYYY/MM/DD'),
    width: 100,
  }, {
    title: this.gmsg('op'),
    width: 150,
    fixed: 'right',
    render: (_, row) => {
      if (!row.status) {
        return (<span>
          <RowAction onClick={this.handleVendorToggle} icon="play-circle" tooltip={this.gmsg('opEnable')} row={row} />
          <RowAction danger confirm={this.gmsg('confirmOp')} onClick={this.handleVendorDel} icon="delete" tooltip={this.gmsg('delete')} row={row} />
        </span>);
      }
      return (<span>
        <RowAction onClick={this.handleVendorEdit} icon="edit" tooltip={this.gmsg('edit')} row={row} />
        <RowAction onClick={this.handleVendorToggle} icon="pause-circle" tooltip={this.gmsg('opDisable')} row={row} />
      </span>);
    },
  }];

  handleTableLoad = (pageSize, current, filters) => {
    const { customerlist, listFilter } = this.props;
    const pageSizeArg = pageSize || customerlist.pageSize;
    const currentArg = current || customerlist.current;
    const filtersArg = JSON.stringify(filters || listFilter);
    this.props.loadPartnerList(PARTNER_ROLES.CUS, pageSizeArg, currentArg, filtersArg);
  }
  handleVendorAdd = () => {
    this.props.showCustomerModal('add');
  }
  handleVendorEdit = (customer) => {
    this.props.showCustomerPanel({ visible: true, customer });
  }
  handleVendorToggle = (customer) => {
    const newstatus = customer.status === 1 ? 0 : 1;
    this.props.changePartnerStatus(customer.id, newstatus);
  }
  handleVendorDel = (customer) => {
    this.props.deletePartner(customer.id);
  }
  handleSearch = (value) => {
    const filters = { ...this.props.listFilter, name: value };
    this.handleTableLoad(null, null, filters);
  }
  render() {
    const toolbarActions = (<span style={{ width: 500 }}>
      <SearchBox
        placeholder={this.msg('partnerSearchPlaceholder')}
        onSearch={this.handleSearch}
      />
    </span>);
    const dropdown = (
      <Menu onClick={this.handleMenuClick}>
        <Menu.Item key="impt">{this.gmsg('import')}</Menu.Item>
      </Menu>
    );
    const { customerlist, loading } = this.props;
    this.dataSource.remotes = customerlist;
    return (
      <Layout>
        <PageHeader title={this.msg('customers')}>
          <PageHeader.Actions>
            <ToolbarAction icon="export" label={this.gmsg('export')} />
            <ToolbarAction primary icon="plus" label={this.gmsg('create')} dropdown={dropdown} onClick={this.handleVendorAdd} />
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content">
          <DataTable
            toolbarActions={toolbarActions}
            dataSource={this.dataSource}
            columns={this.columns}
            rowKey="id"
            loading={loading}
          />
        </Content>
        <CustomerPanel />
        <CustomerModal onOk={this.handleTableLoad} />
      </Layout>
    );
  }
}
