import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import { Button, Radio, Switch } from 'antd';
import QueueAnim from 'rc-queue-anim';
import Table from 'client/components/remoteAntTable';
import connectFetch from 'client/common/decorators/connect-fetch';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { loadExpense, openInModal } from 'common/reducers/cmsExpense';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import moment from 'moment';
import SearchBar from 'client/components/search-bar';
import TrimSpan from 'client/components/trimSpan';
import InputModal from './modals/inputModal';

const formatMsg = format(messages);
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

function fetchData({ state, dispatch }) {
  return dispatch(loadExpense(state.account.tenantId));
}
function ColumnSwitch(props) {
  const { record, field, onChange } = props;
  function handleChange(value) {
    if (onChange) {
      onChange(record, field, value);
    }
  }
  return <Switch size="small" checked={record[field]} value={record[field] || true} onChange={handleChange} />;
}
ColumnSwitch.propTypes = {
  record: PropTypes.object.isRequired,
  field: PropTypes.string.isRequired,
  onChange: PropTypes.func,
};

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    expslist: state.cmsExpense.expslist,
  }),
  { openInModal }
)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
@withPrivilege({ module: 'clearance', feature: 'expense' })
export default class ExpenseList extends Component {
  static propTypes = {
    tenantId: PropTypes.number.isRequired,
    expslist: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  handleNavigationTo(to, query) {
    this.context.router.push({ pathname: to, query });
  }
  handleSearch = () => {

  }
  handleEditChange = (record, field, value) => {
    record[field] = value; // eslint-disable-line no-param-reassign
    this.forceUpdate();
  }
  handleCushInput = () => {
    this.props.openInModal();
  }
  render() {
    const msg = descriptor => formatMsg(this.props.intl, descriptor);
    const { expslist } = this.props;
    const columns = [
      {
        title: msg('delgNo'),
        dataIndex: 'delg_no',
        width: 100,
      }, {
        title: msg('custName'),
        dataIndex: 'partner.name',
        width: 150,
        render: o => <TrimSpan text={o} maxLen={12} />,
      }, {
        title: msg('invoiceNo'),
        dataIndex: 'invoice_no',
        width: 100,
      }, {
        title: msg('bLNo'),
        dataIndex: 'bl_wb_no',
        width: 100,
      }, {
        title: msg('servBill'),
        dataIndex: 'tot_sercharges.total_fee',
        width: 100,
        render: (o) => {
          if (o) {
            return o.toFixed(2);
          }
        },
      }, {
        title: msg('cushBill'),
        width: 100,
      }, {
        title: msg('allBill'),
        width: 100,
        render: (record) => {
          const allbill = (record.tot_sercharges.total_fee || 0) + (record.tot_cushcharges || 0);
          return allbill.toFixed(2);
        },
      }, {
        title: msg('servCost'),
        width: 100,
      }, {
        title: msg('cushCost'),
        width: 100,
      }, {
        title: msg('allCost'),
        width: 100,
      }, {
        title: msg('statementEn'),
        width: 100,
        render: (o, record) =>
          <ColumnSwitch field="stat_en" record={record} onChange={this.handleEditChange} />,
      }, {
        title: msg('lastActT'),
        dataIndex: 'last_act_time',
        width: 100,
        render: (o) => {
          return `${moment(o).format('MM.DD HH:mm')}`;
        },
      },
    ];
    return (
      <QueueAnim type={['bottom', 'up']}>
        <header className="top-bar" key="header">
          <div className="tools">
            <SearchBar placeholder={msg('searchPlaceholder')} onInputSearch={this.handleSearch} />
          </div>
          <span>{msg('expense')}</span>
          <RadioGroup>
            <RadioButton value="all">{msg('all')}</RadioButton>
            <RadioButton value="nostatement">{msg('nostatement')}</RadioButton>
            <RadioButton value="statement">{msg('statement')}</RadioButton>
            <RadioButton value="invoiced">{msg('invoiced')}</RadioButton>
          </RadioGroup>
        </header>
        <div className="main-content" key="main">
          <div className="page-body">
            <div className="panel-header">
              <Button type="primary" style={{ marginRight: 20 }} onClick={this.handleCushInput}>
                {msg('incExp')}
              </Button>
              <Button type="default" onClick={() => this.handleNavigationTo('/clearance/quote/create')}>
                {msg('markState')}
              </Button>
            </div>
            <div className="panel-body table-panel">
              <Table columns={columns} dataSource={expslist.data} loading={expslist.loading} />
            </div>
          </div>
        </div>
        <InputModal data={expslist.data} />
      </QueueAnim>
    );
  }
}
