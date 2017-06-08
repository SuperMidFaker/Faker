/* eslint react/no-multi-comp: 0 */
import React, { Component, PropTypes } from 'react';
import { Button, Card, Table } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';

const formatMsg = format(messages);

@injectIntl
export default class DetailForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    editable: PropTypes.bool,
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: '序号',
    dataIndex: 'seq_no',
    width: 50,
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 200,
  }, {
    title: '中文品名',
    dataIndex: 'desc_cn',
    width: 200,
  }, {
    title: '订单数量',
    width: 100,
    dataIndex: 'qty',
  }, {
    title: '主单位',
    dataIndex: 'unit',
  }, {
    title: '单价',
    dataIndex: 'unit_price',
  }]
  render() {
    const { editable } = this.props;
    return (
      <Card bodyStyle={{ padding: 0 }}>
        <div className="toolbar">
          {editable && <Button type="primary">添加明细</Button>}
          {editable && <Button>导入</Button>}
        </div>
        <Table columns={this.columns} rowKey="id" />
      </Card>
    );
  }
}
