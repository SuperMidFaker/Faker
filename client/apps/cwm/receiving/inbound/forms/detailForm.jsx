/* eslint react/no-multi-comp: 0 */
import React, { Component, PropTypes } from 'react';
import { Card, Table } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';

const formatMsg = format(messages);

@injectIntl
export default class DetailForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: '序号',
    width: 50,
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 120,
  }, {
    title: '中文品名',
    dataIndex: 'product_no',
    width: 200,
  }, {
    title: '订单数量',
    dataIndex: 'order_qty',
  }, {
    title: '单位',
    dataIndex: 'unit',
  }, {
    title: '包装代码',
    dataIndex: 'pack_code',
  }, {
    title: '收货包装',
    dataIndex: 'receive_pack',
  }, {
    title: '预期数量',
    dataIndex: 'receive_pack_qty',
  }, {
    title: '已收数量',
    dataIndex: 'received_pack_qty',
  }]
  render() {
    return (
      <Card>
        <Table columns={this.columns} rowKey="id" />
      </Card>
    );
  }
}
