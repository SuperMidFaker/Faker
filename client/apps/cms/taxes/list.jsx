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
import { loadTaxesList } from 'common/reducers/cmsDeclTax';
import { loadTrxnMode } from 'common/reducers/cmsParams';
import { Layout, Menu } from 'antd';
import { formatMsg, formatGlobalMsg } from './message.i18n';

const { Content } = Layout;

@injectIntl
@connect(
  state => ({
    taxesList: state.cmsDeclTax.taxesList,
    filter: state.cmsDeclTax.listFilter,
    trxnModes: state.cmsParams.trxnModes,
  }),
  {
    loadTaxesList,
    loadTrxnMode,
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
    this.handleReload(1);
    this.props.loadTrxnMode();
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  columns = [{
    title: this.msg('preEntrySeqNo'),
    dataIndex: 'pre_entry_seq_no',
    width: 190,
  }, {
    title: this.msg('entryId'),
    dataIndex: 'entry_id',
    width: 190,
  }, {
    title: this.msg('blWbNo'),
    dataIndex: 'bl_wb_no',
    width: 190,
  }, {
    title: this.msg('trxnMode'),
    dataIndex: 'trxn_mode',
    width: 100,
    render: (o) => {
      if (o) {
        const trxn = this.props.trxnModes.find(tr => tr.trx_mode === o);
        if (trxn) {
          return trxn.trx_specl;
        }
      }
      return '';
    },
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
    title: this.msg('dutyTax'),
    dataIndex: 'duty_tax',
    width: 100,
  }, {
    title: this.msg('exciseTax'),
    dataIndex: 'excise_tax',
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
    title: this.msg('actualDutyPaid'),
    dataIndex: 'actual_duty_paid',
    width: 100,
  }, {
    title: this.msg('actualDutyTax'),
    dataIndex: 'actual_duty_tax',
    width: 100,
  }, {
    title: this.msg('actualVatTax'),
    dataIndex: 'actual_vat_tax',
    width: 100,
  }, {
    title: this.msg('actualExciseTax'),
    dataIndex: 'actual_excise_tax',
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
    title: this.msg('payerEntity'),
    dataIndex: 'payer_entity',
    width: 100,
  }, {
    title: this.msg('paidDate'),
    dataIndex: 'paid_date',
    width: 100,
    render: o => o && moment(o).format('YYYY-MM-DD'),
  }, {
    title: this.msg('tradeTotal'),
    dataIndex: 'trade_total',
    width: 100,
  }]
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  handleReload = (currentPage, filter) => {
    this.props.loadTaxesList({
      filter: filter || this.props.filter,
      pageSize: this.props.taxesList.pageSize,
      current: currentPage || this.props.taxesList.current,
    });
  }
  handleImport = () => {
    this.setState({
      importPanelVisible: true,
    });
  }
  handleTaxComparisonUpload = () => {
    this.handleReload();
  }
  handleSearch = (value) => {
    const filter = { ...this.props.filter, searchText: value };
    this.handleReload(1, filter);
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
        value={this.props.filter.searchText}
      />
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
          filter: this.props.filter,
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
              endpoint={`${API_ROOTS.default}v1/cms/customs/decltax/importcomparison`}
              formData={{}}
              onClose={() => { this.setState({ importPanelVisible: false }); }}
              onUploaded={this.handleTaxComparisonUpload}
              template={`${XLSX_CDN}/税金导入模板.xlsx`}
            />
          </Content>
        </Layout>
      </Layout>
    );
  }
}
