import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Breadcrumb, Button, Dropdown, Layout, Menu, Icon, Form, Modal, message,
  notification, Switch, Tooltip, Tabs, Select, Spin, Popconfirm } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import { saveBillHead, lockManifest, openMergeSplitModal, resetBill, updateHeadNetWt, editBillBody,
  loadBillBody, saveBillRules, setStepVisible, billHeadChange, redoManifest, loadTemplateFormVals,
  showSendDeclsModal, validateBillDatas, loadBillMeta, resetBillHead } from 'common/reducers/cmsManifest';
import { loadDocuDatas } from 'common/reducers/cmsInvoice';
import { showPreviewer } from 'common/reducers/cmsDelgInfoHub';
import { CMS_DECL_STATUS } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import PageHeader from 'client/components/PageHeader';
import MagicCard from 'client/components/MagicCard';
import ManifestHeadPane from './tabpane/manifestHeadPane';
import ManifestBodyPane from './tabpane/manifestBodyPane';
import CiqDetailsPane from './tabpane/ciqDetailsPane';
import ContainersPane from './tabpane/containersPane';
import InvoicesPane from './tabpane/invoicesPane';
import GenerateDeclModal from './modals/generateDeclModal';
import SaveAsTemplateModal from './template/modal/saveAsTemplateModal';
import messages from './message.i18n';
import SendDeclsModal from './modals/sendDeclsModal';
import DeclTreePopover from '../popover/declTreePopover';
import DelegationDockPanel from '../dock/delegationDockPanel';
import OrderDockPanel from '../../../scof/orders/docks/orderDockPanel';

const formatMsg = format(messages);
const { Content } = Layout;
const { TabPane } = Tabs;
const { Option } = Select;
const { OptGroup } = Select;
const { confirm } = Modal;

