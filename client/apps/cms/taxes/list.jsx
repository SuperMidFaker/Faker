import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import PageHeader from 'client/components/PageHeader';
import Drawer from 'client/components/Drawer';
import ToolbarAction from 'client/components/ToolbarAction';
import ImportDataPanel from 'client/components/ImportDataPanel';
import DataTable from 'client/components/DataTable';
import SearchBox from 'client/components/SearchBox';
import { loadTaxesList, batchDeleteTaxes } from 'common/reducers/cmsTaxes';
import { loadCountries, loadCurrencies } from 'common/reducers/cmsParams';
import { Layout, Menu } from 'antd';
import { formatMsg, formatGlobalMsg } from './message.i18n';

const { Content } = Layout;

@injectIntl
@connect(
  state => ({
    taxesList: state.cmsTaxes.taxesList,
    currencies: state.cmsParams.currencies.map(currency => ({
      value: currency.curr_code,
      text: currency.curr_name,
    })),
    countries: state.cmsParams.countries.map(tc => ({
      value: tc.cntry_co,
      text: tc.cntry_name_cn,
    })),
    filter: state.cmsTaxes.listFilter,
  }),
  {
    loadTaxesList,
    loadCountries,
    loadCurrencies,
    batchDeleteTaxes,
  }
)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
export default class TaxesList extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    currentFilter: 'all',
    importPanelVisible: false,
  }
  componentDidMount() {
    this.props.loadTaxesList({
      pageSize: this.props.taxesList.pageSize,
      current: this.props.taxesList.current,
    });
    this.props.loadCountries();
    this.props.loadCurrencies();
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  columns = [{
    title: this.msg('preEntrySeqNo'),
    dataIndex: 'pre_entry_seq_no',
    width: 190,
  }, {
    title: this.msg('delgNo'),
    dataIndex: 'delg_no',
    width: 190,
  }, {
    title: this.msg('trxnMode'),
    dataIndex: 'trxn_mode',
    width: 100,
  }, {
    title: this.msg('shipFee'),
    dataIndex: 'ship_fee',
    width: 100,
  }, {
    title: this.msg('otherFee'),
    dataIndex: 'other_fee',
    width: 100,
  }, {
    title: this.msg('insurFee'),
    dataIndex: 'insur_fee',
    width: 100,
  }, {
    title: this.msg('shipMark'),
    dataIndex: 'ship_mark',
    width: 100,
  }, {
    title: this.msg('otherMark'),
    dataIndex: 'other_mark',
    width: 100,
  }, {
    title: this.msg('insurMark'),
    dataIndex: 'insur_mark',
    width: 100,
  }, {
    title: this.msg('tradeTot'),
    dataIndex: 'trade_tot',
    width: 100,
  }, {
    title: this.msg('dutyPaid'),
    dataIndex: 'duty_paid',
    width: 100,
  }, {
    title: this.msg('dutyRate'),
    dataIndex: 'duty_rate',
    width: 100,
  }, {
    title: this.msg('dutyTax'),
    dataIndex: 'duty_tax',
    width: 100,
  }, {
    title: this.msg('gstRates'),
    dataIndex: 'gst_rates',
    width: 100,
  }, {
    title: this.msg('exciseTax'),
    dataIndex: 'excise_tax',
    width: 100,
  }, {
    title: this.msg('vatRates'),
    dataIndex: 'vat_rates',
    width: 100,
  }, {
    title: this.msg('vatTax'),
    dataIndex: 'vat_tax',
    width: 100,
  }, {
    title: this.msg('totalTax'),
    dataIndex: 'total_tax',
    width: 100,
  }, {
    title: this.msg('gName'),
    dataIndex: 'g_name',
    width: 100,
  }, {
    title: this.msg('actualDutyPaid'),
    dataIndex: 'actual_duty_paid',
    width: 100,
  }, {
    title: this.msg('importDutyTax'),
    dataIndex: 'import_duty_tax',
    width: 100,
  }, {
    title: this.msg('importVatTax'),
    dataIndex: 'import_vat_tax',
    width: 100,
  }, {
    title: this.msg('importExciseTax'),
    dataIndex: 'import_excise_tax',
    width: 100,
  }, {
    title: this.msg('deposit'),
    dataIndex: 'deposit',
    width: 100,
  }, {
    title: this.msg('delayedDeclarationFee'),
    dataIndex: 'delayed_declaration_fee',
    width: 100,
  }, {
    title: this.msg('exportDutyTax'),
    dataIndex: 'export_duty_tax',
    width: 100,
  }, {
    title: this.msg('specialDutyTax'),
    dataIndex: 'special_duty_tax',
    width: 100,
  }, {
    title: this.msg('counterVailingDuty'),
    dataIndex: 'counter_vailing_duty',
    width: 100,
  }, {
    title: this.msg('discardTax'),
    dataIndex: 'discard_tax',
    width: 100,
  }, {
    title: this.msg('dutyTaxInterest'),
    dataIndex: 'duty_tax_interest',
    width: 100,
  }, {
    title: this.msg('exciseTaxInterest'),
    dataIndex: 'excise_tax_interest',
    width: 100,
  }, {
    title: this.msg('paidPartnerId'),
    dataIndex: 'paid_partner_id',
    width: 100,
  }, {
    title: this.msg('paidDate'),
    dataIndex: 'paid_date',
    width: 100,
    render: o => o && moment(o).format('YYYY-MM-DD'),
  }, {
    title: this.msg('origCountry'),
    dataIndex: 'orig_country',
    width: 100,
    render: (o) => {
      if (o) {
        const country = this.props.countries.find(cntry => cntry.value === o);
        if (country) {
          return country.text;
        }
      }
      return '';
    },
  }, {
    title: this.msg('tradeTotal'),
    dataIndex: 'trade_total',
    width: 100,
  }, {
    title: this.msg('currency'),
    dataIndex: 'currency',
    width: 100,
    render: (o) => {
      if (o) {
        const currency = this.props.currencies.find(curr => curr.value === o);
        if (currency) {
          return currency.text;
        }
      }
      return '';
    },
  }, {
    title: this.msg('exchangeRate'),
    dataIndex: 'exchange_rate',
    width: 100,
  }]
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  handleReload = (currentPage, filter) => {
    this.props.loadTaxesList({
      filter: filter ? JSON.stringify(filter) : JSON.stringify(this.props.filter),
      pageSize: this.props.taxesList.pageSize,
      current: currentPage || this.props.taxesList.current,
    });
  }
  handleImport = () => {
    this.setState({
      importPanelVisible: true,
    });
  }
  taxesUploaded = () => {
    this.handleReload();
  }
  handleSearch = (value) => {
    const filter = { ...this.props.filter, searchText: value };
    this.handleReload(1, filter);
  }
  handleBatchDelete = () => {
    const { selectedRowKeys } = this.state;
    this.props.batchDeleteTaxes(selectedRowKeys).then((result) => {
      if (!result.error) {
        this.handleDeselectRows();
        const { filter } = this.props;
        this.props.loadTaxesList({
          filter: JSON.stringify(filter),
          pageSize: this.props.taxesList.pageSize,
          current: 1,
        });
      }
    });
  }
  render() {
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const toolbarActions = (<span>
      <SearchBox
        placeholder={this.msg('searchPlaceholder')}
        onSearch={this.handleSearch}
      />
    </span>);
    const bulkActions = (<span>
      <ToolbarAction danger icon="delete" label={this.gmsg('delete')} confirm={this.gmsg('deleteConfirm')} onConfirm={this.handleBatchDelete} />
    </span>);
    const dataSource = new DataTable.DataSource({
      fetcher: params => this.props.loadTaxesList(params),
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
          filters: { },
        };
        return params;
      },
      remotes: this.props.taxesList,
    });
    return (
      <Layout>
        <PageHeader title={this.msg('permit')}>
          <PageHeader.Actions>
            <ToolbarAction icon="upload" label={this.gmsg('import')} onClick={this.handleImport} />
          </PageHeader.Actions>
        </PageHeader>
        <Layout>
          <Drawer width={160}>
            <Menu mode="inline" selectedKeys={[this.state.currentFilter]} onClick={this.handleFilterChange}>
              <Menu.Item key="all">{this.msg('all')}</Menu.Item>
            </Menu>
          </Drawer>
          <Content className="page-content" key="main">
            <DataTable
              toolbarActions={toolbarActions}
              bulkActions={bulkActions}
              rowSelection={rowSelection}
              selectedRowKeys={this.state.selectedRowKeys}
              onDeselectRows={this.handleDeselectRows}
              columns={this.columns}
              dataSource={dataSource}
              rowKey="pre_entry_seq_no"
            />
            <ImportDataPanel
              title={this.msg('batchImportTaxes')}
              visible={this.state.importPanelVisible}
              endpoint={`${API_ROOTS.default}v1/cms/taxes/import`}
              formData={{}}
              onClose={() => { this.setState({ importPanelVisible: false }); }}
              onUploaded={this.taxesUploaded}
              template={`${XLSX_CDN}/税金导入模板.xlsx`}
            />
          </Content>
        </Layout>
      </Layout>
    );
  }
}
