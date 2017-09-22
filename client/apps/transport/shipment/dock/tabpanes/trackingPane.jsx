import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Button, Card, Collapse, Checkbox, Dropdown, Icon, Menu, Timeline } from 'antd';
import ActivityOperation from './activityOperation';
import { SHIPMENT_LOG_CATEGORY } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
const formatMsg = format(messages);
const Panel = Collapse.Panel;
const timeFormat = 'YYYY-MM-DD HH:mm';

const MENUKEYS = ['all', 'operation', 'tracking', 'exception'];
@injectIntl
@connect(
  state => ({
    logs: state.shipment.previewer.logs,
  })
)
export default class TrackingPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    logs: PropTypes.array.isRequired,
    sourceType: PropTypes.string.isRequired,
  }
  state = {
    selectedKeys: [...MENUKEYS],
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  handleSelect = (item) => {
    let { selectedKeys } = this.state;
    const index = selectedKeys.indexOf(item);
    if (index === -1) {
      if (item === 'all') {
        selectedKeys = [...MENUKEYS];
      } else {
        selectedKeys.push(item);
        if (selectedKeys.length === MENUKEYS.length - 1) {
          selectedKeys.push('all');
        }
      }
    } else if (item === 'all') {
      selectedKeys = [];
    } else {
      if (selectedKeys.length === MENUKEYS.length) {
        selectedKeys.splice(selectedKeys.indexOf('all'), 1);
      }
      selectedKeys.splice(selectedKeys.indexOf(item), 1);
    }
    this.setState({
      selectedKeys,
    });
  }
  renderTimeLine = (log, index) => {
    const style = { backgroundColor: '#fff' };
    if (log.category === SHIPMENT_LOG_CATEGORY.message) {
      return (
        <Timeline.Item key={index} dot={<Icon type="message" style={style} />}>
          <p>{this.msg(log.type)} {log.content}</p>
          <p>{`${log.tenant_name} ${log.login_name}`}</p>
          <p>{log.created_date && moment(log.created_date).format(timeFormat)}</p>
        </Timeline.Item>
      );
    } else if (log.category === SHIPMENT_LOG_CATEGORY.operation) {
      return (
        <Timeline.Item key={index} dot={<Icon type="retweet" style={style} />}>
          <p>{this.msg(log.type)} {log.content}</p>
          <p>{`${log.tenant_name} ${log.login_name}`}</p>
          <p>{log.created_date && moment(log.created_date).format(timeFormat)}</p>
        </Timeline.Item>
      );
    } else if (log.category === SHIPMENT_LOG_CATEGORY.tracking) {
      return (
        <Timeline.Item key={index} dot={<Icon type="environment-o" style={style} />}>
          <p>{this.msg(log.type)} {log.content}</p>
          <p>{`${log.tenant_name} ${log.login_name}`}</p>
          <p>{log.created_date && moment(log.created_date).format(timeFormat)}</p>
        </Timeline.Item>
      );
    } else if (log.category === SHIPMENT_LOG_CATEGORY.exception) {
      return (
        <Timeline.Item key={index} color="red" dot={<Icon type="exclamation-circle-o" style={style} />}>
          <p>{this.msg(log.type)} {log.content}</p>
          <p>{`${log.tenant_name} ${log.login_name}`}</p>
          <p>{log.created_date && moment(log.created_date).format(timeFormat)}</p>
        </Timeline.Item>
      );
    } else {
      return (
        <Timeline.Item key={index} color="blue">
          <p>{this.msg(log.type)} {log.content}</p>
          <p>{`${log.tenant_name} ${log.login_name}`}</p>
          <p>{log.created_date && moment(log.created_date).format(timeFormat)}</p>
        </Timeline.Item>
      );
    }
  }
  render() {
    const { logs, sourceType } = this.props;
    const { selectedKeys } = this.state;
    let filteredLogs = logs;
    filteredLogs = logs.filter(log => selectedKeys.indexOf(log.category) >= 0);
    const menu = (
      <Menu>
        <Menu.Item key="all">
          <Checkbox checked={selectedKeys.indexOf('all') >= 0} onChange={() => this.handleSelect('all')}>选择全部</Checkbox>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="operation">
          <Checkbox checked={selectedKeys.indexOf('operation') >= 0} onChange={() => this.handleSelect('operation')}>操作记录</Checkbox>
        </Menu.Item>
        <Menu.Item key="tracking">
          <Checkbox checked={selectedKeys.indexOf('tracking') >= 0} onChange={() => this.handleSelect('tracking')}>追踪事件</Checkbox>
        </Menu.Item>
        <Menu.Item key="exception">
          <Checkbox checked={selectedKeys.indexOf('exception') >= 0} onChange={() => this.handleSelect('exception')}>异常事件</Checkbox>
        </Menu.Item>
      </Menu>
    );
    const timelineHeader = (
      <div>
        <span>操作记录</span>
        <div className="toolbar-right">
          <Dropdown overlay={menu} onClick={e => e.stopPropagation()}>
            <Button type="ghost">
              <Icon type="filter" /> ({selectedKeys.indexOf('all') >= 0 ? MENUKEYS.length - 1 : selectedKeys.length }/{MENUKEYS.length - 1})
            </Button>
          </Dropdown>
        </div>
      </div>
    );
    return (
      <div className="pane-content tab-pane">
        <ActivityOperation sourceType={sourceType} />
        <Card bodyStyle={{ padding: 0 }} noHovering>
          <Collapse bordered={false} defaultActiveKey={['timeline']}>
            <Panel header={timelineHeader} key="timeline">
              <Timeline>
                {
                  filteredLogs.map(this.renderTimeLine)
                }
              </Timeline>
            </Panel>
          </Collapse>
        </Card>
      </div>
    );
  }
}
