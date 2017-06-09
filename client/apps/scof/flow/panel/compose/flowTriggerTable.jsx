import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Table } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { openAddTriggerModal } from 'common/reducers/scofFlow';
import { NODE_TRIGGERS, NODE_CREATABLE_BIZ_OBJECTS, NODE_BIZ_OBJECTS } from 'common/constants';
import AddTriggerModal from './addTriggerModal';
import { formatMsg } from '../../message.i18n';

@injectIntl
@connect(state => ({
  nodeActions: state.scofFlow.nodeActions,
}), { openAddTriggerModal })
export default class FlowTriggerTable extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    kind: PropTypes.oneOf(['import', 'export', 'tms', 'cwm']),
    bizObj: PropTypes.string,
    nodeActions: PropTypes.arrayOf(PropTypes.shape({
      biz_object: PropTypes.string,
      trigger_name: PropTypes.string.isRequired })),
  }
  msg = formatMsg(this.props.intl)
  eventColumns = [
    { dataIndex: 'name' },
    { dataIndex: 'operation',
      width: 76,
      render: (di, row) =>
        <a onClick={() => this.handleTriggerActions(row.key, row.name)}>{this.msg('triggerActions')}</a> },
  ]
  handleTriggerActions = (key, name) => {
    const { bizObj, nodeActions } = this.props;
    const actions = nodeActions.filter(na => bizObj ?
      (na.node_biz_object === bizObj && na.trigger_name === key) : (na.trigger_name === key));
    this.props.openAddTriggerModal({ key, name, actions, node_biz_object: bizObj });
  }
  handleTriggerModalChange = (nodeBizObject, triggerName, newActions) => {
    console.log(this.props);
    // todo this.props will be LAST table, Modal handler is last component handler
    const { nodeActions } = this.props;
    const actions = nodeActions.filter(na => !(nodeBizObject ?
      (na.node_biz_object === nodeBizObject && na.trigger_name === triggerName) : (na.trigger_name === triggerName))).concat(newActions.map(na => ({
        ...na, node_biz_object: nodeBizObject, trigger_name: triggerName,
      })));
    this.props.onNodeActionsChange(actions);
  }
  render() {
    const { kind, bizObj } = this.props;
    let events = [];
    const creatableBizObjects = NODE_CREATABLE_BIZ_OBJECTS[kind].map(nbo => ({ key: nbo.key, text: this.msg(nbo.text) }));
    if (bizObj) {
      events = NODE_BIZ_OBJECTS[kind].filter(nbo => nbo.key === bizObj)[0].triggers.map(tr => ({
        key: tr.key,
        name: this.msg(tr.text),
      }));
    } else {
      events = NODE_TRIGGERS.map(nt => ({ key: nt.key, name: this.msg(nt.text) }));
    }
    return (<div>
      <Table size="middle" columns={this.eventColumns} dataSource={events} pagination={false} showHeader={false} />
      <AddTriggerModal bizObjects={creatableBizObjects} onModalOK={this.handleTriggerModalChange} />
    </div>);
  }
}
