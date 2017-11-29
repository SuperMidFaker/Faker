import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Form, Breadcrumb, Button, Icon, Layout, Tabs, Dropdown, Menu } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import PageHeader from 'client/components/PageHeader';
import MagicCard from 'client/components/MagicCard';
import CiqDeclHeadPane from './tabpane/ciqDeclHeadPane';
import CiqDeclGoodsPane from './tabpane/ciqDeclGoodsPane';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);
const { Content } = Layout;
const TabPane = Tabs.TabPane;

const navObj = {
  depth: 3,
  moduleName: 'clearance',
  jumpOut: true,
};

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    ciqDeclHead: state.cmsCiqDeclare.ciqDeclHead,
  }),
  { }
)
@connectNav(navObj)
@Form.create()
export default class CiqDeclEdit extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ioType: PropTypes.oneOf(['in', 'out']),
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    collapsed: true,
    fullscreen: true,
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  toggleFullscreen = (fullscreen) => {
    this.setState({ fullscreen });
  }
  handleManifestVisit = () => {
    const { ciqDeclHead } = this.props;
    const pathname = `/clearance/${this.context.router.params.ioType === 'in' ? 'import' : 'export'}/manifest/view/${ciqDeclHead.bill_seq_no}`;
    this.context.router.push({ pathname });
  }
  render() {
    const declEntryMenu = (
      <Menu onClick={this.handleManifestVisit}>
        <Menu.Item><Icon type="file" />申报清单</Menu.Item>
      </Menu>);
    const tabs = [];
    tabs.push(
      <TabPane tab="基本信息" key="header">
        <CiqDeclHeadPane ioType={this.props.params.ioType} />
      </TabPane>);
    tabs.push(
      <TabPane tab="商品信息" key="body">
        <CiqDeclGoodsPane ioType={this.props.params.ioType} fullscreen={this.state.fullscreen} />
      </TabPane>);
    return (
      <Layout>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('ciqDecl')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.props.router.params.declNo}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Actions>
            <Dropdown overlay={declEntryMenu}>
              <Button ><Icon type="link" />转至 <Icon type="down" /></Button>
            </Dropdown>
            <Button icon="file-excel">九城商检导出</Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content layout-min-width layout-min-width-large">
          <MagicCard bodyStyle={{ padding: 0 }} hoverable={false} loading={this.props.declSpinning} onSizeChange={this.toggleFullscreen}>
            <Tabs defaultActiveKey="header">
              {tabs}
            </Tabs>
          </MagicCard>
        </Content>
      </Layout>
    );
  }
}
