import React, { PropTypes } from 'react';
import { Layout } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import TransparentHeaderBar from 'client/components/transparentHeaderBar';
import './sso.less';
const { Header, Content, Footer } = Layout;

@injectIntl
export default class SSOPack extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    children: PropTypes.object.isRequired,
  };

  render() {
    return (
      <Layout className="splash-screen">
        <Header>
          <TransparentHeaderBar title="" />
        </Header>
        <Content className="main-content">
          <div className="center-card-wrapper">
            {this.props.children}
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          <div className="browser-tip">
            <p>WeLogix支持IE10及以上版本的浏览器。为了您更顺畅的使用体验，请选择使用：</p>
            <ul>
              <li><a rel="noopener noreferrer" href="http://rj.baidu.com/soft/detail/14744.html" target="_blank">谷歌(Google Chrome)浏览器</a></li>
              <li><a rel="noopener noreferrer" href="http://www.firefox.com.cn/download/" target="_blank">火狐(Firefox)浏览器</a></li>
            </ul>
          </div>
          <div><a rel="noopener noreferrer" href="http://www.miitbeian.gov.cn/" target="_blank">沪ICP备16046609号-1</a></div>
        </Footer>
      </Layout>);
  }
}
