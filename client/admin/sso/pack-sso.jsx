import React, { PropTypes } from 'react';
import { Layout } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import './sso.less';
const { Content, Footer } = Layout;

@injectIntl
export default class SSOPack extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    children: PropTypes.object.isRequired,
  };

  render() {
    return (
      <Layout className="splash-screen">
        <Content className="main-content">
          <div className="center-card-wrapper">
            {this.props.children}
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          <div><a rel="noopener noreferrer" href="http://www.miitbeian.gov.cn/" target="_blank">沪ICP备16046609号-1</a></div>
        </Footer>
      </Layout>);
  }
}
