import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Table, Icon, Tag } from 'antd';
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
  actionColumns = [
    { title: 'Mode', dataIndex: 'mode', key: 'mode', width: 50,
      render: (o) => {
        if (o === 'instance') {
          return (<i className="icon icon-fontello-flash-1" />);
        } else {
          return (<i className="icon icon-fontello-back-in-time" />);
        }
      },
    },
    { title: 'Name', dataIndex: 'name', key: 'name', width: 100 },
    { title: 'Actions', dataIndex: 'actions', key: 'actions', width: 100,
      render: () => (<span><Tag>Notify</Tag><Tag>Create</Tag></span>),
    },
    {
      dataIndex: 'operation',
      key: 'operation',
      width: 40,
      render: () => (
        <span className={'table-operation'}>
          <a href="#"><Icon type="pause-circle" /></a>
        </span>
      ),
    },
  ]
  expandedRowRender = () => {
    const triggerData = [];
    triggerData.push({
      key: 0,
      mode: 'instance',
      name: 'This is an instant trigger name',
    }, {
      key: 1,
      mode: 'scheduled',
      name: 'This is a timer name',
    });
    return (
      <Table columns={this.actionColumns} showHeader={false}
        dataSource={triggerData} pagination={false}
      />
    );
  }
  handleAddTrigger = () => {
    this.props.dispatch(openAddTriggerModal());
  }
  eventColumns = [
    { title: this.msg('EventName'), dataIndex: 'name', key: 'event_name' },
    { title: this.msg('EventActions'), key: 'operation', width: 100, render: () => <a onClick={this.handleAddTrigger}>Add Trigger</a> },
  ]
  handleAddTrigger = () => {
    this.props.openAddTriggerModal();
  }
  render() {
    const { events } = this.props;
    return (<div>
      <Table size="middle" columns={this.eventColumns}
        expandedRowRender={this.expandedRowRender}
        dataSource={events} pagination={false} showHeader={false}
      />
      <AddTriggerModal visible={false} />
    </div>);
  }
}
