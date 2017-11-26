import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Card, Col, Select, Row, Input } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import ConditionTable from './compose/conditionTable';
import { NODE_BIZ_OBJECTS } from 'common/constants';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;
const Option = Select.Option;


@injectIntl
export default class FlowEdgePanel extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    source: PropTypes.shape({ name: PropTypes.string.isRequired }),
    target: PropTypes.shape({ name: PropTypes.string }),
    onAdd: PropTypes.func.isRequired,
    onDel: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
  }
  msg = formatMsg(this.props.intl)
  render() {
    const { model, source, target, onAdd, onDel, onUpdate } = this.props;
    return (
      <Form layout="vertical" className="form-layout-compact">
        <Card title={this.msg('flowEdge')} bodyStyle={{ padding: 16 }}>
          <Row gutter={16}>
            <Col sm={24} md={8}>
              <Col sm={24}>
                <FormItem label={this.msg('sourceNode')}>
                  <Input value={source.name} readOnly />
                </FormItem>
              </Col>
              {target.kind !== 'terminal' &&
              <Col sm={24}>
                <FormItem label={this.msg('targetNode')}>
                  <Input value={target.name} readOnly />
                </FormItem>
              </Col>
              }
            </Col>
            <Col sm={24} md={16}>
              <FormItem label={<span>
                {this.msg('edgeCondition')}:&nbsp;满足以下
                <Select defaultValue="all" style={{ width: 60 }} >
                  <Option value="all">所有</Option>
                  <Option value="any">任一</Option>
                </Select>
                条件</span>}
              >
                <ConditionTable conditions={model.conditions} bizObjects={NODE_BIZ_OBJECTS[source.kind]}
                  onAdd={onAdd} onUpdate={onUpdate} onDel={onDel}
                />
              </FormItem>
            </Col>
          </Row>
        </Card>
      </Form>);
  }
}
