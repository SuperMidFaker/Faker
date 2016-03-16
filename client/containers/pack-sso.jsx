import React, { PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'universal/i18n/helpers';
import messages from './message.i18n';
import './sso.less';
const formatMsg = format(messages);

@injectIntl
export default class SSOPack extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    children: PropTypes.object.isRequired
  };

  render() {
    return (
      <div className="am-splash-screen">
        <img src={ `${__CDN__}/assets/img/welogix_logo_160_100_white.png` } />
        <div className="am-wrapper am-login">
          <div className="am-content">
            <div className="main-content">
              <div className="login-container">
                <div className="panel panel-default">
                  <div className="panel-heading">
                    <img src="http://cdn.welogix.cn/assets/img/welogix-badge.png" alt="logo" width="120px" className="logo-img" />
                    <span>{formatMsg(this.props.intl, 'slogan')}</span>
                  </div>
                  {this.props.children}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>);
  }
}
