/* eslint react/no-multi-comp: 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Form, Input, Card, Col, Row } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
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
  init.claim_do_awb = formData.claim_do_awb === undefined ? 1 : formData.claim_do_awb;
  return init;
}
@injectIntl
@connect(state => ({
  clients: state.cmsDelegation.formRequire.clients,
  fieldInits: getFieldInits(state.account.aspect, state.cmsDelegation.formData),
}), )
export default class SiderForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    fieldInits: PropTypes.object.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);
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
