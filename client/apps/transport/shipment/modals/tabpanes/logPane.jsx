import React from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Timeline, Card } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
const formatMsg = format(messages);

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
    return (
      <div className="pane-content tab-pane">
        <Card>
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
        </Card>
      </div>
    );
  }
}
