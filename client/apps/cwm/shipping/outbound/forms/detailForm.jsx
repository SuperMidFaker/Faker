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
    title: this.msg('opColumn'),
    width: 80,
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 200,
  }, {
    title: '品名',
    dataIndex: 'product_no',
    width: 200,
  }, {
    title: '计量单位',
    width: 100,
    dataIndex: 'unit',
  }, {
    title: '数量',
    width: 100,
    dataIndex: 'qty',
  }, {
    title: this.msg('remark'),
    dataIndex: 'remark',
  }]
  render() {
    return (
      <Card>
        <Table columns={this.columns} rowKey="id" />
      </Card>
    );
  }
}
