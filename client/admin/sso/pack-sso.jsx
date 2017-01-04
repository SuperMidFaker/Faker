import React, { PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import './sso.less';
const formatMsg = format(messages);

@injectIntl
export default class SSOPack extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    children: PropTypes.object.isRequired,
  };

  render() {
    return (
      <div className="am-splash-screen">

        <div className="main-content">
          <div className="login-container">
            <div className="panel panel-default">
              <div className="panel-heading">
                <img src={`${__CDN__}/assets/img/welogix_logo_360.png`} width="160" alt="logo" />
                <span>{formatMsg(this.props.intl, 'slogan')}</span>
              </div>
              {this.props.children}
            </div>
          </div>
        </div>

      </div>);
  }
}
