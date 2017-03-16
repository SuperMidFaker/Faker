import React, { Component, PropTypes } from 'react';
import { Form, Card, Col, Icon, Row, Input, Tooltip } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import ConditionTable from './compose/conditionTable';
import { NODE_BIZ_OBJECTS } from 'common/constants';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;

@injectIntl
export default class FlowEdgePanel extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    source: PropTypes.shape({ name: PropTypes.string.isRequired }),
    target: PropTypes.shape({ name: PropTypes.string.isRequired }),
    onAdd: PropTypes.func.isRequired,
    onDel: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
  }
  msg = formatMsg(this.props.intl)
  render() {
    const { model, source, target, onAdd, onDel, onUpdate } = this.props;
    return (
      <Card title={this.msg('flowEdge')} bodyStyle={{ padding: 16 }}>
        <Row gutter={16}>
          <Col sm={12}>
            <FormItem label={this.msg('sourceNode')}>
              <Input defaultValue={source.name} readOnly />
            </FormItem>
          </Col>
          <Col sm={12}>
            <FormItem label={this.msg('targetNode')}>
              <Input defaultValue={target.name} readOnly />
            </FormItem>
          </Col>
          <FormItem label={<span>
            {this.msg('edgeCondition')}&nbsp;
            <Tooltip title={this.msg('tooltipEdgeCondition')}>
              <Icon type="question-circle-o" />
            </Tooltip></span>}
          >
            <ConditionTable conditions={model.conditions} bizObjects={NODE_BIZ_OBJECTS[source.kind]}
              onAdd={onAdd} onUpdate={onUpdate} onDel={onDel}
            />
          </FormItem>
        </Row>
      </Card>
    );
  }
}
