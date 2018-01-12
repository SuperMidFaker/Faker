import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Checkbox, Form, Row, Col, Card, Input, Select, Table } from 'antd';
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
export default class ContainerForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    operation: PropTypes.oneOf(['view', 'edit', 'create']),
  }
  componentDidMount() {
  }
  msg = key => formatMsg(this.props.intl, key)
  containerColumns = [{
    title: '集装箱号',
    dataIndex: 'cntnr_no',
  }, {
    title: '集装箱规格',
    dataIndex: 'cntnr_spec',
  }, {
    title: '是否拼箱',
    dataIndex: 'is_consolidated',
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
            <FormItem label="集装箱号" {...formItemLayout}>
              <Input />
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem label="集装箱规格" {...formItemLayout}>
              <Select />
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem label="是否拼箱" {...formItemLayout}>
              <Checkbox />
            </FormItem>
          </Col>
          <Col span={4} offset={2}>
            <Button type="primary" ghost icon="plus-circle-o">添加</Button>
          </Col>
        </Row>
        <Card bodyStyle={{ padding: 0 }}>
          <Table size="small" columns={this.containerColumns} />
        </Card>
      </FormPane>
    );
  }
}
