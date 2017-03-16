import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Table } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { openAddTriggerModal } from 'common/reducers/scofFlow';
import AddTriggerModal from './addTriggerModal';
import { formatMsg } from '../../message.i18n';

@injectIntl
@connect()
export default class FlowTriggerTable extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    bizObj: PropTypes.string,
    events: PropTypes.arrayOf(PropTypes.shape({
      key: PropTypes.string.isRequired, name: PropTypes.string.isRequired })).isRequired,
  }
  msg = formatMsg(this.props.intl)
  handleTriggerActions = () => {
    this.props.dispatch(openAddTriggerModal());
  }
  eventColumns = [
    { dataIndex: 'name', key: 'event_name' },
    { key: 'operation', width: 100, render: () => <a onClick={this.handleTriggerActions}>{this.msg('triggerActions')}</a> },
  ]
  render() {
    const { events } = this.props;
    return (<div>
      <Table size="middle" columns={this.eventColumns} dataSource={events} pagination={false} showHeader={false} />
      <AddTriggerModal />
    </div>);
  }
}
