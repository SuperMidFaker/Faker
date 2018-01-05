import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Breadcrumb, Form, Layout, Button, Tabs, message } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import MagicCard from 'client/components/MagicCard';
import PageHeader from 'client/components/PageHeader';
import { loadTradeItem, saveRepoForkItem, toggleConfirmForkModal, changeItemMaster, toggleItemMasterEnabled } from 'common/reducers/cmsTradeitem';
import { intlShape, injectIntl } from 'react-intl';
import ItemMasterPane from './tabpane/itemMasterPane';
import ConfirmForkModal from './modal/confirmForkModal';
import messages from '../../message.i18n';

const formatMsg = format(messages);
const { Content } = Layout;
const { TabPane } = Tabs;

function fetchData({ dispatch, params }) {
  const promises = [];
  const itemId = parseInt(params.id, 10);
  promises.push(dispatch(loadTradeItem(itemId, 'newSrc')));
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    submitting: state.cmsTradeitem.submitting,
    itemData: state.cmsTradeitem.itemData,
    tenantId: state.account.tenantId,
    itemMasterEnabled: state.cmsTradeitem.itemMasterEnabled,
    repo: state.cmsTradeitem.repo,
  }),
  {
    saveRepoForkItem,
    toggleConfirmForkModal,
    changeItemMaster,
    toggleItemMasterEnabled,
  }
)
@connectNav({
  depth: 3,
  moduleName: 'clearance',
})
@Form.create({ onValuesChange: props => props.toggleItemMasterEnabled(true) })
export default class TradeItemFork extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    form: PropTypes.shape({ validateFields: PropTypes.func.isRequired }).isRequired,
    itemData: PropTypes.shape({ cop_product_no: PropTypes.string }),
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);
  handleConfirm = () => {
    const { itemData, form } = this.props;
    const values = form.getFieldsValue();
    const changes = [];
    if (itemData.hscode !== values.hscode) {
      changes.push({
        field: 'hscode',
        before: itemData.hscode,
        after: values.hscode,
      });
    }
    if (itemData.g_name !== values.g_name) {
      changes.push({
        field: 'g_name',
        before: itemData.g_name,
        after: values.g_name,
      });
    }
    if (changes.length === 0) {
      message.info('HS编码及中文品名未改变，无法建立分支');
    } else {
      this.props.changeItemMaster(changes);
      this.props.toggleConfirmForkModal(true);
    }
  }
  handleSave = () => {
    this.props.form.validateFields((errors) => {
      if (!errors) {
        const value = this.props.form.getFieldsValue();
        if (value.hscode === this.props.itemData.hscode &&
          value.g_name === this.props.itemData.g_name) {
          message.error('请修改商品编码或中文品名', 5);
        }
        const specialMark = value.specialMark.join('/');
        const item = {
          ...this.props.itemData,
          ...value,
          special_mark: specialMark,
          created_tenant_id: this.props.tenantId,
        };
        this.props.saveRepoForkItem({ item }).then((result) => {
          if (result.error) {
            message.error(result.error.message, 10);
          } else {
            message.success('保存成功');
            this.props.toggleItemMasterEnabled(false);
            this.context.router.goBack();
          }
        });
      }
    });
  }
  handleCancel = () => {
    this.props.toggleItemMasterEnabled(false);
    this.context.router.goBack();
  }

  render() {
    const {
      form, submitting, itemData, repo, itemMasterEnabled,
    } = this.props;
    const tabs = [];
    tabs.push(<TabPane tab={this.msg('tabClassification')} key="master">
      <ItemMasterPane action="fork" form={form} itemData={itemData} />
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
                {this.msg('forkItem')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Actions>
            <Button onClick={this.handleCancel}>
              {this.msg('cancel')}
            </Button>
            <Button type="primary" icon="save" onClick={this.handleConfirm} loading={submitting} disabled={!itemMasterEnabled}>
              {this.msg('save')}
            </Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content">
          <MagicCard bodyStyle={{ padding: 0 }} onSizeChange={this.toggleFullscreen}>
            <Tabs defaultActiveKey="master">
              {tabs}
            </Tabs>
          </MagicCard>
        </Content>
        <ConfirmForkModal form={form} itemData={itemData} onSave={this.handleSave} />
      </Layout>
    );
  }
}
