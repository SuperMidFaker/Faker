import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Badge, Form, Breadcrumb, Button, Icon, Layout, Tabs, message, Popconfirm, Dropdown, Menu } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import { setNavTitle } from 'common/reducers/navbar';
import { loadEntry, saveEntryHead } from 'common/reducers/cmsManifest';
import { deleteDecl, setDeclReviewed, openDeclReleasedModal, showSendDeclModal } from 'common/reducers/cmsDeclare';
import NavLink from 'client/components/NavLink';
import PageHeader from 'client/components/PageHeader';
import MagicCard from 'client/components/MagicCard';
import CustomsDeclHeadPane from './tabpane/customsDeclHeadPane';
import CustomsDeclBodyPane from './tabpane/customsDeclBodyPane';
import ContainersPane from './tabpane/containersPane';
import AttachedDocsPane from './tabpane/attachedDocsPane';
import AttachedCertsPane from './tabpane/attachedCertsPane';
import CiqDetailsPane from './tabpane/ciqDetailsPane';
import ManifestDetailsPane from './tabpane/manifestDetailsPane';
import DeclReleasedModal from './modals/declReleasedModal';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import { CMS_DECL_STATUS } from 'common/constants';
import SendDeclMsgModal from './modals/sendDeclMsgModal';
import { StandardDocDef } from './print/standardDocDef';
import { showPreviewer } from 'common/reducers/cmsDelgInfoHub';
import DelegationDockPanel from '../dock/delegationDockPanel';
import OrderDockPanel from '../../../scof/orders/docks/orderDockPanel';

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
export default class CustomsDeclEditor extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ietype: PropTypes.oneOf(['import', 'export']),
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
  componentDidMount() {
    let script;
    if (!document.getElementById('pdfmake-min')) {
      script = document.createElement('script');
      script.id = 'pdfmake-min';
      script.src = `${__CDN__}/assets/pdfmake/pdfmake.min.js`;
      script.async = true;
      document.body.appendChild(script);
    }
    if (!document.getElementById('pdfmake-vfsfont')) {
      script = document.createElement('script');
      script.id = 'pdfmake-vfsfont';
      script.src = `${__CDN__}/assets/pdfmake/vfs_fonts.js`;
      script.async = true;
      document.body.appendChild(script);
    }
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
    const { ietype, billMeta } = this.props;
    const pathname = `/clearance/${ietype}/manifest/view/${billMeta.bill_seq_no}`;
    this.context.router.push({ pathname });
  }
  handleDelete = () => {
    const head = this.props.head;
    this.props.deleteDecl(head.id, head.bill_seq_no).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.context.router.push(`/clearance/${this.props.ietype}/customs`);
      }
    });
  }
  handleReview = () => {
    const head = this.props.head;
    this.props.setDeclReviewed([this.props.head.id], CMS_DECL_STATUS.reviewed.value).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.props.loadEntry(head.bill_seq_no, head.pre_entry_seq_no, this.props.tenantId);
      }
    });
  }
  handleRecall = () => {
    const head = this.props.head;
    this.props.setDeclReviewed([head.id], CMS_DECL_STATUS.proposed.value).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.props.loadEntry(head.bill_seq_no, head.pre_entry_seq_no, this.props.tenantId);
      }
    });
  }
  handleShowSendDeclModal = () => {
    const head = this.props.head;
    const ietype = this.props.ietype;
    this.props.showSendDeclModal({ visible: true,
      defaultDecl: { channel: head.dec_channel, dectype: head.pre_entry_dec_type, appuuid: head.ep_app_uuid },
      ietype,
      preEntrySeqNo: head.pre_entry_seq_no,
      delgNo: head.delg_no,
      agentCustCo: head.agent_custco });
  }
  handleMarkReleasedModal = () => {
    const head = this.props.head;
    this.props.openDeclReleasedModal(head.entry_id, head.pre_entry_seq_no, head.delg_no);
  }
  reloadEntry = () => {
    this.props.loadEntry(this.props.head.bill_seq_no, this.props.head.pre_entry_seq_no, this.props.tenantId);
  }
  handleEntryVisit = (ev) => {
    const { ietype, billMeta } = this.props;
    const pathname = `/clearance/${ietype}/cusdecl/${billMeta.bill_seq_no}/${ev.key}`;
    this.context.router.push({ pathname });
  }
  handleMoreMenuClick = (ev) => {
    if (ev.key === 'release') {
      this.handleMarkReleasedModal();
    } else if (ev.key === 'resend') {
      this.handleShowSendDeclModal();
    } else if (ev.key === 'declMsg') {
      this.handleEpSendXmlView(this.props.head.ep_send_filename);
    } else if (ev.key === 'resultMsg') {
      this.handleEpRecvXmlView(this.props.head.ep_receipt_filename);
    }
  }
  handleEpSendXmlView = (filename) => {
    window.open(`${API_ROOTS.default}v1/cms/customs/epsend/xml?filename=${filename}`);
  }
  handleEpRecvXmlView = (filename) => {
    window.open(`${API_ROOTS.default}v1/cms/customs/eprecv/xml?filename=${filename}`);
  }
  handleLinkMenuClick = (ev) => {
    if (ev.key === 'manifest') {
      this.handleManifestVisit();
    } else {
      this.handleEntryVisit(ev);
    }
  }
  handlePrintMenuClick = (ev) => {
    const { head, bodies, billMeta, formRequire } = this.props;
    let docDefinition;
    window.pdfMake.fonts = {
      yahei: {
        normal: 'msyh.ttf',
        bold: 'msyh.ttf',
      },
    };
    if (ev.key === 'standard') {
      docDefinition = StandardDocDef(head, bodies, billMeta.declWayCode, billMeta.orderNo, formRequire);
      window.pdfMake.createPdf(docDefinition).open();
    } else if (ev.key === 'skeleton') {
      docDefinition = StandardDocDef(head, bodies, billMeta.declWayCode, billMeta.orderNo, formRequire, true);
      window.pdfMake.createPdf(docDefinition).print();
    }
  }
  handlePreview = (delgNo) => {
    this.props.showPreviewer(delgNo, 'customsDecl');
  }
  render() {
    const { ietype, form, head, bodies, billMeta } = this.props;
    let filterProducts = [];
    if (ietype === 'import') {
      filterProducts = bodies.filter(item => item.customs && item.customs.indexOf('A') !== -1);
    } else {
      filterProducts = bodies.filter(item => item.customs && item.customs.indexOf('B') !== -1);
    }
    const declkey = Object.keys(CMS_DECL_STATUS).filter(stkey => CMS_DECL_STATUS[stkey].value === head.status)[0];
    const declEntryMenu = (
      <Menu onClick={this.handleLinkMenuClick}>
        <Menu.Item key="manifest">申报清单</Menu.Item>
        {billMeta.entries.map(bme => (<Menu.Item key={bme.pre_entry_seq_no}>
          <Icon type="file" /> 关联报关单{bme.entry_id || bme.pre_entry_seq_no}</Menu.Item>)
        )}
      </Menu>);
    const printMenu = (
      <Menu onClick={this.handlePrintMenuClick}>
        <Menu.Item key="standard">标准格式</Menu.Item>
        <Menu.Item key="skeleton">套打格式</Menu.Item>
      </Menu>
    );
    const moreMenu = (
      <Menu onClick={this.handleMoreMenuClick}>
        { head.status === CMS_DECL_STATUS.proposed.value &&
        <Menu.Item key="delete"><Popconfirm title={this.msg('deleteConfirm')} onConfirm={() => this.handleDelete()}><Icon type="delete" /> 删除</Popconfirm></Menu.Item>}
        { head.status === CMS_DECL_STATUS.reviewed.value &&
        <Menu.Item key="recall"><Popconfirm title={this.msg('recallConfirm')} onConfirm={() => this.handleRecall()}><Icon type="close-circle-o" /> 取消复核</Popconfirm></Menu.Item>}
        { head.status === CMS_DECL_STATUS.sent.value &&
        <Menu.Item key="resend"><Icon type="mail" /> 重新发送</Menu.Item>}
        { (head.status === CMS_DECL_STATUS.reviewed.value || head.status === CMS_DECL_STATUS.sent.value) &&
        <Menu.Item key="release"><Icon type="flag" /> 放行确认</Menu.Item>}
        { head.status > CMS_DECL_STATUS.reviewed.value && <Menu.Item key="declMsg"><Icon type="eye-o" /> 查看申报报文</Menu.Item>}
        { head.status > CMS_DECL_STATUS.sent.value && <Menu.Item key="resultMsg"><Icon type="eye-o" /> 查看回执报文</Menu.Item>}
        <Menu.Divider />
        <Menu.Item key="log"><Icon type="solution" /> 操作记录</Menu.Item>
      </Menu>
    );
    const tabs = [];
    tabs.push(
      <TabPane tab="报关单表头" key="header">
        <CustomsDeclHeadPane ietype={ietype} form={form} formData={head} />
      </TabPane>);
    tabs.push(
      <TabPane tab="报关单表体" key="body">
        <CustomsDeclBodyPane ietype={ietype} data={bodies} headNo={head.id} fullscreen={this.state.fullscreen} />
      </TabPane>);
    tabs.push(
      <TabPane tab="集装箱" key="containers" head={head} disabled={head.traf_mode === '5'}>
        <ContainersPane fullscreen={this.state.fullscreen} />
      </TabPane>);
    tabs.push(
      <TabPane tab="随附单证" key="attachedCerts" head={head}>
        <AttachedCertsPane fullscreen={this.state.fullscreen} />
      </TabPane>);
    tabs.push(
      <TabPane tab="随附单据" key="attachedDocs" head={head}>
        <AttachedDocsPane fullscreen={this.state.fullscreen} />
      </TabPane>);
    tabs.push(
      <TabPane tab="申报商品明细" key="manifestDetails" head={head}>
        <ManifestDetailsPane fullscreen={this.state.fullscreen} />
      </TabPane>);
    if (filterProducts.length > 0) {
      tabs.push(
        <TabPane tab="法检商品" key="ciqDetails">
          <CiqDetailsPane filterProducts={filterProducts} fullscreen={this.state.fullscreen} />
        </TabPane>);
    }
    return (
      <Layout>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                <NavLink to={`/clearance/${ietype}/cusdecl/`}>{this.msg('customsDecl')}</NavLink>
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
            <Dropdown overlay={printMenu}>
              <Button >
                <Icon type="printer" /> 打印
                </Button>
            </Dropdown>
            { head.status === CMS_DECL_STATUS.proposed.value &&
            <Button type="primary" icon="check-circle-o" onClick={this.handleReview}>{this.msg('review')}</Button>
              }
            { head.status === CMS_DECL_STATUS.reviewed.value &&
            <Button type="primary" icon="mail" onClick={this.handleShowSendDeclModal}>{this.msg('sendDeclMsg')}</Button>
              }
            { head.status === CMS_DECL_STATUS.entered.value &&
            <Button type="primary" icon="flag" onClick={this.handleMarkReleasedModal} >{this.msg('markReleased')}</Button>
              }
            <Dropdown overlay={moreMenu}>
              <Button icon="ellipsis" />
            </Dropdown>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content layout-min-width layout-min-width-large readonly">
          <MagicCard bodyStyle={{ padding: 0 }} noHovering loading={this.props.declSpinning} onSizeChange={this.toggleFullscreen}>
            <Tabs defaultActiveKey="header">
              {tabs}
            </Tabs>
          </MagicCard>
        </Content>
        <DelegationDockPanel ietype={ietype} />
        <OrderDockPanel />
        <SendDeclMsgModal reload={this.reloadEntry} />
        <DeclReleasedModal reload={this.reloadEntry} />
      </Layout>
    );
  }
}
