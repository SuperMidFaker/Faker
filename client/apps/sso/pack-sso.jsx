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
        <div className="am-wrapper am-login">
          <div className="am-content">
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
              <div className="browser-tip">
                <p>WeLogix支持IE10及以上版本的浏览器。为了您更顺畅的使用体验，请选择使用：</p>
                <ul>
                  <li><a rel="noopener noreferrer" href="http://rj.baidu.com/soft/detail/14744.html" target="_blank">谷歌(Google Chrome)浏览器</a></li>
                  <li><a rel="noopener noreferrer" href="http://www.firefox.com.cn/download/" target="_blank">火狐(Firefox)浏览器</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>);
  }
}
