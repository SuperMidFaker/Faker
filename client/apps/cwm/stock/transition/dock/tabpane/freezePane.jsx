import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Card, Form, Row, Input, Col, Switch } from 'antd';
import { intlShape, injectIntl } from 'react-intl';

const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
  }),
  { }
)
export default class FreezePane extends React.Component {
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
          <Card noHovering bodyStyle={{ paddingBottom: 0 }} >
            <Row gutter={16}>
              <Col span={8}>
                <FormItem {...formItemLayout} label="是否冻结">
                  <Switch checkedChildren="冻结" unCheckedChildren="解除" />
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label="冻结原因">
                  <Input placeholder="" />
                </FormItem>
              </Col>
            </Row>
          </Card>
          <Button type="primary">确定</Button>
        </Form>
      </div>
    );
  }
}
