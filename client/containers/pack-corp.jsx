import React, { PropTypes } from 'react';
import AmNavBar from '../components/am-navbar';
import AmLeftSidebar from '../components/am-ant-leftbar';
import { setNavTitle } from '../../universal/redux/reducers/navbar';
import connectNav from '../../reusable/decorators/connect-nav';

@connectNav((props, dispatch) => {
  dispatch(setNavTitle({
    depth: 2,
    text: '企业设置',
    moduleName: 'corp',
    withModuleLayout: false,
    goBackFn: ''
  }));
})
export default class Account extends React.Component {
  static propTypes = {
    children: PropTypes.object.isRequired
  };

  render() {
    // todo no organization when tenant is standard
    // and no setting button
    const linkMenus = [{
      single: true,
      key: 'corpsetting-1',
      path: '/corp/info',
      icon: 's7-info',
      text: '企业信息'
    }, {
      single: true,
      key: 'corpsetting-2',
      path: '/corp/personnel',
      icon: 's7-users',
      text: '用户管理'
    }, {
      single: true,
      key: 'corpsetting-3',
      path: '/corp/organization',
      icon: 's7-network',
      text: '组织机构'
    }, {
      single: true,
      key: 'corpsetting-4',
      path: '/corp/partners',
      icon: 's7-share',
      text: '合作伙伴'
    }, {
      single: false,
      key: 'corpsetting-5',
      icon: 's7-tools',
      text: '服务中心',
      sublinks: [{
        key: 'service-1',
        path: '/corp/service/buy',
        text: '购买服务'
      }, {
        key: 'service-2',
        path: '/corp/service/payment',
        text: '付款记录'
      }]
    }];
    return (
      <div className="am-wrapper am-fixed-sidebar">
        <AmNavBar barTitle="企业设置" />
        <div className="am-content">
          <AmLeftSidebar links={ linkMenus } />
          {this.props.children}
        </div>
      </div>);
  }
}
