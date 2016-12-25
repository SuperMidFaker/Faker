import React from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Button, Card, Checkbox, Dropdown, Icon, Menu, Tabs, Timeline } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
const formatMsg = format(messages);
const TabPane = Tabs.TabPane;
const timeFormat = 'YYYY-MM-DD HH:mm';

@injectIntl
@connect(
  state => ({
    logs: state.shipment.previewer.logs,
  })
)
export default class LogPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  render() {
    const { logs } = this.props;
    const menu = (
      <Menu>
        <Menu.Item key="all"><Checkbox >选择全部</Checkbox></Menu.Item>
        <Menu.Divider />
        <Menu.Item key="operation"><Checkbox >操作事件</Checkbox></Menu.Item>
        <Menu.Item key="tracking"><Checkbox >追踪事件</Checkbox></Menu.Item>
      </Menu>
    );
    return (
      <div>
        <Card bodyStyle={{ padding: 8 }}>
          <Tabs defaultActiveKey="log">
            <TabPane tab={<span><Icon type="message" />备注</span>} key="log" />
            <TabPane tab={<span><Icon type="environment-o" />追踪</span>} key="location" />
            <TabPane tab={<span><Icon type="exception" />异常</span>} key="exception" />
          </Tabs>
        </Card>
        <section className="timeline">
          <h3>
            <div className="toolbar-right">
              <Dropdown overlay={menu}>
                <Button type="ghost"><Icon type="filter" /> (3/3)</Button>
              </Dropdown>
            </div>
            动态
          </h3>
          <Timeline>
            {
              logs.map(
                (item, i) =>
                  <Timeline.Item key={i} color={i === logs.length - 1 ? 'green' : 'blue'}>
                    <p>{this.msg(item.type)}</p>
                    <p>{item.content}</p>
                    <p>{`操作人员: ${item.login_name}`}</p>
                    <p>{item.created_date && moment(item.created_date).format(timeFormat)}</p>
                  </Timeline.Item>
                )
            }
          </Timeline>
        </section>
      </div>
    );
  }
}
