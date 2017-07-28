import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Collapse, Form, Row, Col, Select } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { CMS_IMPORT_DECL_TYPE, CMS_EXPORT_DECL_TYPE } from 'common/constants';
import FlowTriggerTable from '../compose/flowTriggerTable';
import { formatMsg } from '../../message.i18n';

const Panel = Collapse.Panel;
const FormItem = Form.Item;
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    eplist: state.scofFlow.eplist,
  })
)
export default class CMSCustomsDeclPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
  }
  msg = formatMsg(this.props.intl)
  render() {
    const { form: { getFieldDecorator }, model, eplist } = this.props;
    let cmsDeclTypes = [];
    if (model.kind === 'import') {
      cmsDeclTypes = CMS_IMPORT_DECL_TYPE;
    } else if (model.kind === 'export') {
      cmsDeclTypes = CMS_EXPORT_DECL_TYPE;
    }
    return (
      <Collapse bordered={false} defaultActiveKey={['properties', 'events']}>
        <Panel header={this.msg('bizProperties')} key="properties">
          <Row gutter={16}>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('customsDeclType')}>
                {getFieldDecorator('ep_dec_type', {
                  initialValue: model.ep_dec_type,
                })(<Select allowClear>
                  {
                    cmsDeclTypes.map(item => (<Option key={item.value} value={item.value}>{item.text}</Option>))
                  }
                </Select>)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
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
          </Row>
        </Panel>
        <Panel header={this.msg('bizEvents')} key="events">
          <FlowTriggerTable kind={model.kind} bizObj="cmsCustomsDecl" />
        </Panel>
      </Collapse>
    );
  }
}
