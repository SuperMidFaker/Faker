import React, { PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import AmLeftSidebar from '../components/am-ant-leftbar';
import { format } from 'universal/i18n/helpers';
import messages from './message.i18n';
const formatMsg = format(messages);

@injectIntl
export default class Transport extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    location: PropTypes.object.isRequired,
    children: PropTypes.object.isRequired
  };
  render() {
    const { intl } = this.props;
    const linkMenus = [{
      single: true,
      key: 'tms-0',
      path: '/transport/',
      icon: 's7-display1',
      text: '工作台'
    }, {
      single: true,
      key: 'tms-1',
      path: '/transport/acceptance',
      icon: 's7-next-2',
      text: formatMsg(intl, 'transportAcceptance')
    }, {
      single: true,
      key: 'tms-2',
      path: '/transport/dispatch',
      icon: 's7-mail-open-file',
      text: '调度'
    }, {
      single: true,
      key: 'tms-3',
      path: '/tms/tracking',
      icon: 's7-note',
      text: '追踪'
    }, {
      single: true,
      key: 'tms-4',
      path: '/tms/invoicing',
      icon: 's7-look',
      text: '账单'
    }, {
      single: true,
      key: 'tms-5',
      path: '/tms/setting',
      icon: 's7-settings',
      text: '设置'
    }];
    return (
      <div className="am-content">
        <AmLeftSidebar links={ linkMenus } location={ this.props.location } />
        {this.props.children}
      </div>);
  }
}
