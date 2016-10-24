import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Table, message } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import { loadSubTable } from 'common/reducers/cmsExpense';
const formatMsg = format(messages);

@injectIntl
@connect(
  (state, props) => ({
    tenantId: state.account.tenantId,
    expFees: state.cmsExpense.expFeesMap[props.delgNo],
  }),
  { loadSubTable }
)
export default class ExpSubTable extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    expFees: PropTypes.object.isRequired,
    delgNo: PropTypes.string.isRequired,
    loadSubTable: PropTypes.func.isRequired,
  }
  state = {
    CUST: false,
    CIQ: false,
  }
  componentDidMount() {
    this.handleTableLoad();
  }
  msg = key => formatMsg(this.props.intl, key);
  custColumns = [{
    title: this.msg('custBroker'),
    width: 120,
    dataIndex: 'broker',
  }]
  ciqColumns = [{
    title: this.msg('ciqBroker'),
    width: 120,
    dataIndex: 'broker',
  }]
  handleTableLoad = () => {
    const { tenantId, delgNo } = this.props;
    this.props.loadSubTable({
      tenantId,
      delgNo,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 5);
      } else {
        const { expFees } = this.props;
        if (expFees.cust && expFees.cust.data) {
          this.setState({ CUST: true });
        }
        if (expFees.ciq && expFees.ciq.data) {
          this.setState({ CIQ: true });
        }
      }
    });
  }
  handleExpandedChange = (expandedRowKeys) => {
    this.setState({ expandedRowKeys });
  }
  render() {
    const { expFees } = this.props;
    const { CUST, CIQ } = this.state;
    let custColumns = [...this.custColumns];
    let ciqColumns = [...this.ciqColumns];
    const custSource = [];
    const ciqSource = [];
    if (CUST) {
      const custExps = expFees.cust.data;
      const column = [];
      const col = {};
      custExps.forEach((ct) => {
        col[`${ct.fee_code}`] = ct.total_fee.toFixed(2);
        column.push({ title: ct.fee_name, dataIndex: ct.fee_code, width: 80 });
      });
      col.broker = expFees.cust.broker;
      custColumns = custColumns.concat(column);
      custSource.push(col);
    }
    if (CIQ) {
      const ciqExps = expFees.ciq.data;
      const column = [];
      const col = {};
      ciqExps.forEach((ct) => {
        col[`${ct.fee_code}`] = ct.total_fee.toFixed(2);
        column.push({ title: ct.fee_name, dataIndex: ct.fee_code, width: 80 });
      });
      col.broker = expFees.ciq.broker;
      ciqColumns = ciqColumns.concat(column);
      ciqSource.push(col);
    }
    return (
      <div>
        { CUST && <Table columns={custColumns} dataSource={custSource}
          pagination={false} size="middle" scroll={{ y: 200 }} loading={expFees.loading}
        />}
        { CIQ && <Table columns={ciqColumns} dataSource={ciqSource}
          pagination={false} size="middle" scroll={{ y: 200 }} loading={expFees.loading}
        /> }
      </div>
  ); }
}