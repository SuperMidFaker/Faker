import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Badge, Form, Breadcrumb, Button, Icon, Layout, Tabs, Tooltip, message, Popconfirm, Spin, Dropdown, Menu } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import { setNavTitle } from 'common/reducers/navbar';
import { loadEntry, saveEntryHead } from 'common/reducers/cmsManifest';
import { deleteDecl, setDeclReviewed, openDeclReleasedModal, showSendDeclModal } from 'common/reducers/cmsDeclare';
import NavLink from 'client/components/nav-link';
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
import SendModal from './modals/sendModal';
import { DocDef } from './docDef';


import { showPreviewer } from 'common/reducers/cmsDelgInfoHub';
import DelegationDockPanel from '../dock/delegationDockPanel';
import OrderDockPanel from '../../../scof/orders/docks/orderDockPanel';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const TabPane = Tabs.TabPane;
const ButtonGroup = Button.Group;

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
    this.props.showSendDeclModal({ visible: true, preEntrySeqNo: head.pre_entry_seq_no, delgNo: head.delg_no, agentCustCo: head.agent_custco });
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
    const pathname = `/clearance/${ietype}/customs/${billMeta.bill_seq_no}/${ev.key}`;
    this.context.router.push({ pathname });
  }
  handlePreview = (delgNo) => {
    this.props.showPreviewer(delgNo, 'customsDecl');
  }
  handlePDF = () => {
    const { head, bodies, billMeta } = this.props;
    const docDefinition = DocDef(head, bodies, billMeta.declWayCode);
    window.pdfMake.fonts = {
      yahei: {
        normal: 'msyh.ttf',
        bold: 'msyh.ttf',
      },
    };
    window.pdfMake.createPdf(docDefinition).open();
  }
  handlePrinter = () => {
    const { head, bodies, billMeta } = this.props;
    const docDefinition = DocDef(head, bodies, billMeta.declWayCode);
    window.pdfMake.fonts = {
      yahei: {
        normal: 'msyh.ttf',
        bold: 'msyh.ttf',
      },
    };
    window.pdfMake.createPdf(docDefinition).print();
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
      <Menu onClick={this.handleEntryVisit}>
        {billMeta.entries.map(bme => (<Menu.Item key={bme.pre_entry_seq_no}>
          <Icon type="file" /> {bme.entry_id || bme.pre_entry_seq_no}</Menu.Item>)
        )}
      </Menu>);
    return (
      <Layout>
        <Layout>
          <Header className="top-bar">
            <Breadcrumb>
              <Breadcrumb.Item>
                <Icon type="file" /> <NavLink to={`/clearance/${ietype}/customs/`}>{this.msg('customsDeclaration')}</NavLink>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <a onClick={() => this.handlePreview(head.delg_no)}>{head.bill_seq_no}</a>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {head.entry_id || head.pre_entry_seq_no}
              </Breadcrumb.Item>
            </Breadcrumb>
            {declkey && <Badge status={CMS_DECL_STATUS[declkey].badge} text={CMS_DECL_STATUS[declkey].text} />}
            <div className="top-bar-tools">
              { head.status === CMS_DECL_STATUS.proposed.value && <Popconfirm title={this.msg('deleteConfirm')} onConfirm={() => this.handleDelete()}>
                <Tooltip title={this.msg('delete')} placement="bottom">
                  <Button size="large" icon="delete" />
                </Tooltip>
              </Popconfirm> }
              <ButtonGroup>
                <Button size="large" icon="file-pdf" onClick={this.handlePDF} />
                <Button size="large" icon="printer" onClick={this.handlePrinter} />
                <Button size="large" icon="mail" />
              </ButtonGroup>
              { head.status === CMS_DECL_STATUS.proposed.value &&
                <Button type="primary" size="large" icon="check-circle-o" onClick={this.handleReview}>{this.msg('review')}</Button>
              }
              { head.status === CMS_DECL_STATUS.reviewed.value &&
                <Tooltip title={this.msg('recall')} placement="bottom"><Button size="large" icon="left-circle-o" onClick={this.handleRecall} /></Tooltip>
              }
              { head.status === CMS_DECL_STATUS.reviewed.value &&
                <Button type="primary" size="large" icon="mail" onClick={this.handleShowSendDeclModal}>{this.msg('sendPackets')}</Button>
              }
              { (head.status === CMS_DECL_STATUS.finalized.value || head.status === CMS_DECL_STATUS.sent.value) &&
                <Button type="primary" ghost size="large" icon="flag" onClick={this.handleMarkReleasedModal}>{this.msg('markReleased')}</Button>
              }
              <Dropdown.Button size="large" onClick={this.handleManifestVisit} overlay={declEntryMenu}>
                <Icon type="file-text" /> 关联报关清单
              </Dropdown.Button>
            </div>
          </Header>
          <Content className="main-content layout-min-width layout-min-width-large readonly">
            <Spin spinning={this.props.declSpinning}>
              <div className="page-body tabbed">
                <Tabs defaultActiveKey="header">
                  <TabPane tab="报关单表头" key="header">
                    <CustomsDeclHeadPane ietype={ietype} form={form} formData={head} />
                  </TabPane>
                  <TabPane tab="报关单表体" key="body">
                    <CustomsDeclBodyPane ietype={ietype} data={bodies} headNo={head.id} />
                  </TabPane>
                  <TabPane tab="集装箱" key="containers">
                    <ContainersPane />
                  </TabPane>
                  <TabPane tab="随附单据" key="attachedDocs">
                    <AttachedDocsPane />
                  </TabPane>
                  <TabPane tab="随附单证" key="attachedCerts">
                    <AttachedCertsPane />
                  </TabPane>
                  <TabPane tab="清单明细" key="manifestDetails">
                    <ManifestDetailsPane />
                  </TabPane>
                  {filterProducts.length > 0 && <TabPane tab="法检物料" key="ciqDetails">
                    <CiqDetailsPane filterProducts={filterProducts} />
                  </TabPane>}
                </Tabs>
              </div>
            </Spin>
          </Content>
        </Layout>
        <DelegationDockPanel ietype={ietype} />
        <OrderDockPanel />
        <SendModal ietype={ietype} reload={this.reloadEntry} />
        <DeclReleasedModal reload={this.reloadEntry} />
      </Layout>
    );
  }
}
