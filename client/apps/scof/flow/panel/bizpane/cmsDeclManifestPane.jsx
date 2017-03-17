import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Collapse, Form, Col, Row, Select } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import FlowTriggerTable from '../compose/flowTriggerTable';
import { formatMsg } from '../../message.i18n';

const FormItem = Form.Item;
const Panel = Collapse.Panel;
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    bizManifest: state.scofFlow.cmsParams.bizManifest,
  })
)
export default class CMSDeclManifestPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
  }
  msg = formatMsg(this.props.intl)
  render() {
    const { form: { getFieldDecorator }, model, onNodeActionsChange, bizManifest: { trades, agents, templates } } = this.props;
    const ownerTitle = model.kind === 'export' ? this.msg('manifestProducer') : this.msg('manifestConsumer');
    return (
      <Collapse bordered={false} defaultActiveKey={['properties', 'events']}>
        <Panel header={this.msg('bizProperties')} key="properties">
          <Row gutter={16}>
            <Col sm={24} lg={12}>
              <FormItem label={this.msg('manifestTrading')}>
                {getFieldDecorator('trading', {
                  initialValue: model.trading,
                })(<Select>
                  {
                      trades.map(tr => <Option value={tr.code} key={tr.code}>{tr.code}|{tr.name}</Option>)
                    }
                </Select>)}
              </FormItem>
            </Col>
            <Col sm={24} lg={12}>
              <FormItem label={ownerTitle}>
                {getFieldDecorator('owner', {
                  initialValue: model.owner,
                })(<Select>
                  {
                      trades.map(tr => <Option value={tr.code} key={tr.code}>{tr.code}|{tr.name}</Option>)
                    }
                </Select>)}
              </FormItem>
            </Col>
            <Col sm={24} lg={12}>
              <FormItem label={this.msg('manifestAgent')}>
                {getFieldDecorator('agent', {
                  initialValue: model.agent,
                })(<Select>
                  {
                      agents.map(ag => <option value={ag.code} key={ag.code}>{ag.code}|{ag.name}</option>)
                    }
                </Select>)}
              </FormItem>
            </Col>
            <Col sm={24} lg={12}>
              <FormItem label={this.msg('manifestTemplate')}>
                {getFieldDecorator('manifest_template', {
                  initialValue: model.manifest_template,
                })(<Select>
                  {
                      templates.map(tmp => <option value={tmp.id} key={tmp.id}>{tmp.name}</option>)
                    }
                </Select>)}
              </FormItem>
            </Col>
          </Row>
        </Panel>
        <Panel header={this.msg('bizEvents')} key="events">
          <FlowTriggerTable kind={model.kind} bizObj="cmsManifest" onNodeActionsChange={onNodeActionsChange} />
        </Panel>
      </Collapse>
    );
  }
}
