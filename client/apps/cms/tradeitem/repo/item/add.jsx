import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Breadcrumb, Form, Layout, Button, Tabs, message } from 'antd';
import MagicCard from 'client/components/MagicCard';
import PageHeader from 'client/components/PageHeader';
import connectNav from 'client/common/decorators/connect-nav';
import ItemMasterPane from './tabpane/itemMasterPane';
import { createTradeItem } from 'common/reducers/cmsTradeitem';
import { intlShape, injectIntl } from 'react-intl';
import messages from '../../message.i18n';
import { format } from 'client/common/i18n/helpers';

const formatMsg = format(messages);
const { Content } = Layout;
const TabPane = Tabs.TabPane;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    repoId: state.cmsTradeitem.repoId,
  }),
  { createTradeItem }
)
@connectNav({
  depth: 3,
  moduleName: 'clearance',
})
@Form.create()
export default class TradeItemAdd extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    repoId: PropTypes.number.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);
  handleSave = () => {
    this.props.form.validateFields((errors) => {
      if (!errors) {
        const {
          repoId, tenantId, loginId, loginName,
        } = this.props;
        const item = this.props.form.getFieldsValue();
        item.special_mark = item.specialMark.join('/');
        this.props.createTradeItem({
          item, repoId, tenantId, loginId, loginName,
        }).then((result) => {
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
    const { form } = this.props;
    const tabs = [];
    tabs.push(<TabPane tab="主数据" key="master">
      <ItemMasterPane action="create" form={form} />
    </TabPane>);
    return (
      <Layout>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('tradeItemMaster')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.msg('newItem')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Actions>
            <Button onClick={this.handleCancel}>
              {this.msg('cancel')}
            </Button>
            <Button type="primary" icon="save" onClick={this.handleSave}>
              {this.msg('save')}
            </Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content">
          <MagicCard bodyStyle={{ padding: 0 }} hoverable={false} onSizeChange={this.toggleFullscreen}>
            <Tabs defaultActiveKey="master">
              {tabs}
            </Tabs>
          </MagicCard>
        </Content>
      </Layout>
    );
  }
}