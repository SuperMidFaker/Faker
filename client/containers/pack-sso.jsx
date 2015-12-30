import React, { PropTypes } from 'react';
import './sso.less';

export default class Home extends React.Component {
  static propTypes = {
    children: PropTypes.object.isRequired
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
                    <img src="/assets/img/logo-full-retina.png" alt="logo" width="150px" height="39px" className="logo-img" />
                    <span>物流链运输协同平台</span>
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
