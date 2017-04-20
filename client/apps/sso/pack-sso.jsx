import React, { PropTypes } from 'react';
import { Layout } from 'antd';
import { detectBrowser } from 'detect-browser';
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

  renderBrowserTip() {
    const browser = detectBrowser;
    switch (browser && browser.name) {
      case 'chrome':
      case 'firefox':
        return (<span />);
      case 'edge':
        return (<div className="browser-tip">
          <p>为了您更顺畅的使用体验，推荐使用：</p>
          <ul>
            <li><a rel="noopener noreferrer" href="http://rj.baidu.com/soft/detail/14744.html" target="_blank">谷歌(Google Chrome)浏览器</a></li>
            <li><a rel="noopener noreferrer" href="http://www.firefox.com.cn/download/" target="_blank">火狐(Firefox)浏览器</a></li>
          </ul>
        </div>);
      default:
        return (<div className="browser-tip">
          <p>支持IE10及以上版本的浏览器。为了您更顺畅的使用体验，请选择使用：</p>
          <ul>
            <li><a rel="noopener noreferrer" href="http://rj.baidu.com/soft/detail/14744.html" target="_blank">谷歌(Google Chrome)浏览器</a></li>
            <li><a rel="noopener noreferrer" href="http://www.firefox.com.cn/download/" target="_blank">火狐(Firefox)浏览器</a></li>
          </ul>
        </div>);
    }
  }

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
          {this.renderBrowserTip()}
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          <div><a rel="noopener noreferrer" href="https://welogix.cn" target="_blank">上海微骆信息科技有限公司</a> <a rel="noopener noreferrer" href="http://www.miitbeian.gov.cn/" target="_blank">沪ICP备16046609号-1</a></div>
        </Footer>
      </Layout>);
  }
}
