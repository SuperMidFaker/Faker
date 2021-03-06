/* eslint react/no-multi-comp: 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Form, Input, Card, Col, Row } from 'antd';
import { intlShape, injectIntl } from 'react-intl';

import { formatMsg } from '../message.i18n';


const FormItem = Form.Item;

function getFieldInits(aspect, formData) {
  const init = {};
  if (formData) {
    [
      'ref_external_no', 'remark',
    ].forEach((fd) => {
      init[fd] = formData[fd] === undefined ? '' : formData[fd];
    });
  }
  init.exchanged_doc = formData.exchanged_doc === undefined ? 1 : formData.exchanged_doc;
  return init;
}
@injectIntl
@connect(state => ({
  clients: state.cmsDelegation.formRequire.clients,
  fieldInits: getFieldInits(state.account.aspect, state.cmsDelegation.formData),
}))
export default class SiderForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.shape({ getFieldDecorator: PropTypes.func.isRequired }).isRequired,
  }
  msg = formatMsg(this.props.intl)
  render() {
    const { form: { getFieldDecorator }, fieldInits } = this.props;
    return (
      <div>
        <Card className="secondary-card">
          <Row gutter={16}>
            <Col sm={24}>
              <FormItem label={this.msg('delgInternalNo')} >
                {getFieldDecorator('ref_external_no', {
                  initialValue: fieldInits.ref_external_no,
                })(<Input />)}
              </FormItem>
            </Col>
            <Col sm={24}>
              <FormItem label="备注">
                {getFieldDecorator('remark', {
                  initialValue: fieldInits.remark,
                })(<Input.TextArea autosize={{ minRows: 1, maxRows: 4 }} />)}
              </FormItem>
            </Col>
          </Row>
        </Card>
      </div>
    );
  }
}
