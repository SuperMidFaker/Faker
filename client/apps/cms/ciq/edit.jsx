import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Badge, Form, Breadcrumb, Button, Icon, Layout, Tabs, message, Dropdown, Menu } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import { setNavTitle } from 'common/reducers/navbar';
import { loadEntry, saveEntryHead } from 'common/reducers/cmsManifest';
import { deleteDecl, setDeclReviewed, openDeclReleasedModal, showSendDeclModal } from 'common/reducers/cmsDeclare';
import PageHeader from 'client/components/PageHeader';
import MagicCard from 'client/components/MagicCard';
import CiqDeclHeadPane from './tabpane/ciqDeclHeadPane';
import CiqDeclGoodsPane from './tabpane/ciqDeclGoodsPane';
// import ContainersPane from './tabpane/containersPane';
// import AttachedDocsPane from './tabpane/attachedDocsPane';
// import AttachedCertsPane from './tabpane/attachedCertsPane';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import { CMS_DECL_STATUS } from 'common/constants';
import { showPreviewer } from 'common/reducers/cmsDelgInfoHub';

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
    billMeta: state.cmsManifest.billMeta,
    head: state.cmsManifest.entryHead,
    bodies: state.cmsManifest.entryBodies,
    tenantId: state.account.tenantId,
    formRequire: state.cmsManifest.params,
  }),
  { saveEntryHead, loadEntry, deleteDecl, setDeclReviewed, openDeclReleasedModal, showSendDeclModal, setNavTitle, showPreviewer }
)
@connectNav(navObj)
@Form.create()
export default class CiqDeclEdit extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ioType: PropTypes.oneOf(['in', 'out']),
    billMeta: PropTypes.shape({
      bill_seq_no: PropTypes.string.isRequired,
      entries: PropTypes.arrayOf(PropTypes.shape({ pre_entry_seq_no: PropTypes.string })),
    }),
    declSpinning: PropTypes.bool.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    visible: false,
    collapsed: true,
    fullscreen: true,
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.params.preEntrySeqNo !== this.props.params.preEntrySeqNo) {
      this.props.loadEntry(nextProps.params.billseqno, nextProps.params.preEntrySeqNo, nextProps.tenantId);
      this.props.setNavTitle(navObj);
    }
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }
  toggleFullscreen = (fullscreen) => {
    this.setState({ fullscreen });
  }
  handleDock = () => {
    this.setState({ visible: true });
  }
  handleManifestVisit = () => {
    const { ioType, billMeta } = this.props;
    const pathname = `/clearance/${ioType}/manifest/view/${billMeta.bill_seq_no}`;
    this.context.router.push({ pathname });
  }
  handleDelete = () => {
    const head = this.props.head;
    this.props.deleteDecl(head.id, head.bill_seq_no).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.context.router.push(`/clearance/${this.props.ioType}/customs`);
      }
    });
  }

  reloadEntry = () => {
    this.props.loadEntry(this.props.head.bill_seq_no, this.props.head.pre_entry_seq_no, this.props.tenantId);
  }
  handlePreview = (delgNo) => {
    this.props.showPreviewer(delgNo, 'customsDecl');
  }
  render() {
    const { form, head, bodies, billMeta } = this.props;
    const declkey = Object.keys(CMS_DECL_STATUS).filter(stkey => CMS_DECL_STATUS[stkey].value === head.status)[0];
    const declEntryMenu = (
      <Menu onClick={this.handleLinkMenuClick}>
        <Menu.Item key="manifest">申报清单</Menu.Item>
        {billMeta.entries.map(bme => (<Menu.Item key={bme.pre_entry_seq_no}>
          <Icon type="file" /> 关联报关单{bme.entry_id || bme.pre_entry_seq_no}</Menu.Item>)
        )}
      </Menu>);
    const tabs = [];
    tabs.push(
      <TabPane tab="基本信息" key="header">
        <CiqDeclHeadPane ioType={this.props.params.ioType} form={form} formData={head} />
      </TabPane>);
    tabs.push(
      <TabPane tab="商品信息" key="body">
        <CiqDeclGoodsPane ioType={this.props.params.ioType} data={bodies} headNo={head.id} fullscreen={this.state.fullscreen} />
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
                <a onClick={() => this.handlePreview(head.delg_no)}>{head.bill_seq_no}</a>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {head.entry_id || head.pre_entry_seq_no}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Nav>
            {declkey && <Badge status={CMS_DECL_STATUS[declkey].badge} text={CMS_DECL_STATUS[declkey].text} />}
          </PageHeader.Nav>
          <PageHeader.Actions>
            <Dropdown overlay={declEntryMenu}>
              <Button ><Icon type="link" />转至 <Icon type="down" /></Button>
            </Dropdown>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content layout-min-width layout-min-width-large">
          <MagicCard bodyStyle={{ padding: 0 }} noHovering loading={this.props.declSpinning} onSizeChange={this.toggleFullscreen}>
            <Tabs defaultActiveKey="header">
              {tabs}
            </Tabs>
          </MagicCard>
        </Content>
      </Layout>
    );
  }
}
