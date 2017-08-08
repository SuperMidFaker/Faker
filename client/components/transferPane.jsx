import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Card, Form, Row, Input, Col, DatePicker } from 'antd';
import { intlShape, injectIntl } from 'react-intl';

const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
  }),
  { }
)
export default class TransferPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  state = {
    tabKey: '',
  }

  render() {
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    };
    return (
      <div className="pane-content tab-pane">
        <Form>
          <Card noHovering bodyStyle={{ padding: 16 }} >
            <Row gutter={16}>
              <Col span={8}>
                <FormItem {...formItemLayout} label="所属货主">
                  <Input placeholder="" />
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label="商品货号">
                  <Input placeholder="" />
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label="品名">
                  <Input placeholder="" />
                </FormItem>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <FormItem {...formItemLayout} label="批次号">
                  <Input placeholder="" />
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label="序列号">
                  <Input placeholder="" />
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label="库别">
                  <Input placeholder="" />
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label="包装情况">
                  <Input placeholder="" />
                </FormItem>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <FormItem {...formItemLayout} label="扩展属性1">
                  <Input placeholder="" />
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label="扩展属性2">
                  <Input placeholder="" />
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label="扩展属性3">
                  <Input placeholder="" />
                </FormItem>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <FormItem {...formItemLayout} label="扩展属性4">
                  <Input placeholder="" />
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label="扩展属性5">
                  <Input placeholder="" />
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label="扩展属性6">
                  <Input placeholder="" />
                </FormItem>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <FormItem {...formItemLayout} label="失效日期">
                  <DatePicker placeholder="" style={{ width: '100%' }} />
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label="扩展属性7">
                  <DatePicker placeholder="" style={{ width: '100%' }} />
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label="扩展属性8">
                  <DatePicker placeholder="" style={{ width: '100%' }} />
                </FormItem>
              </Col>
            </Row>
          </Card>
          <Card noHovering bodyStyle={{ padding: 16 }}>
            <Row gutter={16}>
              <Col span={8}>
                <FormItem {...formItemLayout} label="转移数量">
                  <Input placeholder="" />
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label="转移原因">
                  <Input placeholder="" />
                </FormItem>
              </Col>
            </Row>
          </Card>
          <Button type="primary">执行转移</Button>
        </Form>
      </div>
    );
  }
}
