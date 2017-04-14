import React from 'react';
// import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
// import moment from 'moment';
import { Timeline, Card } from 'antd';
import { format } from 'client/common/i18n/helpers';
import MdIcon from 'client/components/MdIcon';
import CMSNodeCard from './cards/cmsNodeCard';
import TMSNodeCard from './cards/tmsNodeCard';
import CWMNodeCard from './cards/cwmNodeCard';
import messages from '../../message.i18n';
const formatMsg = format(messages);

// const timeFormat = 'YYYY-MM-DD HH:mm';

@injectIntl

export default class FlowPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  render() {
    return (
      <div className="pane-content tab-pane">
        <Card>
          <Timeline>
            <Timeline.Item dot={<MdIcon mode="ikons" type="login" />}>
              <CMSNodeCard title="清关" />
            </Timeline.Item>
            <Timeline.Item dot={<MdIcon type="truck" />}>
              <TMSNodeCard title="运输" />
            </Timeline.Item>
            <Timeline.Item dot={<MdIcon type="layers" />}>
              <CWMNodeCard title="仓储" />
            </Timeline.Item>
            <Timeline.Item dot={<MdIcon type="truck" />}>
              <TMSNodeCard title="运输" />
            </Timeline.Item>
          </Timeline>
        </Card>
      </div>);
  }
}
