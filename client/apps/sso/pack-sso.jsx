import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Icon, Layout } from 'antd';
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
        return (
          <Alert
            description={<span>为了您更顺畅的使用体验，推荐使用：<ul>
              <li><a rel="noopener noreferrer" href="http://rj.baidu.com/soft/detail/14744.html" target="_blank"><Icon type="chrome" /> 谷歌(Google Chrome)浏览器</a></li>
            </ul>
            </span>}
            type="info"
            showIcon
          />
        );
      default:
        return (<Alert
          message="支持现代浏览器和IE10及以上"
          description={<span>推荐使用：<ul>
            <li><a rel="noopener noreferrer" href="http://rj.baidu.com/soft/detail/14744.html" target="_blank"><Icon type="chrome" /> 谷歌(Google Chrome)浏览器</a></li>
          </ul>
          </span>}
          type="info"
          showIcon
        />
        );
    }
  }

  render() {
    return (
      <Layout className="splash-screen">
        <Header>
          <TransparentHeaderBar title="" />
        </Header>
        <Content className="main-content layout-fixed-width layout-fixed-width-small">
          <div className="center-card-wrapper">
            {this.props.children}
          </div>
          {this.renderBrowserTip()}
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          <div>
            <a rel="noopener noreferrer" href="https://welogix.cn" target="_blank">上海微骆信息科技有限公司</a>
          </div>
        </Footer>
      </Layout>);
  }
}
