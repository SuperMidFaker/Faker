import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Icon, Menu, Layout } from 'antd';
import moment from 'moment';
import connectNav from 'client/common/decorators/connect-nav';
import PageHeader from 'client/components/PageHeader';
import DataTable from 'client/components/DataTable';
import RowAction from 'client/components/RowAction';
import SearchBox from 'client/components/SearchBox';
import ToolbarAction from 'client/components/ToolbarAction';
import { loadPartnerList, showPartnerModal, changePartnerStatus, deletePartner } from 'common/reducers/partner';
import { PARTNER_ROLES } from 'common/constants';
import { createFilename } from 'client/util/dataTransform';
import ImportDataPanel from 'client/components/ImportDataPanel';
import PartnerModal from '../modal/partnerModal';
import { formatMsg, formatGlobalMsg } from '../message.i18n';

const { Content } = Layout;

@injectIntl
@connect(
  state => ({
    vendors: state.partner.partnerlist,
    listFilter: state.partner.partnerFilter,
    loading: state.partner.loading,
    loaded: state.partner.loaded,
  }),
  {
    loadPartnerList, changePartnerStatus, deletePartner, showPartnerModal,
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
    vendors: PropTypes.shape({ totalCount: PropTypes.number }).isRequired,
    loadPartnerList: PropTypes.func.isRequired,
    deletePartner: PropTypes.func.isRequired,
    showPartnerModal: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
  }
  state = {
    importPanelVisible: false,
  }
  componentDidMount() {
    this.handleTableLoad(null, 1);
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
    remotes: this.props.vendors,
  })
  columns = [{
    title: this.msg('vendorCode'),
    dataIndex: 'partner_code',
    fixed: 'left',
    width: 100,
  }, {
    title: this.msg('vendorName'),
    dataIndex: 'name',
    width: 300,
  }, {
    title: this.msg('displayName'),
    dataIndex: 'display_name',
    width: 180,
  }, {
    title: this.msg('englishName'),
    dataIndex: 'en_name',
    width: 150,
  }, {
    title: this.msg('country'),
    dataIndex: 'country',
    width: 100,
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
    title: this.msg('internalId'),
    dataIndex: 'id',
    width: 100,
  }, {
    title: this.gmsg('createdDate'),
    dataIndex: 'created_date',
    render: cdt => cdt && moment(cdt).format('YYYY/MM/DD'),
    width: 100,
  }, {
    dataIndex: 'SPACER_COL',
  }, {
    title: this.gmsg('op'),
    width: 90,
    className: 'table-col-ops',
    fixed: 'right',
    render: (_, row) => {
      if (!row.status) {
        return (<span>
          <RowAction onClick={this.handleVendorToggle} icon="play-circle" tooltip={this.gmsg('opEnable')} row={row} />
          <RowAction danger confirm={this.gmsg('confirmOp')} onConfirm={this.handleVendorDel} icon="delete" tooltip={this.gmsg('delete')} row={row} />
        </span>);
      }
      return (<span>
        <RowAction onClick={this.handleVendorEdit} icon="edit" tooltip={this.gmsg('edit')} row={row} />
        <RowAction onClick={this.handleVendorToggle} icon="pause-circle-o" tooltip={this.gmsg('opDisable')} row={row} />
      </span>);
    },
  }];

  handleTableLoad = (pageSize, current, filters) => {
    const { vendors, listFilter } = this.props;
    const pageSizeArg = pageSize || vendors.pageSize;
    const currentArg = current || vendors.current;
    const filtersArg = JSON.stringify(filters || listFilter);
    this.props.loadPartnerList(PARTNER_ROLES.VEN, pageSizeArg, currentArg, filtersArg);
  }
  handleVendorAdd = () => {
    this.props.showPartnerModal('add', { role: PARTNER_ROLES.VEN });
  }
  handleVendorEdit = (vendor) => {
    this.props.showPartnerModal('edit', vendor);
  }
  handleVendorToggle = (vendor) => {
    const newstatus = vendor.status === 1 ? 0 : 1;
    this.props.changePartnerStatus(vendor.id, newstatus);
  }
  handleVendorDel = (vendor) => {
    this.props.deletePartner(vendor.id);
  }
  handleSearch = (value) => {
    const filters = { ...this.props.listFilter, name: value };
    this.handleTableLoad(null, null, filters);
  }
  handleExport = () => {
    window.open(`${API_ROOTS.default}v1/scof/partners/export/${createFilename('vendors')}.xlsx?role=VEN`);
  }
  handleMenuClick = () => {
    this.setState({
      importPanelVisible: true,
    });
  }
  suppliersUploaded = () => {
    this.handleTableLoad();
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
        <Menu.Item key="impt"><Icon type="upload" /> {this.gmsg('batchImport')}</Menu.Item>
      </Menu>
    );
    const { vendors, loading } = this.props;
    this.dataSource.remotes = vendors;
    return (
      <Layout>
        <PageHeader title={this.msg('vendors')}>
          <PageHeader.Actions>
            <ToolbarAction icon="export" label={this.gmsg('export')} onClick={this.handleExport} />
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
        <ImportDataPanel
          title={this.msg('batchImportVendors')}
          visible={this.state.importPanelVisible}
          endpoint={`${API_ROOTS.default}v1/cooperation/partner/import`}
          formData={{ role: PARTNER_ROLES.VEN }}
          onClose={() => { this.setState({ importPanelVisible: false }); }}
          onUploaded={this.vendorsUploaded}
          template={`${XLSX_CDN}/客户导入模板.xlsx`}
        />
        <PartnerModal onOk={this.handleTableLoad} />
      </Layout>
    );
  }
}
