import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Table, message } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n.js';
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
    width: 160,
    dataIndex: 'broker',
  }]
  ciqColumns = [{
    title: this.msg('ciqBroker'),
    width: 160,
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
        if (this.props.expFees.cust.column) {
          this.setState({ CUST: true });
        }
        if (this.props.expFees.ciq.column) {
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
    let custSource = [];
    let ciqSource = [];
    if (CUST) {
      custColumns = custColumns.concat(expFees.cust.column);
      custSource = expFees.cust.source;
    }
    if (CIQ) {
      ciqColumns = ciqColumns.concat(expFees.ciq.column);
      ciqSource = expFees.ciq.source;
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
