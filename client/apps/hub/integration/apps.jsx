import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Breadcrumb, Card, Col, Icon, Layout, Row } from 'antd';
import QueueAnim from 'rc-queue-anim';
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
          <QueueAnim type="right">
            <Alert
              description={this.msg('integrationDesc')}
              type="info"
              showIcon
              closable
              key="alert"
            />
            <Row gutter={16} key="decl">
              <Col sm={24} md={12} lg={8}>
                <Card title="QP海关预录入系统" extra={<NavLink to="/hub/integration/quickpass/install">Install</NavLink>}>
                  QuickPass 海关预录入系统
                </Card>
              </Col>
              <Col sm={24} md={12} lg={8}>
                <Card title="亿通EDI海关申报系统" extra={<NavLink to="/hub/integration/easipass/install">Install</NavLink>}>
                  海关EDI申报系统是亿通公司就针对海关通关管理系统，自主设计开发的一套适用于电子报关企业的客户端应用软件。
                  整套系统集成了数据录入、单证发送、回执接收、报关单查询、数据备份等功能；系统涵盖了有纸报关、无纸报关、普货报关、转关、进出境备案、快件申报的所有报关功能。
                </Card>
              </Col>
              <Col sm={24} md={12} lg={8}>
                <Card title="上海自贸区监管系统" extra={<NavLink to="/hub/integration/shftz/install">Install</NavLink>} />
              </Col>
            </Row>
            <Row gutter={16} key="ctm">
              <Col sm={24} md={12} lg={8}>
                <Card title="Amber Road CTM" extra={<NavLink to="/hub/integration/arctm/install">Install</NavLink>}>
                  Amber Road 中国贸易管理（CTM）系统已经：
                  服务于数百家全球 2000 强企业，包括众多在全国各地拥有数十家分支机构的大型跨国公司；
                  被众多行业客户认可，包括汽车零部件、化工、机电、医疗器械和医药等；
                  对接全国各主要口岸，企业可在一个平台上管理所有进出口活动。
                </Card>
              </Col>
            </Row>
            <Row gutter={16} key="apps">
              <Col sm={24} md={12} lg={8}>
                <Card title="顺丰快递下单" extra={<NavLink to="/hub/integration/shunfeng/install">Install</NavLink>}>
                  通过与顺丰快递公司合作，获取快递单号以打印快递单。
                </Card>
              </Col>
            </Row>
          </QueueAnim>
        </Content>
      </div>
    );
  }
}
