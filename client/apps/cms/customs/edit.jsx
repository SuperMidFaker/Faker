import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Badge, Form, Button, Icon, Layout, Tabs, message, Popconfirm, Dropdown, Menu, Upload } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { CMS_DECL_STATUS } from 'common/constants';
import { setNavTitle } from 'common/reducers/navbar';
import { loadEntry, loadCmsParams, saveEntryHead } from 'common/reducers/cmsManifest';
import { deleteDecl, setDeclReviewed, openDeclReleasedModal, showSendDeclModal, showDeclLog, uploadDecl } from 'common/reducers/cmsCustomsDeclare';
import { toggleDeclMsgModal } from 'common/reducers/cmsCiqDeclare';
import { showPreviewer } from 'common/reducers/cmsDelegationDock';
import connectNav from 'client/common/decorators/connect-nav';
import NavLink from 'client/components/NavLink';
import PageHeader from 'client/components/PageHeader';
import MagicCard from 'client/components/MagicCard';
import OrderDockPanel from 'client/apps/scof/orders/docks/orderDockPanel';
import DelegationDockPanel from '../common/dock/delegationDockPanel';
import DeclTreePopover from '../common/popover/declTreePopover';
import CusDeclHeadPane from './tabpane/cusDeclHeadPane';
import CusDeclBodyPane from './tabpane/cusDeclBodyPane';
import ContainersPane from './tabpane/containersPane';
import AttachedDocsPane from './tabpane/attachedDocsPane';
import AttachedCertsPane from './tabpane/attachedCertsPane';
import DutyTaxPane from './tabpane/dutyTaxPane';
// import ManifestDetailsPane from './tabpane/manifestDetailsPane';
import DeclReleasedModal from './modals/declReleasedModal';
import SendDeclMsgModal from './modals/sendDeclMsgModal';
import CusDeclLogsPanel from './panel/cusDeclLogsPanel';
import { StandardDocDef } from './print/docDef';
import DeclMsgModal from './modals/declMsgModal';
import { formatMsg } from './message.i18n';

const { Content } = Layout;
const { TabPane } = Tabs;

const navObj = {
  depth: 3,
  moduleName: 'clearance',
  jumpOut: true,
};

