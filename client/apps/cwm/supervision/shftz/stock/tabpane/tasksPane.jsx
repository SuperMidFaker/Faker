import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Table } from 'antd';
import RowUpdater from 'client/components/rowUpdater';
import { loadFtzStocks, loadParams } from 'common/reducers/cwmShFtz';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import { formatMsg } from '../message.i18n';

@injectIntl
@connect(
    state => ({
      whses: state.cwmContext.whses,
      defaultWhse: state.cwmContext.defaultWhse,
      tenantId: state.account.tenantId,
      owners: state.cwmContext.whseAttrs.owners,
      stockDatas: state.cwmShFtz.stockDatas,
      units: state.cwmShFtz.params.units.map(un => ({
        value: un.unit_code,
        text: un.unit_name,
      })),
      currencies: state.cwmShFtz.params.currencies.map(cr => ({
        value: cr.curr_code,
        text: cr.curr_name,
      })),
      tradeCountries: state.cwmShFtz.params.tradeCountries.map(tc => ({
        value: tc.cntry_co,
        text: tc.cntry_name_cn,
      })),
      loading: state.cwmShFtz.loading,
    }),
    { loadFtzStocks, loadParams, switchDefaultWhse }
  )
export default class TasksPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    stockDatas: PropTypes.array.isRequired,
  }
  state = {
    filter: { ownerCode: '', entNo: '', whse_code: '' },
    selectedRowKeys: [],
  }
  componentWillMount() {
    this.props.loadParams();
  }
  msg = formatMsg(this.props.intl);
  columns = [{
    title: this.msg('taskId'),
    dataIndex: 'task_id',
    width: 60,
  }, {
    title: this.msg('owner'),
    dataIndex: 'owner',
  }, {
    title: this.msg('progress'),
    dataIndex: 'progress',
  }, {
    title: this.msg('createdDate'),
    dataIndex: 'created_date',
  }, {
    title: this.msg('ops'),
    dataIndex: 'OPS_COL',
    render: (o, record) => <RowUpdater onHit={this.handleDetail} label="对比详情" row={record} />,
  }]

  render() {
    return (
      <div className="table-panel table-fixed-layout">
        <Table loading={this.props.loading}
          columns={this.columns} dataSource={this.props.stockDatas} rowKey="id"
        />
      </div>
    );
  }
}
