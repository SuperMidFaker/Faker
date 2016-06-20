import React, { Component } from 'react';
import { Form, Input, Row, Col, Button, Card, Select } from 'ant-ui';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: {span: 10},
  wrapperCol: {span: 14}
};

export default class AcceptanceForm extends Component {
  render() {
    return (
      <div className="main-content">
        <div className="page-body" style={{padding: 16}}>
          <Form horizontal>
            <Row>
              <Card>
                <Col sm={8}>
                  <FormItem label="客户:" {...formItemLayout} required>
                    <Select/>
                  </FormItem>
                  <FormItem label="发票号:" {...formItemLayout}>
                    <Input/>
                  </FormItem>
                  <FormItem label="提运单号:" {...formItemLayout}>
                    <Input/>
                  </FormItem>
                  <FormItem label="件数:" {...formItemLayout}>
                    <Input/>
                  </FormItem>
                  <FormItem label="内部编号:" {...formItemLayout}>
                    <Input/>
                  </FormItem>
                </Col>
                <Col sm={8}>
                  <FormItem label="报关类型:" {...formItemLayout}>
                    <Select />
                  </FormItem>
                  <FormItem label="合同号:" {...formItemLayout}>
                    <Input/>
                  </FormItem>
                  <FormItem label="运输方式:" {...formItemLayout}>
                    <Select/>
                  </FormItem>
                  <FormItem label="重量:" {...formItemLayout}>
                    <Input/>
                  </FormItem>
                </Col>
                <Col sm={8}>
                  <FormItem label="备案号:" {...formItemLayout}>
                    <Input/>
                  </FormItem>
                  <FormItem label="订单号:" {...formItemLayout}>
                    <Input/>
                  </FormItem>
                  <FormItem label="航名航次:" {...formItemLayout}>
                    <Input/>
                  </FormItem>
                  <FormItem label="贸易方式:" {...formItemLayout}>
                    <Select/>
                  </FormItem>
                </Col>
              </Card>
            </Row>
            <Row gutter={16} style={{marginTop: 16, marginBottom: 16}}>
              <Col sm={6}>
                <Card title="发票"/>
              </Col>
              <Col sm={6}>
                <Card title="合同"/>
              </Col>
              <Col sm={6}>
                <Card title="箱单"/>
              </Col>
              <Col sm={6}>
                <Card title="其他"/>
              </Col>
            </Row>
            <Row>
              <Button size="large" type="primary" style={{marginRight: 20}}>保存</Button>
              <Button size="large">一键接单</Button>
            </Row>
          </Form>
        </div>
      </div>
    );
  }
}
