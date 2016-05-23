import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import AmNavBar from '../components/am-navbar';
import AmLeftSidebar from '../components/am-ant-leftbar';
import { BRANCH } from '../../common/constants';
import { format } from 'universal/i18n/helpers';
import messages from './message.i18n';
const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    accountType: state.account.type
  })
)
export default class CorpPack extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    location: PropTypes.object.isRequired,
    accountType: PropTypes.string.isRequired,
    children: PropTypes.object.isRequired
  };

  render() {
    const { intl } = this.props;
    const linkMenus = [{
      single: true,
      key: 'corpsetting-1',
      path: '/corp/info',
      icon: 'zmdi zmdi-info-outline',
      text: formatMsg(intl, 'corpInfo')
    }, {
      single: true,
      key: 'corpsetting-2',
      path: '/corp/personnel',
      icon: 'zmdi zmdi-accounts-alt',
      text: formatMsg(intl, 'personnelUser')
    }, {
      invisible: this.props.accountType === BRANCH,
      single: true,
      key: 'corpsetting-3',
      path: '/corp/organization',
      icon: 'zmdi zmdi-group',
      text: formatMsg(intl, 'organTitle')
    }, {
      single: false,
      key: 'corpsetting-4',
      icon: 'zmdi zmdi-share',
      text: formatMsg(intl, 'partnership'),
      sublinks: [{
        key: 'partner-1',
        path: '/corp/partners',
        text: formatMsg(intl, 'partners')
      }, {
        key: 'partner-2',
        path: '/corp/partners/invitations/in',
        text: formatMsg(intl, 'recvInvitations')
      }, {
        key: 'partner-3',
        path: '/corp/partners/invitations/out',
        text: formatMsg(intl, 'sentInvitations')
      }]
    }, {
      single: false,
      key: 'corpsetting-5',
      icon: 'zmdi zmdi-star-circle',
      text: formatMsg(intl, 'serviceCenter'),
      sublinks: [{
        key: 'service-1',
        path: '/corp/service/buy',
        text: formatMsg(intl, 'servicePurchase')
      }, {
        key: 'service-2',
        path: '/corp/service/payment',
        text: formatMsg(intl, 'servicePayment')
      }]
    }];
    return (
      <div className="am-wrapper am-fixed-sidebar">
        <AmNavBar />
        <div className="am-content">
          <AmLeftSidebar links={ linkMenus } location={ this.props.location } />
          {this.props.children}
        </div>
      </div>);
  }
}
