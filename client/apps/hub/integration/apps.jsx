import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Breadcrumb, Card, Icon, Layout, List } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import NavLink from 'client/components/NavLink';
import { formatMsg } from './message.i18n';

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

  render() {
    const data = [
      {
        title: 'QP海关预录入系统',
        link: '/hub/integration/quickpass/install',
        description: 'QuickPass 海关预录入系统',
      },
      {
        title: '亿通EDI海关申报系统',
        link: '/hub/integration/easipass/install',
        description: '海关EDI申报系统是亿通公司就针对海关通关管理系统，自主设计开发的一套适用于电子报关企业的客户端应用软件。',
      },
      {
        title: '上海自贸区监管系统',
        link: '/hub/integration/shftz/install',
        description: '上海自贸区监管系统',
      },
      {
        title: 'Amber Road CTM',
        link: '/hub/integration/arctm/install',
        description: 'Amber Road 中国贸易管理（CTM）系统',
      },
      {
        title: '顺丰速运',
        link: '/hub/integration/shunfeng/install',
        description: '通过与顺丰快递公司合作，获取快递单号以打印快递单',
      },
    ];
    return (
      <div>
        <Header className="page-header">
          <Breadcrumb>
            <Breadcrumb.Item>
              <Icon type="shop" /> 应用商店
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
            grid={{ gutter: 16, column: 4 }}
            dataSource={data}
            renderItem={item => (
              <List.Item>
                <Card title={item.title} extra={<NavLink to={item.link}>Install</NavLink>} bodyStyle={{ height: 120 }}>
                  {item.description}
                </Card>
              </List.Item>
              )}
          />
        </Content>
      </div>
    );
  }
}
