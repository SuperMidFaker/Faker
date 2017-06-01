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
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: '行序号',
    width: 80,
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 200,
  }, {
    title: '中文品名',
    dataIndex: 'product_no',
    width: 200,
  }, {
    title: '包装代码',
    width: 100,
    dataIndex: 'unit',
  }, {
    title: '预期数量',
    width: 100,
    dataIndex: 'qty',
  }, {
    title: '计量单位',
    dataIndex: 'remark',
  }]
  render() {
    return (
      <Card>
        <div className="toolbar">
          <Button type="primary" style={{ marginRight: 8 }}>添加</Button>
          <Button>导入</Button>
        </div>
        <Table columns={this.columns} rowKey="id" />
      </Card>
    );
  }
}
