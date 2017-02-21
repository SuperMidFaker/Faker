import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Alert, Breadcrumb, Card, Col, Icon, Layout, Row } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import NavLink from 'client/components/nav-link';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const { Header, Content } = Layout;

@injectIntl
@connect(
  state => ({
    profile: state.account.profile,
    role: state.account.role_name,
    tenantId: state.account.tenantId,
    parentTenantId: state.account.parentTenantId,
    code: state.account.code,
  }),
)

export default class IntegrationAppsList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,

  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    avatar: '',
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values);
  handleCancel = () => {
    this.context.router.goBack();
  }
  columns = [{
    title: this.msg('integrationName'),
    dataIndex: 'integration_name',
  }, {
    title: this.msg('relatedPartner'),
    width: 400,
    dataIndex: 'related_partner',
  }, {
    title: this.msg('incomingStatus'),
    dataIndex: 'incoming_status',
    width: 200,
  }, {
    title: this.msg('outgoingStatus'),
    dataIndex: 'outgoing_status',
    width: 200,
  }, {
    title: this.msg('opColumn'),
    width: 100,
    render: () => (
      <span>
        <a href="#">修改</a>
        <span className="ant-divider" />
        <a href="#">停用</a>
      </span>
  ),
  }];

  mockDataSource = [{
    integration_name: 'Amber Road CTM',
    related_partner: '西门子贸易',
    incoming_status: '正常',
    outgoing_status: '异常',
  },
  ];

  render() {
    return (
      <div>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              <Icon type="appstore-o" /> 应用整合
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              应用中心
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="top-bar-tools" />
        </Header>
        <Content className="main-content">
          <Alert
            description={this.msg('integrationDesc')}
            type="info"
            showIcon
            closable
          />
          <Row gutter={16}>
            <Col sm={24} md={12} lg={8}>
              <Card title="Amber Road CTM" extra={<NavLink to="/open/integration/arctm/install">Install</NavLink>} >
                Amber Road 中国贸易管理（CTM）系统已经：
                服务于数百家全球 2000 强企业，包括众多在全国各地拥有数十家分支机构的大型跨国公司；
                被众多行业客户认可，包括汽车零部件、化工、机电、医疗器械和医药等；
                对接全国各主要口岸，企业可通过 Amber Road CTM 系统在一个平台上管理所有进出口活动。
              </Card>
            </Col>
            <Col sm={24} md={12} lg={8}>
              <Card title="easipass EDI" extra={<NavLink to="/open/integration/easipass/install">Install</NavLink>} >
                海关EDI申报系统是亿通公司就针对海关通关管理系统，自主设计开发的一套适用于电子报关企业的客户端应用软件。
                整套系统集成了数据录入、单证发送、回执接收、报关单查询、数据备份等功能；系统涵盖了有纸报关、无纸报关、普货报关、转关、进出境备案、快件申报的所有报关功能。
              </Card>
            </Col>
            <Col sm={24} md={12} lg={8}>
              <Card title="Kuuwee CTM" extra={<a href="#">Install</a>} />
            </Col>
          </Row>
        </Content>
      </div>
    );
  }
}
