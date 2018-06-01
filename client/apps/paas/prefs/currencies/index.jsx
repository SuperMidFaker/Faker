import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Layout } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { toggleNewExRateModal, loadExRates, deleteExRate, alterExRateVal } from 'common/reducers/bssExRateSettings';
import { loadCurrencies } from 'common/reducers/saasParams';
import connectNav from 'client/common/decorators/connect-nav';
import PageHeader from 'client/components/PageHeader';
import DataTable from 'client/components/DataTable';
import RowAction from 'client/components/RowAction';
import EditableCell from 'client/components/EditableCell';
import HubSiderMenu from '../../menu';
import CurrencyModal from './modals/currencyModal';
import { formatMsg, formatGlobalMsg } from '../message.i18n';

const { Content } = Layout;

@injectIntl
@connect(
  state => ({
    visible: state.bssExRateSettings.visibleExRateModal,
    exRateList: state.bssExRateSettings.exRateList,
    currencies: state.saasParams.currencies,
  }),
  {
    toggleNewExRateModal, loadExRates, deleteExRate, alterExRateVal, loadCurrencies,
  }
)
@connectNav({
  depth: 2,
  moduleName: 'bss',
})
export default class Currencies extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  componentDidMount() {
    this.handleRateLoad();
    this.props.loadCurrencies();
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  itemsColumns = [{
    title: '转换币制',
    dataIndex: 'currency',
    width: 200,
    render: (o) => {
      const currency = this.props.currencies.filter(cur => cur.curr_code === o)[0];
      const text = currency ? `${currency.curr_name}` : o;
      return <span>{text}</span>;
    },
  }, {
    title: '基准币制',
    dataIndex: 'base_currency',
    width: 200,
    render: (o) => {
      const currency = this.props.currencies.filter(cur => cur.curr_code === o)[0];
      const text = currency ? `${currency.curr_name}` : o;
      return <span>{text}</span>;
    },
  }, {
    title: '汇率',
    dataIndex: 'exchange_rate',
    width: 150,
    render: (o, record) =>
      <EditableCell value={o} onSave={value => this.handleAlter(record.id, 'exchange_rate', value)} style={{ width: '100%' }} />,
  }, {
    title: '更新日期',
    dataIndex: 'last_updated_date',
    render: o => o && moment(o).format('YYYY.MM.DD'),
  }, {
    title: '操作',
    dataIndex: 'OPS_COL',
    className: 'table-col-ops',
    fixed: 'right',
    width: 90,
    render: (o, record) => (
      <RowAction danger confirm={this.gmsg('deleteConfirm')} onConfirm={this.handleDelete} icon="delete" row={record} />
    ),
  }]
  dataSource = new DataTable.DataSource({
    fetcher: params => this.props.loadExRates(params),
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
    remotes: this.props.exRateList,
  })
  handleCreateExRate = () => {
    this.props.toggleNewExRateModal(true);
  }
  handleAlter = (id, field, value) => {
    const change = {};
    change[field] = value;
    this.props.alterExRateVal({ id, change });
  }
  handleDelete = (row) => {
    this.props.deleteExRate(row.id).then((result) => {
      if (!result.error) {
        this.handleRateLoad();
      }
    });
  }
  handleRateLoad = () => {
    this.props.loadExRates({
      pageSize: this.props.exRateList.pageSize,
      current: this.props.exRateList.current,
    });
  }
  render() {
    const { exRateList } = this.props;
    this.dataSource.remotes = exRateList;
    return (
      <Layout>
        <HubSiderMenu currentKey="currencies" openKey="paramPrefs" />
        <Layout>
          <PageHeader>
            <PageHeader.Actions>
              <Button type="primary" icon="plus" onClick={this.handleCreateExRate}>
                {this.msg('addChangeRate')}
              </Button>
            </PageHeader.Actions>
          </PageHeader>
          <Content className="page-content">
            <DataTable
              columns={this.itemsColumns}
              dataSource={this.dataSource}
              rowKey="id"
            />
          </Content>
          <CurrencyModal reload={this.handleRateLoad} />
        </Layout>
      </Layout>
    );
  }
}
