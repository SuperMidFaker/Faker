import React from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { Avatar, Badge, Breadcrumb, Button, Card, Icon, Layout, List } from 'antd';
import PageHeader from 'client/components/PageHeader';
import RowAction from 'client/components/RowAction';
import { formatMsg } from './message.i18n';

const { Content } = Layout;

@injectIntl
export default class DevAppList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
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

  mockDataSource = [{
    app_id: '5a309589b2a69f0001acaaaf',
    app_name: '自建应用',
    desc: '第一个自建应用',
    api_key: 'a530318f6f6890a68dc6efeadb623926',
    api_secret: '62740c97bf7868964b58e314cc8205c8',
  },
  {
    app_id: '5a309589b2a69f0001ac23af',
    app_name: '自建应用3',
    api_key: 'a530318f6f6890a68dc6efeadb623926',
    api_secret: '62740c97bf7868964b58e314cc8205c8',
  },
  ];
  handleCancel = () => {
    this.context.router.goBack();
  }
  handleConfig = (appId) => {
    this.context.router.push(`/hub/dev/${appId}`);
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
              dataSource={this.mockDataSource}
              renderItem={item => (
                <List.Item
                  key={item.app_id}
                  actions={[<RowAction onClick={() => this.handleConfig(item.app_id)} icon="setting" label={this.msg('config')} />]}
                >
                  <List.Item.Meta
                    avatar={<Avatar shape="square" src={item.app_logo} />}
                    title={item.app_name}
                    description={item.desc}
                  />
                  <Badge status="success" text="已上线" />
                </List.Item>
                )}
            />
          </Card>
        </Content>
      </Layout>
    );
  }
}
