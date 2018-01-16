import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Avatar, Badge, Breadcrumb, Button, Card, Icon, Layout, List } from 'antd';
import PageHeader from 'client/components/PageHeader';
import { intlShape, injectIntl } from 'react-intl';
import { toggleAppCreateModal, loadDevApps } from 'common/reducers/devApp';
import AppCreateModal from './modal/appCreateModal';
import { formatMsg } from './message.i18n';

const { Content } = Layout;
const IconText = ({ type, text }) => (
  <a>
    <Icon type={type} style={{ marginRight: 8 }} />
    {text}
  </a>
);

@injectIntl
@connect(
  state => ({
    apps: state.devApp.apps,
  }),
  { toggleAppCreateModal, loadDevApps }
)
export default class DevAppList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  componentDidMount() {
    this.props.loadDevApps();
  }
  msg = formatMsg(this.props.intl);
  columns = [{
    title: this.msg('appName'),
    dataIndex: 'app_name',
  }, {
    title: this.msg('scope'),
    dataIndex: 'scope',
  }, {
    title: this.msg('apiKey'),
    width: 400,
    dataIndex: 'api_key',
  }, {
    title: this.msg('apiSecret'),
    dataIndex: 'api_secret',
    width: 400,
  }, {
    title: this.msg('opColumn'),
    width: 100,
    render: () => (
      <span>
        <a href="#">修改</a>
        <span className="ant-divider" />
        <a href="#"><Icon type="delete" /></a>
      </span>
    ),
  }];

  handleCancel = () => {
    this.context.router.goBack();
  }
  handleConfig = (appId) => {
    this.context.router.push(`/hub/dev/${appId}`);
  }
  handleCreateApp = () => {
    this.props.toggleAppCreateModal(true);
  }
  render() {
    return (
      <Layout>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                <Icon type="code-o" /> {this.msg('dev')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Actions>
            <Button type="primary" icon="plus" onClick={this.handleCreateApp}>
              {this.msg('create')}
            </Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content layout-fixed-width">
          <Card bodyStyle={{ padding: 16 }} >
            <List
              dataSource={this.props.apps}
              renderItem={item => (
                <List.Item
                  key={item.app_id}
                  actions={[<IconText type="setting" text="配置" />]}
                  onClick={() => this.handleConfig(item.app_id)}
                >
                  <List.Item.Meta
                    avatar={<Avatar shape="square" src={item.app_logo} />}
                    title={item.app_name}
                    description={item.desc}
                  />
                  {item.status ? <Badge status="success" text="已上线" /> : <Badge status="default" text="未上线" />}
                </List.Item>
                )}
            />
          </Card>
        </Content>
        <AppCreateModal />
      </Layout>
    );
  }
}
