import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Breadcrumb, Form, Layout, Button, Tabs, message } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import MagicCard from 'client/components/MagicCard';
import PageHeader from 'client/components/PageHeader';
import { loadTradeItem, saveRepoItem } from 'common/reducers/cmsTradeitem';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import ItemMasterPane from './tabpane/itemMasterPane';
import ItemPermitPane from './tabpane/itemPermitPane';
import ItemHistoryPane from './tabpane/itemHistoryPane';
import messages from '../../message.i18n';

const formatMsg = format(messages);
const { Content } = Layout;
const { TabPane } = Tabs;

function fetchData({ dispatch, params }) {
  const promises = [];
  const itemId = parseInt(params.id, 10);
  promises.push(dispatch(loadTradeItem(itemId)));
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    submitting: state.cmsTradeitem.submitting,
    itemData: state.cmsTradeitem.itemData,
    repo: state.cmsTradeitem.repo,
  }),
  { saveRepoItem }
)
@connectNav({
  depth: 3,
  moduleName: 'clearance',
})
@Form.create()
export default class TradeItemEdit extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.shape({ validateFields: PropTypes.func }).isRequired,
    itemData: PropTypes.shape({ id: PropTypes.number.isRequired }),
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    fullscreen: true,
  }
  msg = key => formatMsg(this.props.intl, key);
  toggleFullscreen = (fullscreen) => {
    this.setState({ fullscreen });
  }
  handleSave = () => {
    this.props.form.validateFields((errors) => {
      if (!errors) {
        const value = this.props.form.getFieldsValue();
        const specialMark = value.specialMark.join('/');
        const item = { ...this.props.itemData, ...value, special_mark: specialMark };
        this.props.saveRepoItem({ item }).then((result) => {
          if (result.error) {
            message.error(result.error.message, 10);
          } else {
            message.success('保存成功');
            this.context.router.goBack();
            // this.context.router.push('/clearance/classification/tradeitem');
          }
        });
      }
    });
  }
  handleCancel = () => {
    this.context.router.goBack();
  }

  render() {
    const {
      form, submitting, itemData, params, repo,
    } = this.props;
    const tabs = [];
    tabs.push(<TabPane tab="归类信息" key="master">
      <ItemMasterPane action="edit" form={form} itemData={itemData} />
    </TabPane>);
    tabs.push(<TabPane tab="涉证资料" key="permit">
      <ItemPermitPane fullscreen={this.state.fullscreen} repoId={params.repoId} />
    </TabPane>);
    tabs.push(<TabPane tab="历史版本" key="history">
      <ItemHistoryPane
        fullscreen={this.state.fullscreen}
        repoId={params.repoId}
        copProdNo={itemData.cop_product_no}
      />
    </TabPane>);
    return (
      <Layout>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                {repo.owner_name}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.msg('tradeItemMaster')}
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
              {tabs}
            </Tabs>
          </MagicCard>
        </Content>
      </Layout>
    );
  }
}
