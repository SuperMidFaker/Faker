/* eslint react/no-multi-comp: 0 */
import React, { Component, PropTypes } from 'react';
import { Form, Input, Progress, Card, Col, Row } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';

const formatMsg = format(messages);
const FormItem = Form.Item;

@injectIntl
export default class HeadForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: this.msg('seq'),
    width: 50,
  }, {
    title: this.msg('opColumn'),
    width: 80,
  }, {
    title: this.msg('sku'),
    dataIndex: 'sku',
    width: 300,
  }, {
    title: this.msg('unit'),
    width: 60,
    dataIndex: 'unit',
  }, {
    title: this.msg('qty'),
    width: 50,
    dataIndex: 'qty',
  }, {
    title: this.msg('remark'),
    dataIndex: 'remark',
  }]
  render() {
    const { form: { getFieldDecorator } } = this.props;
    return (
      <Card>
        <Row gutter={16}>
          <Col sm={24} lg={6}>
            <FormItem label="入库单号">
              {getFieldDecorator('inbound_no', {
              })(
                <Input disabled />
                  )}
            </FormItem>
          </Col>
          <Col sm={24} lg={6}>
            <FormItem label="入库状态">
              {getFieldDecorator('inbound_status', {
              })(
                <Input disabled />
                  )}
            </FormItem>
          </Col>
          <Col sm={24} lg={6}>
            <FormItem label="操作人员">
              {getFieldDecorator('inbound_type', {
              })(
                <Input />
                  )}
            </FormItem>
          </Col>
          <Col sm={24} lg={3}>
            <FormItem label="预计箱数">
              {getFieldDecorator('convey_box_qty', {
              })(
                <Input />
                  )}
            </FormItem>
          </Col>
          <Col sm={24} lg={3}>
            <FormItem label="预计托盘数">
              {getFieldDecorator('convey_pallet_qty', {
              })(
                <Input />
                  )}
            </FormItem>
          </Col>
          <Col sm={24} lg={24}>
            <Progress percent={50} status="active" />
          </Col>
        </Row>
      </Card>
    );
  }
}
