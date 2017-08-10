/* eslint react/no-multi-comp: 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Col, Row, Select } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';

const formatMsg = format(messages);
const FormItem = Form.Item;

@injectIntl
export default class CarrierForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const { form: { getFieldDecorator } } = this.props;
    return (
      <div style={{ padding: 24 }}>
        <Row>
          <Col span={6}>
            <FormItem label="承运人" >
              {getFieldDecorator('carrier_code', {
              })(<Select />)}
            </FormItem>
          </Col>
        </Row>
      </div>
    );
  }
}
