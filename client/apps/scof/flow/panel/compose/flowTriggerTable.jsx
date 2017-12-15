import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Table } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { openAddTriggerModal } from 'common/reducers/scofFlow';
import { NODE_TRIGGERS, NODE_BIZ_OBJECTS } from 'common/constants';
import { formatMsg } from '../../message.i18n';

@injectIntl
@connect(state => ({
  nodeActions: state.scofFlow.nodeActions,
}), { openAddTriggerModal })
export default class FlowTriggerTable extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    kind: PropTypes.oneOf(['import', 'export', 'tms', 'cwmrec', 'cwmship']),
    bizObj: PropTypes.string,
    nodeActions: PropTypes.arrayOf(PropTypes.shape({
      biz_object: PropTypes.string,
      trigger_name: PropTypes.string.isRequired,
    })),
  }
  msg = formatMsg(this.props.intl)
  eventColumns = [
    { dataIndex: 'name' },
    {
      dataIndex: 'operation',
      width: 90,
      render: (di, row) => {
        const { bizObj, nodeActions } = this.props;
        const actions = nodeActions.filter(na => bizObj ?
          (na.node_biz_object === bizObj && na.trigger_name === row.key) : (na.trigger_name === row.key));
        const label = actions.length > 0 ? `${actions.length}个触发器` : '新增触发器';
        return <a onClick={() => this.handleTriggerActions(row.key, row.name, actions, bizObj)}>{label}</a>;
      },
    },
  ]
  handleTriggerActions = (key, name, actions, bizObj) => {
    this.props.openAddTriggerModal({
      key, name, actions, node_biz_object: bizObj,
    });
  }
  render() {
    const { kind, bizObj } = this.props;
    let events = [];
    if (bizObj) {
      events = NODE_BIZ_OBJECTS[kind].filter(nbo => nbo.key === bizObj)[0].triggers.map(tr => ({
        key: tr.key,
        name: this.msg(tr.text),
      }));
    } else {
      events = NODE_TRIGGERS.map(nt => ({ key: nt.key, name: this.msg(nt.text) }));
    }
    return (
      <Table size="middle" columns={this.eventColumns} dataSource={events} pagination={false} showHeader={false} />
    );
  }
}
