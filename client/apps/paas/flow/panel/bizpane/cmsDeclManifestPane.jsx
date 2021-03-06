import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Collapse, Form, Col, Row, Select, Switch } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import FlowTriggerTable from '../compose/flowTriggerTable';
import { formatMsg } from '../../message.i18n';

const FormItem = Form.Item;
const { Panel } = Collapse;
const { Option } = Select;

@injectIntl
@connect(state => ({
  tenantId: state.account.tenantId,
  bizManifest: state.scofFlow.cmsParams.bizManifest,
}))
export default class CMSDeclManifestPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.shape({ getFieldDecorator: PropTypes.func }).isRequired,
  }
  msg = formatMsg(this.props.intl)
  render() {
    const {
      form: { getFieldDecorator }, model, tenantId, bizManifest: { templates },
    } = this.props;
    const provider = model.provider_tenant_id === tenantId;
    return (
      <Collapse accordion bordered={false} defaultActiveKey={['properties']}>
        <Panel header={this.msg('bizProperties')} key="properties">
          <Row gutter={16}>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('manifestTemplate')}>
                {getFieldDecorator('manifest_template', {
                  initialValue: provider ? model.manifest_template : null,
                })(<Select allowClear disabled={!provider}>
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
                  initialValue: provider ? model.correl : null,
                })(<Switch disabled={!provider} />)}
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
