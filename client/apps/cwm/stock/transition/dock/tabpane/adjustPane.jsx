import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Card, Form, Row, Input, Col } from 'antd';
import { intlShape, injectIntl } from 'react-intl';

const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
  }),
  { }
)
export default class AdjustPane extends React.Component {
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
          <Card noHovering bodyStyle={{ padding: 16 }}>
            <Row gutter={16}>
              <Col span={8}>
                <FormItem {...formItemLayout} label="增减数量">
                  <Input placeholder="" />
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label="目标数量">
                  <Input />
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label="调整原因">
                  <Input placeholder="" />
                </FormItem>
              </Col>
            </Row>
          </Card>
          <Button type="primary">执行调整</Button>
        </Form>
      </div>
    );
  }
}
