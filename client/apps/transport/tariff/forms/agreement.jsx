import React, { PropTypes } from 'react';
import { Col, Form, Input, Button } from 'antd';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

@Form.create()
export default class AgreementForm extends React.Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
  }
  render() {
    const { form, submitting, form: { getFieldProps } } = this.props;
    return (
      <Form horizontal form={form}>
        <div className="panel-body body-responsive">
          <Col sm={16} style={{ padding: '16px 8px 8px 16px' }}>
            <FormItem label="发票号" {...formItemLayout}>
              <Input {...getFieldProps('invoice_no', {
                initialValue: '',
              })} />
            </FormItem>
          </Col>
          <div style={{ padding: '16px' }}>
            <Button size="large" type="primary" style={{ marginRight: 20 }}
              loading={submitting} onClick={this.handleSaveBtnClick}
            >
            保存
            </Button>
          </div>
        </div>
      </Form>);
  }
}
