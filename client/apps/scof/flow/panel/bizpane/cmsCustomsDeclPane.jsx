import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Collapse } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import FlowTriggerTable from '../compose/flowTriggerTable';
import { formatMsg } from '../../message.i18n';

const Panel = Collapse.Panel;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
  })
)
export default class CMSCustomsDeclPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
  }
  msg = formatMsg(this.props.intl)
  eventData = [{
    key: 'customsCreated',
    name: 'onCreated',
  }, {
    key: 'customsReviewed',
    name: 'onReviewed',
  }, {
    key: 'customsDeclared',
    name: 'onDeclared',
  }, {
    key: 'customsReleased',
    name: 'onReleased',
  }, {
    key: 'customsFinished',
    name: 'onFinished',
  }]
  render() {
    return (
      <Collapse bordered={false} defaultActiveKey={['events']}>
        <Panel header={this.msg('events')} key="events">
          <FlowTriggerTable events={this.eventData} />
        </Panel>
      </Collapse>
    );
  }
}
