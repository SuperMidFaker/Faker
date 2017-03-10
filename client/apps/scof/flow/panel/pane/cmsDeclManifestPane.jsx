import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Collapse, Form, Col, Row, Select } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import FlowTriggerTable from '../flowTriggerTable';
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
  eventData = [{
    key: 'manifestCreated',
    name: 'onCreated',
  }, {
    key: 'manifestGenerated',
    name: 'onGenerated',
  }, {
    key: 'manifestFinished',
    name: 'onFinished',
  }]
  render() {
    const { form: { getFieldDecorator }, bizManifest: { trades, agents, templates } } = this.props;
    return (
      <Collapse bordered={false} defaultActiveKey={['properties', 'events']}>
        <Panel header={this.msg('properties')} key="properties">
          <Row gutter={16}>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('trading')}>
                {getFieldDecorator('trading', {
                })(<Select>
                  {
                      trades.map(tr => <Option value={tr.code} key={tr.code}>{tr.code}|{tr.name}</Option>)
                    }
                </Select>)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('owner')}>
                {getFieldDecorator('owner', {
                })(<Select>
                  {
                      trades.map(tr => <Option value={tr.code} key={tr.code}>{tr.code}|{tr.name}</Option>)
                    }
                </Select>)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('agent')}>
                {getFieldDecorator('agent', {
                })(<Select>
                  {
                      agents.map(ag => <Option value={ag.code} key={ag.code}>{ag.code}|{ag.name}</Option>)
                    }
                </Select>)}
              </FormItem>
            </Col>
            <Col sm={24} lg={12}>
              <FormItem label={this.msg('manifestTemplate')}>
                {getFieldDecorator('manifest_template', {
                })(<Select>
                  {
                      templates.map(tmp => <Option value={tmp.id} key={tmp.id}>{tmp.name}</Option>)
                    }
                </Select>)}
              </FormItem>
            </Col>
          </Row>
        </Panel>
        <Panel header={this.msg('events')} key="events">
          <FlowTriggerTable events={this.eventData} />
        </Panel>
      </Collapse>
    );
  }
}
