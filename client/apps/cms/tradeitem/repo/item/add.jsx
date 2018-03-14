import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, Layout, Button, Tabs, message, notification } from 'antd';

import MagicCard from 'client/components/MagicCard';
import PageHeader from 'client/components/PageHeader';
import connectNav from 'client/common/decorators/connect-nav';
import { createTradeItem, notifyFormChanged } from 'common/reducers/cmsTradeitem';
import ItemMasterPane from './tabpane/itemMasterPane';
import { formatMsg } from '../../message.i18n';


const { Content } = Layout;
const { TabPane } = Tabs;

@injectIntl
@connect(
  state => ({
    repo: state.cmsTradeitem.repo,
    submitting: state.cmsTradeitem.submitting,
    formChanged: state.cmsTradeitem.formChanged,
  }),
  { createTradeItem, notifyFormChanged }
)
@connectNav({
  depth: 3,
  moduleName: 'clearance',
})
@Form.create({ onValuesChange: props => props.notifyFormChanged(true) })
export default class TradeItemAdd extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.shape({ getFieldDecorator: PropTypes.func.isRequired }).isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = formatMsg(this.props.intl)
  handleSave = () => {
    this.props.form.validateFields((errors) => {
      if (!errors) {
        const { params: { repoId } } = this.props;
        const item = this.props.form.getFieldsValue();
        item.special_mark = item.specialMark.join('/');
        this.props.createTradeItem({ item, repoId }).then((result) => {
          if (result.error) {
            message.error(result.error.message, 10);
          } else {
            notification.success({
              message: '保存成功',
              description: '已提交至归类工作区待审核.',
            });
            this.props.notifyFormChanged(false);
            this.context.router.goBack();
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
      form, repo, submitting, formChanged,
    } = this.props;
    const tabs = [];
    tabs.push(<TabPane tab={this.msg('tabClassification')} key="master">
      <ItemMasterPane action="create" form={form} itemData={{}} />
    </TabPane>);
    return (
      <Layout>
        <PageHeader
          breadcrumb={[
            repo.owner_name,
            this.msg('tradeItemMaster'),
            this.msg('addItem'),
          ]}
        >
          <PageHeader.Actions>
            <Button onClick={this.handleCancel}>
              {this.msg('cancel')}
            </Button>
            <Button type="primary" icon="save" onClick={this.handleSave} loading={submitting} disabled={!formChanged}>
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
