import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Avatar, Breadcrumb, Button, Card, Icon, Layout, List } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { formatMsg } from './message.i18n';
import './index.less';

const { Header, Content } = Layout;

@injectIntl
export default class IntegrationAppsList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = formatMsg(this.props.intl);
  handleInstall = (link) => {
    this.context.router.push(link);
  }
  renderAppLogo(app) {
    if (app.app_type === 'EASIPASS') {
      return <Avatar shape="square" style={{ backgroundColor: '#008dff' }}>EP</Avatar>;
    } else if (app.app_type === 'ARCTM') {
      return <Avatar shape="square" style={{ color: '#f56a00', backgroundColor: '#fde3cf' }}>AmberRoad</Avatar>;
    } else if (app.app_type === 'SHFTZ') {
      return <Avatar shape="square" style={{ backgroundColor: '#00a2ae' }}>FTZ</Avatar>;
    } else if (app.app_type === 'SFEXPRESS') {
      return <Avatar shape="square" style={{ backgroundColor: '#292929' }}>SF</Avatar>;
    } else if (app.app_type === 'SW') {
      return <Avatar shape="square" style={{ backgroundColor: '#f56a00' }}>SW</Avatar>;
    } else if (app.app_type === 'QP') {
      return <Avatar shape="square" style={{ backgroundColor: '#7265e6' }}>QP</Avatar>;
    }
    return <Avatar shape="square">{this.msg('unknownApp')}</Avatar>;
  }
  render() {
    const data = [
      {
        app_type: 'SW',
        title: '『单一窗口』货物申报',
        link: '/hub/integration/singlewindow/install',
        description: '国际贸易单一窗口',
      },
      {
        app_type: 'QP',
        title: 'QP海关预录入系统',
        link: '/hub/integration/quickpass/install',
        description: 'QuickPass 海关预录入系统',
      },
      {
        app_type: 'EASIPASS',
        title: '亿通EDI海关申报系统',
        link: '/hub/integration/easipass/install',
        description: '海关EDI申报系统是亿通公司就针对海关通关管理系统',
      },
      {
        app_type: 'SHFTZ',
        title: '上海自贸区监管系统',
        link: '/hub/integration/shftz/install',
        description: '上海自贸区监管系统',
      },
      {
        app_type: 'ARCTM',
        title: 'Amber Road CTM',
        link: '/hub/integration/arctm/install',
        description: 'Amber Road 中国贸易管理（CTM）系统',
      },
      {
        app_type: 'SFEXPRESS',
        title: '顺丰速运',
        link: '/hub/integration/sfexpress/install',
        description: '通过与顺丰快递公司合作，获取快递单号以打印快递单',
      },
    ];
    return (
      <div>
        <Header className="page-header">
          <Breadcrumb>
            <Breadcrumb.Item>
              <Icon type="shop" /> 应用市场
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="page-header-tools" />
        </Header>
        <Content className="main-content">
          <Alert
            description={this.msg('integrationDesc')}
            type="info"
            showIcon
            closable
            key="alert"
          />
          <List
            grid={{ gutter: 16, column: 6 }}
            dataSource={data}
            renderItem={item => (
              <List.Item>
                <Card title={item.title} className="app-card">
                  <div className="app-logo">
                    {this.renderAppLogo(item)}
                  </div>
                  <div className="app-desc">{item.description}</div>
                  <Button type="primary" ghost icon="tool" onClick={() => this.handleInstall(item.link)}>安装</Button>
                </Card>
              </List.Item>
              )}
          />
        </Content>
      </div>
    );
  }
}
