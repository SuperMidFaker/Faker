import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Card, Form, Row, Input, Col } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import LocationSelect from 'client/apps/cwm/common/locationSelect';

const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
  }),
  { }
)
export default class TransitPane extends React.Component {
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
        <Form className="form-layout-compact">
          <Card title="属性修改" noHovering bodyStyle={{ padding: 16 }} >
            <Row gutter={16}>
              <Col span={8}>
                <FormItem {...formItemLayout} label="入库单号">
                  <Input placeholder="ASN/监管入库单号" />
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label="批次号">
                  <Input placeholder="批次号" />
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label="序列号">
                  <Input placeholder="序列号" />
                </FormItem>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <FormItem {...formItemLayout} label="入库单号">
                  <Input placeholder="ASN/监管入库单号" />
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label="批次号">
                  <Input placeholder="批次号" />
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label="序列号">
                  <Input placeholder="序列号" />
                </FormItem>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <FormItem {...formItemLayout} label="入库单号">
                  <Input placeholder="ASN/监管入库单号" />
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label="批次号">
                  <Input placeholder="批次号" />
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label="序列号">
                  <Input placeholder="序列号" />
                </FormItem>
              </Col>
            </Row>
          </Card>
          <Card title="数量调整" noHovering bodyStyle={{ padding: 16 }} style={{ marginTop: 16 }}>
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
          <Card title="货物移动" noHovering bodyStyle={{ padding: 16 }} style={{ marginTop: 16 }}>
            <Row gutter={16}>
              <Col span={8}>
                <FormItem {...formItemLayout} label="移动数量">
                  <Input placeholder="" />
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label="目标库位">
                  <LocationSelect />
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label="移动原因">
                  <Input placeholder="" />
                </FormItem>
              </Col>

            </Row>
          </Card>
          <Card title="冻结/解冻" noHovering bodyStyle={{ padding: 16 }} style={{ marginTop: 16 }} />
        </Form>
      </div>
    );
  }
}
