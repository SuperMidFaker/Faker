import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Collapse, Form, Col, Row, Select, Switch } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import FlowTriggerTable from '../compose/flowTriggerTable';
import { formatMsg } from '../../message.i18n';

const FormItem = Form.Item;
const Panel = Collapse.Panel;
const Option = Select.Option;

@injectIntl
@connect(state => ({
  bizManifest: state.scofFlow.cmsParams.bizManifest,
}))
export default class CMSDeclManifestPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
  }
  msg = formatMsg(this.props.intl)
  render() {
    const { form: { getFieldDecorator }, model, bizManifest: { templates } } = this.props;
    return (
      <Collapse accordion bordered={false} defaultActiveKey={['properties']}>
        <Panel header={this.msg('bizProperties')} key="properties">
          <Row gutter={16}>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('manifestTemplate')}>
                {getFieldDecorator('manifest_template', {
                  initialValue: model.manifest_template,
                })(<Select allowClear>
                  {
                      templates.map(tmp => <Option value={tmp.id} key={tmp.id}>{tmp.name}</Option>)
                    }
                </Select>)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label="关联导入">
                {getFieldDecorator('correl', {
                  valuePropName: 'checked',
                  initialValue: model.correl,
                })(<Switch />)}
              </FormItem>
            </Col>
          </Row>
        </Panel>
        <Panel header={this.msg('bizEvents')} key="events">
          <FlowTriggerTable kind={model.kind} bizObj="cmsManifest" />
        </Panel>
      </Collapse>
    );
  }
}