@injectIntl
@connect(
  state => ({
    billMeta: state.cmsManifest.billMeta,
    billHead: state.cmsManifest.billHead,
    billBodies: state.cmsManifest.billBodies,
    templates: state.cmsManifest.templates,
    loginId: state.account.loginId,
    loginName: state.account.username,
    tenantId: state.account.tenantId,
    formData: state.cmsManifest.formData,
    templateValLoading: state.cmsManifest.templateValLoading,
    billHeadFieldsChangeTimes: state.cmsManifest.billHeadFieldsChangeTimes,
  }),
  {
    saveBillHead,
    openMergeSplitModal,
    resetBill,
    updateHeadNetWt,
    loadBillBody,
    editBillBody,
    loadTemplateFormVals,
    saveBillRules,
    setStepVisible,
    billHeadChange,
    lockManifest,
    redoManifest,
    showSendDeclsModal,
    validateBillDatas,
    loadBillMeta,
    showPreviewer,
    loadDocuDatas,
    resetBillHead,
  }
)
@connectNav({
  depth: 3,
  moduleName: 'clearance',
  jumpOut: true,
})
@Form.create({ onValuesChange: (props, values) => props.billHeadChange(values) })
export default class ManifestEditor extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    loginId: PropTypes.number.isRequired,
    ietype: PropTypes.oneOf(['import', 'export']),
    readonly: PropTypes.bool,
    billMeta: PropTypes.shape({
      bill_seq_no: PropTypes.string.isRequired,
      entries: PropTypes.arrayOf(PropTypes.shape({ pre_entry_seq_no: PropTypes.string })),
    }),
    templates: PropTypes.array.isRequired,
    templateValLoading: PropTypes.bool.isRequired,
    manifestSpinning: PropTypes.bool.isRequired,
    billHeadFieldsChangeTimes: PropTypes.number.isRequired,

  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  static defaultProps = {
    readonly: false,
  }
  state = {
    collapsed: true,
    generating: false,
    locked: false,
    lockedByOthers: false,
    headData: {},
    fullscreen: true,
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.billHead !== this.props.billHead) {
      this.setState({
        headData: nextProps.billHead,
        locked: nextProps.billHead.locking_login_id,
        lockedByOthers: nextProps.billHead.locking_login_id !== this.props.loginId,
      });
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
  handleGenerateEntry = () => {
    this.props.form.validateFields((errors) => {
      if (!errors) {
        this.generateEntry();
      } else {
        this.setState({ generating: false });
        message.error('清单表头尚未填写完整', 3);
      }
    });
  }
  generateEntry = () => {
    const { billHead } = this.props;
    this.setState({ generating: true });
    this.props.validateBillDatas({
      billSeqNo: this.props.billHead.bill_seq_no,
      delgNo: billHead.delg_no,
    }).then((result) => {
      if (result.error) {
        this.setState({ generating: false });
        if (result.error.message.key === 'body-error') {
          const incompGnos = result.error.message.incompleteGnos;
          const uqGnos = result.error.message.unitqtyGnos;
          if (incompGnos.length > 0) {
            const msg = `序号为 ${incompGnos.join(',')} 的表体数据申报品名单位数量或国别或单价币制为空`;
            notification.error({
              message: '表体数据不完整',
              duration: 0,
              description: msg,
            });
          }
          if (uqGnos.length > 0) {
            const msg = `序号为 ${uqGnos.join(',')} 的法一法二申报单位相同,数量不一致`;
            notification.error({
              message: '表体单位数量错误',
              duration: 0,
              description: msg,
            });
          }
        } else {
          message.error(result.error.message, 10);
        }
      } else {
        this.setState({ generating: false });
        this.props.openMergeSplitModal();
      }
    });
  }
  validateCode = (code, customsCode) => {
    let info = null;
    if (code === '' && customsCode === '') {
      info = '请填写社会信用代码或者海关编码';
    } else if (code && code.length !== 18) {
      info = `社会信用代码必须为18位, 当前${code.length}位`;
    } else if (customsCode && customsCode.length !== 10) {
      info = `海关10位编码必须为10位, 当前${customsCode.length}位`;
    }
    return info;
  }
  handleBillSave = () => {
    const {
      billHead, ietype, loginId, tenantId, formData,
    } = this.props;
    let templateId = formData.template_id;
    if (!this.props.form.getFieldValue('model')) {
      templateId = null;
    }
    const head = { ...billHead, ...this.props.form.getFieldsValue(), template_id: templateId };
    const tradeInfo = this.validateCode(head.trade_co, head.trade_custco);
    if (tradeInfo) {
      message.error(`${tradeInfo}`);
      return;
    }
    const ownInfo = this.validateCode(head.owner_code, head.owner_custco);
    if (ownInfo) {
      message.error(`${ownInfo}`);
      return;
    }
    const agentInfo = this.validateCode(head.agent_code, head.agent_custco);
    if (agentInfo) {
      message.error(`${agentInfo}`);
      return;
    }
    this.props.saveBillHead({
      head, ietype, loginId, tenantId,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        message.info('保存成功');
      }
    });
  }
  handleBillReset = () => {
    const self = this;
    confirm({
      title: '确定要重置清单吗?',
      content: '点击确定将清空所有表头和表体数据',
      onOk() {
        return new Promise((resolve, reject) => {
          self.props.resetBill(self.props.billHead.id).then((result) => {
            if (result.error) {
              message.error(result.error.message, 10);
              return reject();
            }
            message.info('清单已重置');
            self.props.form.resetFields();
            return resolve();
          });
        }).catch(() => message.error('重置失败'));
      },
      onCancel() {},
    });
  }
  handleBillHeadReset = () => {
    this.props.resetBillHead(this.props.formData.id).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.props.form.resetFields();
      }
    });
  }
  handleRuleChange = (value) => {
    if (value === undefined) {
      // TODO
      message.info('制单规则已清除');
    }
  }
  handleRuleReload = (value) => {
    if (value) {
      this.props.loadTemplateFormVals(value).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          const { formData } = result.data;
          for (const key in formData) {
            if (!formData[key]) {
              delete formData[key];
            }
          }
          const headData = { ...this.props.billHead, ...formData };
          this.setState({ headData });
          const rules = {
            template_id: formData.template_id,
            rule_g_name: formData.rule_g_name,
            rule_currency: formData.rule_currency,
            rule_orig_country: formData.rule_orig_country,
            rule_net_wt: formData.rule_net_wt,
            rule_g_unit: formData.rule_g_unit,
            rule_gunit_num: formData.rule_gunit_num,
            rule_element: formData.rule_element,
            merge_checked: formData.merge_checked,
            merge_byhscode: formData.merge_byhscode,
            merge_bygname: formData.merge_bygname,
            merge_bycurr: formData.merge_bycurr,
            merge_bycountry: formData.merge_bycountry,
            merge_bycopgno: formData.merge_bycopgno,
            merge_byengno: formData.merge_byengno,
            merge_bysplhs: formData.merge_bysplhs,
            merge_bysplno: formData.merge_bysplno,
            merge_spl_hs: formData.merge_spl_hs,
            merge_spl_no: formData.merge_spl_no,
            split_hscode: formData.split_hscode,
            split_spl_category: formData.split_spl_category,
            split_curr: formData.split_curr,
            split_percount: formData.split_percount,
            sort_customs: formData.sort_customs,
            sort_dectotal: formData.sort_dectotal,
            sort_hscode: formData.sort_hscode,
          };
          this.props.saveBillRules({ rules, billSeqNo: this.props.billHead.bill_seq_no });
          message.success('制单规则加载成功');
        }
      });
    } else {
      this.setState({ headData: this.props.billHead });
      // const { billHead, ietype, loginId, tenantId } = this.props;
      // const head = { ...billHead, ...this.props.form.getFieldsValue(), template_id: null };
      // this.props.saveBillHead({ head, ietype, loginId, tenantId });
    }
  }
  handleSaveAsTemplate = () => {
    this.props.setStepVisible(true);
  }
  handleOverlayMenu = (ev) => {
    if (ev.key === 'template') {
      this.props.setStepVisible(true);
    } else if (ev.key === 'lock') {
      this.handleLock(true);
    } else if (ev.key === 'unlock') {
      this.handleLock(false);
    }
  }
  handleLock = (lock) => {
    if (lock) {
      const { loginId, loginName, billHead } = this.props;
      this.props.lockManifest({
        loginId, loginName, billSeqNo: billHead.bill_seq_no, delgNo: billHead.delg_no,
      }).then((result) => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          message.warning('锁定成功');
        }
      });
    } else {
      const { billHead } = this.props;
      this.props.lockManifest({
        loginId: null, loginName: null, billSeqNo: billHead.bill_seq_no, delgNo: billHead.delg_no,
      }).then((result) => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          message.success('解锁成功');
        }
      });
    }
  }
  handleSendDecls = () => {
    const head = this.props.billHead;
    this.props.showSendDeclsModal({
      visible: true,
      delgNo: head.delg_no,
      agentCustCo: head.agent_custco,
    });
  }
  handleManifestRedo = () => {
    const head = this.props.billHead;
    this.props.redoManifest(head.delg_no, head.bill_seq_no).then((result) => {
      if (result.error) {
        message.error(result.error.message, 5);
      } else {
        const link = `/clearance/${this.props.ietype}/manifest/`;
        this.context.router.push(`${link}${head.bill_seq_no}`);
      }
    });
  }
  handleMetaLoad = () => {
    this.props.loadBillMeta(this.props.billHead.bill_seq_no);
  }
  handlePreview = (delgNo) => {
    this.props.showPreviewer(delgNo, 'shipment');
  }
  handleTabChange = (tabKey) => {
    if (tabKey === 'attachedDocs') {
      this.props.loadDocuDatas({ billSeqNo: this.props.billHead.bill_seq_no });
    }
  }
  handleDoctsDownload = () => {
    const billSeqNo = this.props.billHead.bill_seq_no;
    window.open(`${API_ROOTS.default}v1/cms/manifest/docts/download/doctsDatas_${billSeqNo}.xlsm?billSeqNo=${billSeqNo}`);
  }
  renderOverlayMenu(editable, revertable) {
    let lockMenuItem = null;
    if (editable) {
      if (this.props.billHead.locking_login_id === this.props.loginId) {
        lockMenuItem = <Menu.Item key="unlock"><Icon type="unlock" /> 解锁清单</Menu.Item>;
      } else if (!this.props.billHead.locking_login_id) {
        lockMenuItem = <Menu.Item key="lock"><Icon type="lock" /> 锁定清单</Menu.Item>;
      }
    }
    return (
      <Menu onClick={this.handleOverlayMenu}>
        {revertable &&
          <Menu.Item key="redo">
            <Popconfirm title="确定删除已生成的报关建议书?" onConfirm={this.handleManifestRedo}><Icon type="reload" /> 重新制单</Popconfirm>
          </Menu.Item>
        }
        <Menu.Item key="template"><Icon type="book" /> {this.msg('saveAsTemplate')}</Menu.Item>
        {editable && lockMenuItem}
        {/*
        editable && <Menu.Item key="reset">
          <a role="presentation" onClick={this.handleBillReset}> <Icon type="reload" /> 重置清单</a>
    </Menu.Item>
    */}
      </Menu>);
  }
  render() {
    const {
      billHeadFieldsChangeTimes, ietype, form: { getFieldDecorator }, loginId,
      form, billHead, billBodies, billMeta, templates,
    } = this.props;
    const { locked, lockedByOthers } = this.state;
    let sendable = billMeta.entries.length > 0;
    let revertable = billMeta.entries.length > 0;
    billMeta.entries.forEach((entry) => {
      sendable = sendable && (entry.status === CMS_DECL_STATUS.reviewed.value);
      revertable = revertable && (entry.status < CMS_DECL_STATUS.entered.value);
    });
    const path = `/clearance/${ietype}/manifest/`;
    let editable = !this.props.readonly && billMeta.entries.length === 0;
    if (editable && billHead.locking_login_id && billHead.locking_login_id !== loginId) {
      editable = false;
    }
    const modelProps = {};
    if (billHead.template_id) {
      modelProps.initialValue = billHead.template_id;
    }
    let filterProducts = [];
    if (ietype === 'import') {
      filterProducts = billBodies.filter(item => item.customs && item.customs.indexOf('A') !== -1);
    } else {
      filterProducts = billBodies.filter(item => item.customs && item.customs.indexOf('B') !== -1);
    }
    const tabs = [];
    tabs.push(<TabPane tab="申报清单表头" key="header">
      <Spin spinning={this.props.templateValLoading}>
        <ManifestHeadPane
          ietype={ietype}
          readonly={!editable}
          form={form}
          formData={this.state.headData}
          onSave={this.handleBillSave}
        />
      </Spin>
    </TabPane>);
    tabs.push(<TabPane tab="申报清单明细" key="body">
      <ManifestBodyPane
        ietype={ietype}
        readonly={!editable}
        headForm={form}
        data={billBodies}
        billSeqNo={billHead.bill_seq_no}
        fullscreen={this.state.fullscreen}
      />
    </TabPane>);
    if (filterProducts.length > 0) {
      tabs.push(<TabPane tab="法检商品" key="legalInspection">
        <CiqDetailsPane filterProducts={filterProducts} fullscreen={this.state.fullscreen} />
      </TabPane>);
    }
    tabs.push(<TabPane tab="集装箱" key="containers">
      <ContainersPane fullscreen={this.state.fullscreen} />
    </TabPane>);
    tabs.push(<TabPane tab="商业发票" key="invoices">
      <InvoicesPane fullscreen={this.state.fullscreen} />
    </TabPane>);
    /*
      tabs.push(<TabPane tab="随附单据" key="attachedDocs" >
      <DocuPane billSeqNo={billHead.bill_seq_no} fullscreen={this.state.fullscreen} />
    </TabPane>);
    */

    return (
      <Layout>
        <Layout>
          <PageHeader>
            <PageHeader.Title>
              <Breadcrumb>
                <Breadcrumb.Item>
                  {this.msg('declManifest')}
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                  <a onClick={() => this.handlePreview(billHead.delg_no)}>{billMeta.bill_seq_no}</a>
                </Breadcrumb.Item>
              </Breadcrumb>
            </PageHeader.Title>
            <PageHeader.Actions>
              {locked &&
              <Tooltip title={`清单已锁定，仅限${billHead.locking_name}可进行编辑`} placement="bottom">
                <Switch
                  className="switch-lock"
                  checked={locked}
                  checkedChildren={<Icon type="lock" />}
                  unCheckedChildren={<Icon type="unlock" />}
                  disabled={lockedByOthers}
                  onChange={this.handleLock}
                  style={{ marginTop: 4 }}
                />
              </Tooltip>}
              {editable && getFieldDecorator('model', modelProps)(<Select
                placeholder="选择制单规则"
                optionFilterProp="search"

                onSelect={this.handleRuleReload}
                onChange={this.handleRuleChange}
                style={{ width: 200 }}
                allowClear
              >
                <OptGroup label="可用制单规则">
                  {templates.map(data => (<Option
                    key={data.id}
                    value={data.id}
                    search={`${data.id}${data.template_name}`}
                  ><Icon type="book" /> {data.template_name}
                  </Option>))}
                </OptGroup>
              </Select>)
            }
              {billMeta.entries.length > 0 && <DeclTreePopover
                entries={billMeta.entries}
                ciqs={billMeta.ciqs}
                billSeqNo={billMeta.bill_seq_no}
                ietype={ietype}
                selectedKeys={['manifest']}
              />}
              {billMeta.docts &&
              <Button icon="download" onClick={this.handleDoctsDownload}>下载数据</Button>
            }
              {sendable &&
              <Button type="primary" icon="mail" onClick={this.handleSendDecls}>{this.msg('sendAllPackets')}</Button>}
              {editable &&
                <Popconfirm title="是否确认清空表头数据?" onConfirm={this.handleBillHeadReset}>
                  <Button type="danger" icon="delete" />
                </Popconfirm>}
              {editable &&
              (<Button
                type="primary"
                icon="addfile"
                disabled={billHeadFieldsChangeTimes > 0}
                loading={this.state.generating}
                onClick={this.handleGenerateEntry}
              >{this.msg('generateCDP')}
              </Button>) }
              {editable &&
              <Button type="primary" icon="save" onClick={this.handleBillSave} disabled={billHeadFieldsChangeTimes === 0}>保存</Button>}
              <Dropdown overlay={this.renderOverlayMenu(editable, revertable)}><Button icon="ellipsis" /></Dropdown>
            </PageHeader.Actions>
          </PageHeader>
          <Content className={`page-content layout-min-width layout-min-width-large ${!editable ? 'readonly' : ''}`}>
            <MagicCard
              bodyStyle={{ padding: 0 }}
              hoverable={false}
              loading={this.props.manifestSpinning}
              onSizeChange={this.toggleFullscreen}
            >
              <Tabs defaultActiveKey="header" onChange={this.handleTabChange}>
                {tabs}
              </Tabs>
            </MagicCard>
          </Content>
        </Layout>
        <DelegationDockPanel ietype={ietype} />
        <OrderDockPanel />
        <GenerateDeclModal />
        <SaveAsTemplateModal ietype={ietype} />
        <SendDeclsModal ietype={ietype} entries={billMeta.entries} reload={this.handleMetaLoad} />
      </Layout>
    );
  }
}
