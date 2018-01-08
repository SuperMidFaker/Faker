import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Collapse, Form, Radio, Row, Col, Select } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { CMS_DECL_CHANNEL, CMS_IMPORT_DECL_TYPE, CMS_EXPORT_DECL_TYPE } from 'common/constants';
import FlowTriggerTable from '../compose/flowTriggerTable';
import { formatMsg } from '../../message.i18n';

const Panel = Collapse.Panel;
const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

@injectIntl
@connect(state => ({
  eplist: state.scofFlow.eplist,
  qplist: state.scofFlow.qplist,
}))
export default class CMSCustomsDeclPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
  }
  msg = formatMsg(this.props.intl)
  render() {
    const {
      form: { getFieldDecorator, getFieldValue }, model, eplist, qplist,
    } = this.props;
    let cmsDeclTypes = [];
    if (model.kind === 'import') {
      cmsDeclTypes = CMS_IMPORT_DECL_TYPE;
    } else if (model.kind === 'export') {
      cmsDeclTypes = CMS_EXPORT_DECL_TYPE;
    }
    return (
      <Collapse accordion bordered={false} defaultActiveKey={['properties']}>
        <Panel header={this.msg('bizProperties')} key="properties">
          <Row gutter={16}>
            <Col sm={24} lg={12}>
              <FormItem label={this.msg('customsDeclType')}>
                {getFieldDecorator('ep_dec_type', {
                  initialValue: model.ep_dec_type,
                })(<Select allowClear>
                  {cmsDeclTypes.map(item => (<Option key={item.value} value={item.value}>{item.text}</Option>))}
                </Select>)}
              </FormItem>
            </Col>
            <Col sm={24} lg={12}>
              <FormItem label={this.msg('customsDeclChannel')}>
                {getFieldDecorator('dec_channel', {
                  initialValue: model.dec_channel,
                })(<RadioGroup>
                  {Object.keys(CMS_DECL_CHANNEL).map((declChannel) => {
                      const channel = CMS_DECL_CHANNEL[declChannel];
                      return <RadioButton value={channel.value} key={channel.value} disabled={channel.disabled}>{channel.text}</RadioButton>;
                    })}
                </RadioGroup>)}
              </FormItem>
            </Col>
            { getFieldValue('dec_channel') === CMS_DECL_CHANNEL.EP.value && <Col sm={24} lg={12}>
              <FormItem label={this.msg('customsEasipass')}>
                {getFieldDecorator('ep_app_uuid', {
                  initialValue: model.ep_app_uuid,
                })(<Select allowClear>
                  {
                    eplist.map(item => (<Option key={item.app_uuid} value={item.app_uuid}>{item.name}</Option>))
                  }
                </Select>)}
              </FormItem>
            </Col>
            }
            { getFieldValue('dec_channel') === CMS_DECL_CHANNEL.QP.value && <Col sm={24} lg={12}>
              <FormItem label={this.msg('customsQuickpass')}>
                {getFieldDecorator('ep_app_uuid', {
                  initialValue: model.ep_app_uuid,
                })(<Select allowClear>
                  {
                    qplist.map(item => (<Option key={item.app_uuid} value={item.app_uuid}>{item.name}</Option>))
                  }
                </Select>)}
              </FormItem>
            </Col>
            }
          </Row>
        </Panel>
        <Panel header={this.msg('bizEvents')} key="events">
          <FlowTriggerTable kind={model.kind} bizObj="cmsCustomsDecl" />
        </Panel>
      </Collapse>
    );
  }
}
