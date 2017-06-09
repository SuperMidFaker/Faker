/* eslint react/no-multi-comp: 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Card, Col, Row, Input } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';

const formatMsg = format(messages);
const FormItem = Form.Item;

@injectIntl
export default class SiderForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const { form: { getFieldDecorator } } = this.props;
    return (
      <div>
        <Card>
          <Row gutter={16}>
            <Col sm={24}>
              <FormItem label={this.msg('asnNo')}>
                {getFieldDecorator('asn_no', {
                })(<Input />)}
              </FormItem>
            </Col>
            <Col sm={24}>
              <FormItem label={this.msg('purchaseOrderNo')} >
                {getFieldDecorator('order_no', {
                })(<Input />)}
              </FormItem>
            </Col>
          </Row>
        </Card>
      </div>
    );
  }
}
