import React, { PropTypes } from 'react';
import './sso.less';

export default class SSOPack extends React.Component {
  static propTypes = {
    children: PropTypes.object.isRequired
  };

  render() {
    return (
      <div className="am-splash-screen">
        <img src="/assets/img/welogix_logo_160_100_white.png" />
        <div className="am-wrapper am-login">
          <div className="am-content">
            <div className="main-content">
              <div className="login-container">
                <div className="panel panel-default">
                  <div className="panel-heading">
                    <img src="http://cdn.welogix.cn/assets/img/welogix-badge.png" alt="logo" width="120px" className="logo-img" />
                    <span>进出口物流协同云平台</span>
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
