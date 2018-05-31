import React from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import DataTable from 'client/components/DataTable';
import { formatMsg } from '../message.i18n';


@injectIntl
export default class ASNDetailsPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    asnBody: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  }
  msg = formatMsg(this.props.intl)
  columns = [{
    title: '行号',
    dataIndex: 'asn_seq_no',
    width: 50,
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 200,
  }, {
    title: '中文品名',
    dataIndex: 'name',
    width: 200,
  }, {
    title: '订单数量',
    width: 100,
    dataIndex: 'order_qty',
    align: 'right',
  }, {
    title: '计量单位',
    width: 100,
    dataIndex: 'unit_name',
    align: 'center',
  }, {
    title: '采购订单号',
    width: 200,
    dataIndex: 'po_no',
  }]
  render() {
    const { asnBody } = this.props;
    return (
      <div className="pane-content tab-pane">
        <DataTable size="middle" columns={this.columns} dataSource={asnBody} showToolbar={false} />
      </div>
    );
  }
}
