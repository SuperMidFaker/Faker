import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Breadcrumb, Card, Collapse, List, Layout, Modal } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { toggleOrderConfigModal } from 'common/reducers/scofSettings';
import connectNav from 'client/common/decorators/connect-nav';
import PageHeader from 'client/components/PageHeader';
import RowAction from 'client/components/RowAction';
import SettingMenu from './menu';
import TypeForm from './forms/typeForm';
import FieldsForm from './forms/fieldsForm';
import { formatMsg } from './message.i18n';

const { Panel } = Collapse;
const { Content, Sider } = Layout;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    invTemplates: state.cmsInvoice.invTemplates,
    visible: state.scofSettings.orderConfigModal.visible,
  }),
  { toggleOrderConfigModal }
)
@connectNav({
  depth: 2,
  moduleName: 'scof',
})
export default class Preferences extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = formatMsg(this.props.intl);
  orderTypeList = [
    {
      id: '100001',
      type: '进口订单',
      transfer: 'IMP',
    },
    {
      id: '100002',
      type: '出口订单',
      transfer: 'EXP',
    },
    {
      id: '100003',
      type: '国内订单',
      transfer: 'DOM',
    },
  ];
  handleCreate = () => {
    this.props.toggleOrderConfigModal(true);
  }
  handleConfig = () => {
    this.props.toggleOrderConfigModal(true);
  }
  render() {
    const { visible } = this.props;
    return (
      <Layout>
        <Sider width={200} className="menu-sider" key="sider">
          <div className="page-header">
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('settings')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div className="left-sider-panel">
            <SettingMenu currentKey="preferences" />
          </div>
        </Sider>
        <Layout>
          <PageHeader>
            <PageHeader.Title>
              <Breadcrumb>
                <Breadcrumb.Item>
                订单类型配置
                </Breadcrumb.Item>
              </Breadcrumb>
            </PageHeader.Title>
          </PageHeader>
          <Content className="page-content layout-fixed-width">
            <Card extra={<Button type="primary" ghost icon="plus-circle-o" onClick={this.handleCreate}>添加订单类型</Button>} bodyStyle={{ padding: 16 }} >
              <List
                dataSource={this.orderTypeList}
                renderItem={type => (
                  <List.Item
                    key={type.id}
                    actions={[<RowAction onClick={() => this.handleConfig(type.id)} icon="setting" label={this.msg('config')} />]}
                  >
                    <List.Item.Meta
                      title={type.type}
                      description={type.desc}
                    />
                  </List.Item>
                  )}
              />
            </Card>
          </Content>
        </Layout>
        <Modal
          maskClosable={false}
          title={this.msg('orderConfig')}
          width="100%"
          visible={visible}
          onCancel={() => this.props.toggleOrderConfigModal(false)}
          footer={null}
          wrapClassName="fullscreen-modal"
          destroyOnClose
        >
          <Content className="layout-fixed-width">
            <Card bodyStyle={{ padding: 0 }}>
              <Collapse accordion bordered={false} defaultActiveKey={['type']}>
                <Panel header="订单类型" key="type">
                  <TypeForm />
                </Panel>
                <Panel header="扩展字段" key="fields">
                  <FieldsForm />
                </Panel>
              </Collapse>
            </Card>
          </Content>
        </Modal>
      </Layout>
    );
  }
}
