import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Form, Layout, Button, Tabs, message } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import MagicCard from 'client/components/MagicCard';
import PageHeader from 'client/components/PageHeader';
import { loadTradeItem, saveRepoItem, toggleConfirmChangesModal, changeItemMaster, notifyFormChanged } from 'common/reducers/cmsTradeitem';
import { intlShape, injectIntl } from 'react-intl';

import ItemMasterPane from './tabpane/itemMasterPane';
import ItemPermitPane from './tabpane/itemPermitPane';
import ItemHistoryPane from './tabpane/itemHistoryPane';
import ConfirmChangesModal from './modal/confirmChangesModal';
import { formatMsg } from '../../message.i18n';


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
    formChanged: state.cmsTradeitem.formChanged,
    repo: state.cmsTradeitem.repo,
  }),
  {
    saveRepoItem,
    toggleConfirmChangesModal,
    changeItemMaster,
    notifyFormChanged,
  }
)
@connectNav({
  depth: 3,
  moduleName: 'clearance',
})
@Form.create({ onValuesChange: props => props.notifyFormChanged(true) })
export default class TradeItemEdit extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.shape({ validateFields: PropTypes.func }).isRequired,
    itemData: PropTypes.shape({ id: PropTypes.number }),
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = formatMsg(this.props.intl)
  handleConfirm = () => {
    const { itemData, form } = this.props;
    const values = form.getFieldsValue();
    const changes = [];
    if (itemData.hscode !== values.hscode) {
      changes.push({
        field: this.msg('hscode'),
        before: itemData.hscode,
        after: values.hscode,
      });
    }
    if (itemData.g_name !== values.g_name) {
      changes.push({
        field: this.msg('gName'),
        before: itemData.g_name,
        after: values.g_name,
      });
    }
    if (itemData.g_model !== values.g_model) {
      changes.push({
        field: this.msg('gModel'),
        before: itemData.g_model,
        after: values.g_model,
      });
    }
    if (changes.length === 0) {
      this.handleSave();
    } else {
      this.props.changeItemMaster(changes);
      this.props.toggleConfirmChangesModal(true);
    }
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
            this.props.notifyFormChanged(false);
          }
        });
      }
    });
  }
  handleCancel = () => {
    this.props.notifyFormChanged(false);
    this.context.router.goBack();
  }

  render() {
    const {
      form, submitting, itemData, params, repo, formChanged,
    } = this.props;
    const tabs = [];
    tabs.push(<TabPane tab={this.msg('tabClassification')} key="master">
      <ItemMasterPane action="edit" form={form} itemData={itemData} />
    </TabPane>);
    tabs.push(<TabPane tab={this.msg('tabPermit')} key="permit">
      <ItemPermitPane itemId={params.id} />
    </TabPane>);
    tabs.push(<TabPane tab={this.msg('tabHistory')} key="history">
      <ItemHistoryPane

        repoId={params.repoId}
        copProdNo={itemData.cop_product_no}
      />
    </TabPane>);
    return (
      <Layout>
        <PageHeader
          breadcrumb={[
            repo.owner_name,
            this.msg('tradeItemMaster'),
            this.msg('editItem'),
          ]}
        >
          <PageHeader.Actions>
            <Button onClick={this.handleCancel}>
              {this.msg('cancel')}
            </Button>
            <Button type="primary" icon="save" onClick={this.handleConfirm} loading={submitting} disabled={!formChanged}>
              {this.msg('save')}
            </Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content">
          <MagicCard
            bodyStyle={{ padding: 0 }}

          >
            <Tabs defaultActiveKey="master">
              {tabs}
            </Tabs>
          </MagicCard>
        </Content>
        <ConfirmChangesModal form={form} onSave={this.handleSave} />
      </Layout>
    );
  }
}
