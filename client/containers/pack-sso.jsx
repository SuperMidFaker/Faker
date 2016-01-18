import React, { PropTypes } from 'react';
import connectFetch from '../../reusable/decorators/connect-fetch';
import {loadCorpByDomain} from '../../universal/redux/reducers/corp-domain';
import { isLoaded } from '../../../../reusable/common/redux-actions';
import './sso.less';

function FetchData({state, dispatch, cookie, params}) {
  if (!isLoaded(state, 'corpDomain')) {
    return dispatch(loadCorpByDomain(cookie, {
      subdomain: params.subdomain
    }));
  }
}
@connectFetch()(FetchData)
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
