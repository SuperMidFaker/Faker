import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Form, Row, Col, Card, Input, Table } from 'antd';
import { setClientForm } from 'common/reducers/crmOrders';

import FormPane from 'client/components/FormPane';
import RowAction from 'client/components/RowAction';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const FormItem = Form.Item;


@injectIntl
@connect(
  state => ({
    recParams: state.scofFlow.cwmParams,
  }),
  { setClientForm }
)
export default class InvoiceForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    operation: PropTypes.oneOf(['view', 'edit', 'create']),
  }
  componentDidMount() {
  }
  msg = key => formatMsg(this.props.intl, key)
  invoiceColumns = [{
    title: '发票号',
    dataIndex: 'invoice_no',
  }, {
    title: '订单号',
    dataIndex: 'order_no',
  }, {
    title: '合同号',
    dataIndex: 'contract_no',
  }, {
    dataIndex: 'OPS_COL',
    width: 45,
    render: (o, record) => <RowAction danger confirm="确定删除?" onConfirm={this.handleDelete} icon="delete" tooltip="删除" row={record} />,
  }];

  render() {
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
      colon: false,
    };
    // todo required
    return (
      <FormPane>
        <Row>
          <Col span={6}>
            <FormItem label="发票号" {...formItemLayout}>
              <Input />
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem label="合同号" {...formItemLayout}>
              <Input />
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem label="订单号" {...formItemLayout}>
              <Input />
            </FormItem>
          </Col>
          <Col span={4} offset={2}>
            <Button type="primary" ghost icon="plus-circle-o">添加</Button>
          </Col>
        </Row>
        <Card bodyStyle={{ padding: 0 }}>
          <Table size="small" columns={this.invoiceColumns} />
        </Card>
      </FormPane>
    );
  }
}
