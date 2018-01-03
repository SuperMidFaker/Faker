import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Breadcrumb, Form, Layout, Button, Tabs, message } from 'antd';
import { loadWorkspaceItem, saveWorkspaceItem } from 'common/reducers/cmsTradeitem';
import connectNav from 'client/common/decorators/connect-nav';
import MagicCard from 'client/components/MagicCard';
import PageHeader from 'client/components/PageHeader';
import ItemMasterPane from '../repo/item/tabpane/itemMasterPane';
import { formatMsg } from '../message.i18n';

const { Content } = Layout;
const { TabPane } = Tabs;

@injectIntl
@connect(
  state => ({
    itemData: state.cmsTradeitem.workspaceItem,
    submitting: state.cmsTradeitem.submitting,
  }),
  { saveWorkspaceItem, loadWorkspaceItem }
)
@connectNav({
  depth: 3,
  moduleName: 'clearance',
})
@Form.create()
export default class WorkItemPage extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    form: PropTypes.object.isRequired,
    itemData: PropTypes.object,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    fullscreen: true,
  }
  componentDidMount() {
    const itemId = parseInt(this.props.params.id, 10);
    this.props.loadWorkspaceItem(itemId);
  }
  msg = formatMsg(this.props.intl)
  toggleFullscreen = (fullscreen) => {
    this.setState({ fullscreen });
  }
  handleSave = () => {
    this.props.form.validateFields((errors) => {
      if (!errors) {
        const value = this.props.form.getFieldsValue();
        const specialMark = value.specialMark.join('/');
        const pass = value.pass === true ? 'Y' : null;
        const item = {
          ...this.props.itemData, ...value, special_mark: specialMark, pass,
        };
        this.props.saveWorkspaceItem(item).then((result) => {
          if (result.error) {
            message.error(result.error.message, 10);
          } else {
            message.success('保存成功');
            this.context.router.goBack();
          }
        });
      }
    });
  }
  handleCancel = () => {
    this.context.router.goBack();
  }

  render() {
    const { form, submitting, itemData } = this.props;
    return (
      <Layout>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('workspace')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {itemData.repo_owner_name}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.msg('editItem')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Actions>
            <Button onClick={this.handleCancel}>
              {this.msg('cancel')}
            </Button>
            <Button type="primary" icon="save" onClick={this.handleSave} loading={submitting}>
              {this.msg('save')}
            </Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content">
          <MagicCard
            bodyStyle={{ padding: 0 }}
            onSizeChange={this.toggleFullscreen}
          >
            <Tabs defaultActiveKey="master">
              <TabPane tab="主数据" key="master">
                <ItemMasterPane action="edit" form={form} itemData={itemData} />
              </TabPane>
            </Tabs>
          </MagicCard>
        </Content>
      </Layout>
    );
  }
}