function fetchData({ dispatch, params, state }) {
  const promises = [];
  promises.push(dispatch(loadEntry(
    params.billseqno,
    params.preEntrySeqNo,
    state.account.tenantId
  )));
  promises.push(dispatch(loadCmsParams({
    ieType: 'import',
    tenantId: state.account.tenantId,
  })));
  return Promise.all(promises);
}
@injectIntl
@connect(
  state => ({
    billMeta: state.cmsManifest.billMeta,
    head: state.cmsManifest.entryHead,
    bodies: state.cmsManifest.entryBodies,
    tenantId: state.account.tenantId,
    formRequire: state.cmsManifest.params,
    declSpinning: state.cmsManifest.customsDeclLoading,
  }),
  {
    saveEntryHead,
    loadEntry,
    loadCmsParams,
    deleteDecl,
    setDeclReviewed,
    openDeclReleasedModal,
    showSendDeclModal,
    setNavTitle,
    showPreviewer,
    toggleDeclMsgModal,
    showDeclLog,
    uploadDecl,
  }
)
@connectFetch()(fetchData)
@connectNav(navObj)
@Form.create()
export default class CustomsDeclEditor extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    // ietype: PropTypes.oneOf(['import', 'export']),
    billMeta: PropTypes.shape({
      bill_seq_no: PropTypes.string.isRequired,
      entries: PropTypes.arrayOf(PropTypes.shape({ pre_entry_seq_no: PropTypes.string })),
    }),
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
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
      this.props.loadEntry(
        nextProps.params.billseqno,
        nextProps.params.preEntrySeqNo,
        nextProps.tenantId,
      );
      this.props.setNavTitle(navObj);
    }
  }
  msg = formatMsg(this.props.intl)
  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }
  toggleFullscreen = (fullscreen) => {
    this.setState({ fullscreen });
  }
  handleManifestVisit = () => {
    const { params, billMeta } = this.props;
    const pathname = `/clearance/${params.ietype}/manifest/view/${billMeta.bill_seq_no}`;
    this.context.router.push({ pathname });
  }
  handleDelete = () => {
    const { head } = this.props;
    this.props.deleteDecl(head.id, head.bill_seq_no).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.context.router.push(`/clearance/${this.props.params.ietype}/customs`);
      }
    });
  }
  handleReview = () => {
    const { head } = this.props;
    this.props.setDeclReviewed(
      [this.props.head.id],
      CMS_DECL_STATUS.reviewed.value,
    ).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.props.loadEntry(head.bill_seq_no, head.pre_entry_seq_no, this.props.tenantId);
      }
    });
  }
  handleRecall = () => {
    const { head } = this.props;
    this.props.setDeclReviewed([head.id], CMS_DECL_STATUS.proposed.value).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.props.loadEntry(head.bill_seq_no, head.pre_entry_seq_no, this.props.tenantId);
      }
    });
  }
  handleShowSendDeclModal = () => {
    const { head } = this.props;
    const { ietype } = this.props.params;
    this.props.showSendDeclModal({
      visible: true,
      defaultDecl: {
        channel: head.dec_channel,
        dectype: head.pre_entry_dec_type,
        appuuid: head.ep_app_uuid,
      },
      ietype,
      preEntrySeqNo: head.pre_entry_seq_no,
      delgNo: head.delg_no,
      agentCustCo: head.agent_custco,
    });
  }
  handleMarkReleasedModal = () => {
    const { head } = this.props;
    this.props.openDeclReleasedModal(
      head.entry_id,
      head.pre_entry_seq_no, head.delg_no, head.i_e_type
    );
  }
  reloadEntry = () => {
    this.props.loadEntry(
      this.props.head.bill_seq_no,
      this.props.head.pre_entry_seq_no,
      this.props.tenantId,
    );
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
    } else if (ev.key === 'log') {
      this.props.showDeclLog();
    } else if (ev.key === 'file') {
      window.open(this.props.head.ccd_file);
    }
  }
  handleEpSendXmlView = (filename) => {
    this.props.toggleDeclMsgModal(true, filename, 'sent');
  }
  handleEpRecvXmlView = (filename) => {
    this.props.toggleDeclMsgModal(true, filename, 'return');
  }
  handlePrintMenuClick = (ev) => {
    const {
      head, bodies, formRequire,
    } = this.props;
    let docDef;
    window.pdfMake.fonts = {
      yahei: {
        normal: 'msyh.ttf',
        bold: 'msyh.ttf',
      },
    };
    if (ev.key === 'standard') {
      docDef = StandardDocDef(head, bodies, head.decl_way_code, head.cust_order_no, formRequire);
      window.pdfMake.createPdf(docDef).open();
    } else if (ev.key === 'skeleton') {
      docDef = StandardDocDef(
        head, bodies, head.decl_way_code, head.cust_order_no,
        formRequire, true
      );
      window.pdfMake.createPdf(docDef).print();
    }
  }
  handlePreview = (delgNo) => {
    this.props.showPreviewer(delgNo, 'shipment');
  }
  handleUploaded = (data) => {
    this.props.uploadDecl(data).then((result) => {
      if (!result.error) {
        this.props.loadEntry(
          this.props.params.billseqno,
          this.props.params.preEntrySeqNo,
          this.props.tenantId,
        );
      }
    });
  }
  render() {
    const {
      params, form, head, bodies, billMeta,
    } = this.props;
    const me = this;
    let filterProducts = [];
    if (params.ietype === 'import') {
      filterProducts = bodies.filter(item => item.customs && item.customs.indexOf('A') !== -1);
    } else {
      filterProducts = bodies.filter(item => item.customs && item.customs.indexOf('B') !== -1);
    }
    const declkey = Object.keys(CMS_DECL_STATUS).filter(stkey =>
      CMS_DECL_STATUS[stkey].value === head.status)[0];
    const printMenu = (
      <Menu onClick={this.handlePrintMenuClick}>
        <Menu.Item key="standard">标准格式</Menu.Item>
        <Menu.Item key="skeleton">套打格式</Menu.Item>
      </Menu>
    );
    const uploadProps = {
      action: `${API_ROOTS.default}v1/upload/img/`,
      multiple: false,
      showUploadList: false,
      withCredentials: true,
      onChange(info) {
        if (info.file.response && info.file.response.status === 200) {
          me.handleUploaded({
            delg_no: head.delg_no,
            pre_entry_seq_no: head.pre_entry_seq_no,
            doc_code: 'CCD',
            doc_no: head.entry_id,
            doc_name: info.file.name,
            url: info.file.response.data,
            doc_type: info.file.type,
          });
          message.success('上传成功');
        }
      },
    };
    const moreMenu = (
      <Menu onClick={this.handleMoreMenuClick}>
        { head.status === CMS_DECL_STATUS.proposed.value &&
        <Menu.Item key="delete"><Popconfirm title={this.msg('deleteConfirm')} onConfirm={() => this.handleDelete()}><Icon type="delete" /> 删除</Popconfirm></Menu.Item>}
        { head.status === CMS_DECL_STATUS.reviewed.value &&
        <Menu.Item key="recall"><Popconfirm title={this.msg('recallConfirm')} onConfirm={() => this.handleRecall()}><Icon type="close-circle-o" /> 取消复核</Popconfirm></Menu.Item>}
        { head.status === CMS_DECL_STATUS.sent.value &&
        <Menu.Item key="resend"><Icon type="mail" /> 重新发送</Menu.Item>}
        { (head.status === CMS_DECL_STATUS.reviewed.value ||
        head.status === CMS_DECL_STATUS.sent.value) &&
        <Menu.Item key="release"><Icon type="flag" /> 放行确认</Menu.Item>}
        { head.status > CMS_DECL_STATUS.reviewed.value && <Menu.Item key="declMsg"><Icon type="eye-o" /> 查看申报报文</Menu.Item>}
        { head.status > CMS_DECL_STATUS.sent.value && <Menu.Item key="resultMsg"><Icon type="eye-o" /> 查看回执报文</Menu.Item>}
        <Menu.Divider />
        { head.ccd_file ?
          <Menu.Item key="file"><Icon type="file" /> 查看报关单</Menu.Item> :
          <Menu.Item key="upload">
            <Upload {...uploadProps}>
              <Icon type="upload" /> 上传报关单
            </Upload>
          </Menu.Item>
        }
        <Menu.Divider />
        <Menu.Item key="log"><Icon type="solution" /> 操作记录</Menu.Item>
      </Menu>
    );
    const tabs = [];
    tabs.push(<TabPane tab="报关单表头" key="header">
      <CusDeclHeadPane ietype={params.ietype} form={form} formData={head} />
    </TabPane>);
    tabs.push(<TabPane tab="报关单表体" key="body">
      <CusDeclBodyPane
        ietype={params.ietype}
        data={bodies}
        headNo={head.id}
        fullscreen={this.state.fullscreen}
      />
    </TabPane>);
    tabs.push(<TabPane tab="集装箱" key="containers" head={head} disabled={head.traf_mode === '5'}>
      <ContainersPane fullscreen={this.state.fullscreen} />
    </TabPane>);
    tabs.push(<TabPane tab="随附单证" key="attachedCerts" head={head}>
      <AttachedCertsPane fullscreen={this.state.fullscreen} />
    </TabPane>);
    tabs.push(<TabPane tab="随附单据" key="attachedDocs" head={head}>
      <AttachedDocsPane fullscreen={this.state.fullscreen} />
    </TabPane>);
    tabs.push(<TabPane tab="预估税金" key="dutyTax">
      <DutyTaxPane fullscreen={this.state.fullscreen} head={head} />
    </TabPane>);
    /*
    tabs.push(<TabPane tab="报关清单明细" key="manifestDetails" head={head}>
      <ManifestDetailsPane fullscreen={this.state.fullscreen} />
    </TabPane>);
    */
    if (filterProducts.length > 0) {
      /*
      tabs.push(<TabPane tab="法检商品" key="ciqDetails">
        <CiqDetailsPane filterProducts={filterProducts} fullscreen={this.state.fullscreen} />
      </TabPane>);
      */
    }
    return (
      <Layout>
        <PageHeader
          breadcrumb={[
            <NavLink to="/clearance/cusdecl/">{this.msg('customsDecl')}</NavLink>,
            <a onClick={() => this.handlePreview(head.delg_no)}>{head.bill_seq_no}</a>,
            head.entry_id || head.pre_entry_seq_no,
          ]}
        >
          <PageHeader.Nav>
            {declkey &&
            <Badge status={CMS_DECL_STATUS[declkey].badge} text={CMS_DECL_STATUS[declkey].text} />}
          </PageHeader.Nav>
          <PageHeader.Actions>
            {<DeclTreePopover
              entries={billMeta.entries}
              ciqs={billMeta.ciqs}
              ietype={params.ietype}
              billSeqNo={billMeta.bill_seq_no}
              currentKey={`cus-decl-${head.pre_entry_seq_no}`}
            />}
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
          <MagicCard
            bodyStyle={{ padding: 0 }}

            loading={this.props.declSpinning}
            onSizeChange={this.toggleFullscreen}
          >
            <Tabs defaultActiveKey="header">
              {tabs}
            </Tabs>
          </MagicCard>
        </Content>
        <DelegationDockPanel ietype={params.ietype} />
        <OrderDockPanel />
        <SendDeclMsgModal reload={this.reloadEntry} />
        <DeclReleasedModal reload={this.reloadEntry} />
        <DeclMsgModal />
        <CusDeclLogsPanel preEntrySeqNo={head.pre_entry_seq_no} />
      </Layout>
    );
  }
}
