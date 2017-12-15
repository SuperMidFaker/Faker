/* eslint react/no-multi-comp: 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Form, Card, Col, DatePicker, Row, Input } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../../../message.i18n';
import moment from 'moment';

const formatMsg = format(messages);
const FormItem = Form.Item;

function getFieldInits(formData) {
  const init = {};
  if (formData) {
    ['pre_classify_start_date', 'pre_classify_end_date'].forEach((fd) => {
      init[fd] = !formData[fd] ? null : moment(formData[fd]);
    });
    ['pre_classify_no', 'remark'].forEach((fd) => {
      init[fd] = formData[fd] === undefined ? '' : formData[fd];
    });
  }
  return init;
}

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    fieldInits: getFieldInits(state.cmsTradeitem.itemData),
  }),
  { }
)
export default class SiderForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    form: PropTypes.object.isRequired,
    fieldInits: PropTypes.object.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const { form: { getFieldDecorator }, fieldInits } = this.props;
    return (
      <div>
        <Card>
          <Row gutter={16}>
            <Col sm={24}>
              <FormItem label={this.msg('preClassifyNo')}>
                {getFieldDecorator('pre_classify_no', {
                  initialValue: fieldInits.pre_classify_no,
                })(<Input />)}
              </FormItem>
            </Col>
            <Col sm={24}>
              <FormItem label={this.msg('preClassifyStartDate')}>
                {getFieldDecorator('pre_classify_start_date', {
                  initialValue: fieldInits.pre_classify_start_date,
                })(<DatePicker />)}
              </FormItem>
            </Col>
            <Col sm={24}>
              <FormItem label={this.msg('preClassifyEndDate')}>
                {getFieldDecorator('pre_classify_end_date', {
                  initialValue: fieldInits.pre_classify_end_date,
                })(<DatePicker />)}
              </FormItem>
            </Col>
            <Col sm={24}>
              <FormItem label={this.msg('remark')}>
                {getFieldDecorator('remark', {
                  initialValue: fieldInits.remark,
                })(<Input.TextArea autosize={{ minRows: 1, maxRows: 16 }} />)}
              </FormItem>
            </Col>
          </Row>
        </Card>
      </div>
    );
  }
}
