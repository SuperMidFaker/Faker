import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Form, Input, Col, Row, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { updateSFExpressApp } from 'common/reducers/openIntegration';
import { formatMsg } from '../../message.i18n';

const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    app: state.openIntegration.sfexpress,
  }),
  { updateSFExpressApp }
)
@Form.create()
export default class ParamsForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.shape({ getFieldDecorator: PropTypes.func.isRequired }).isRequired,
    config: PropTypes.shape({
      url: PropTypes.string,
      checkword: PropTypes.string,
      accesscode: PropTypes.string,
      custid: PropTypes.string,
    }).isRequired,
  }
  msg = formatMsg(this.props.intl)
  handleSave = () => {
    const { app } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.updateSFExpressApp({ ...values, uuid: app.uuid }).then((result) => {
          if (result.error) {
            message.error(result.error.message, 10);
          } else {
            message.success('保存成功');
            // this.context.router.goBack();
          }
        });
      }
    });
  }
  render() {
    const { form: { getFieldDecorator }, config } = this.props;
    // url, checkword, accessCode, custid
    return (
      <Form>
        <Row gutter={16}>
          <Col sm={24} lg={24}>
            <FormItem label={this.msg('sfexpressUrl')}>
              {getFieldDecorator('url', {
                initialValue: config.url,
                rules: [{ required: true, message: this.msg('parameterRequired') }],
              })(<Input />)}
            </FormItem>
          </Col>
          <Col sm={24} lg={12}>
            <FormItem label={this.msg('sfexpressCheckword')}>
              {getFieldDecorator('checkword', {
                initialValue: config.checkword,
                rules: [{ required: true, message: this.msg('parameterRequired') }],
              })(<Input />)}
            </FormItem>
          </Col>
          <Col sm={24} lg={12}>
            <FormItem label={this.msg('sfexpressAccesscode')}>
              {getFieldDecorator('accesscode', {
                initialValue: config.accesscode,
                rules: [{ required: true, message: this.msg('parameterRequired') }],
              })(<Input />)}
            </FormItem>
          </Col>
          <Col sm={24} lg={12}>
            <FormItem label={this.msg('sfexpressCustid')}>
              {getFieldDecorator('custid', {
                initialValue: config.custid,
                rules: [{ required: true, message: this.msg('parameterRequired') }],
              })(<Input />)}
            </FormItem>
          </Col>
          <Col span={24}>
            <FormItem>
              <Button type="primary" icon="save" onClick={this.handleSave}>{this.msg('save')}</Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
