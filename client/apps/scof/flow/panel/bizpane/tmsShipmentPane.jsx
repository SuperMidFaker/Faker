import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Collapse, Form, Col, Row, Select } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { GOODS_TYPES } from 'common/constants';
import FlowTriggerTable from '../compose/flowTriggerTable';
import * as Location from 'client/util/location';
import { formatMsg } from '../../message.i18n';

const FormItem = Form.Item;
const Panel = Collapse.Panel;
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    tmsParams: state.scofFlow.tmsParams,
  })
)
export default class TMSShipmentPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
  }
  msg = formatMsg(this.props.intl)
  renderConsign = consign => `${consign.name} ${Location.renderLoc(consign)} ${consign.contact || ''} ${consign.mobile || ''}`
  render() {
    const { form: { getFieldDecorator }, onNodeActionsChange, model, tmsParams: { consigners, consignees, transitModes } } = this.props;
    return (
      <Collapse bordered={false} defaultActiveKey={['properties', 'events']}>
        <Panel header={this.msg('bizProperties')} key="properties">
          <Row gutter={16}>
            <Col sm={24} lg={12}>
              <FormItem label={this.msg('consigner')}>
                {getFieldDecorator('consigner_id', {
                  initialValue: model.consigner_id,
                })(<Select allowClear>
                  {
                    consigners.map(cg => <Option value={cg.node_id} key={cg.name}>{this.renderConsign(cg)}</Option>)
                  }
                </Select>)}
              </FormItem>
            </Col>
            <Col sm={24} lg={12}>
              <FormItem label={this.msg('consignee')}>
                {getFieldDecorator('consignee_id', {
                  initialValue: model.consignee_id,
                })(<Select allowClear>
                  {
                    consignees.map(cg => <Option value={cg.node_id} key={cg.name}>{this.renderConsign(cg)}</Option>)
                  }
                </Select>)}
              </FormItem>
            </Col>
            <Col sm={24} lg={12}>
              <FormItem label={this.msg('transitMode')}>
                {getFieldDecorator('transit_mode', {
                  initialValue: model.transit_mode,
                })(<Select allowClear>
                  {
                    transitModes.map(tr =>
                      <Option value={tr.mode_code} key={tr.mode_code}>{tr.mode_name}</Option>
                    )
                  }
                </Select>)}
              </FormItem>
            </Col>
            <Col sm={24} lg={12}>
              <FormItem label={this.msg('cargoType')}>
                {getFieldDecorator('goods_type', {
                  initialValue: model.goods_type,
                })(<Select allowClear>
                  {
                    GOODS_TYPES.map(gt => <Option value={gt.value} key={gt.value}>{gt.text}</Option>)
                  }
                </Select>)}
              </FormItem>
            </Col>
          </Row>
        </Panel>
        <Panel header={this.msg('bizEvents')} key="events">
          <FlowTriggerTable kind={model.kind} bizObj="tmsShipment" onNodeActionsChange={onNodeActionsChange} />
        </Panel>
      </Collapse>
    );
  }
}
