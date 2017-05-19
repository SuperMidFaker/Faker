import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Breadcrumb, Button, Dropdown, Layout, Menu, Icon, Form, Modal, message, notification, Switch, Tooltip, Tabs, Select, Spin, Popconfirm } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import { saveBillHead, lockManifest, openMergeSplitModal, resetBill, updateHeadNetWt, editBillBody,
  loadBillBody, saveBillRules, setStepVisible, billHeadChange, redoManifest, loadTemplateFormVals,
  showSendDeclsModal, validateBillDatas, loadBillMeta } from 'common/reducers/cmsManifest';
import NavLink from 'client/components/nav-link';
import ButtonToggle from 'client/components/ButtonToggle';
import ManifestHeadPanel from './panel/manifestHeadPanel';
import ManifestBodyPanel from './panel/manifestBodyPanel';
import MergeSplitModal from './modals/mergeSplit';
import SaveTemplateModal from './modals/saveTemplateSteps';
import SheetExtraPanel from './panel/manifestExtraPanel';
import { CMS_DECL_STATUS } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import SendDeclsModal from './modals/sendDeclsModal';

const formatMsg = format(messages);
const { Header, Content, Sider } = Layout;
const TabPane = Tabs.TabPane;
const Option = Select.Option;
const OptGroup = Select.OptGroup;
const confirm = Modal.confirm;

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
  { saveBillHead, openMergeSplitModal, resetBill, updateHeadNetWt, loadBillBody, editBillBody,
    loadTemplateFormVals, saveBillRules, setStepVisible, billHeadChange, lockManifest,
    redoManifest, showSendDeclsModal, validateBillDatas, loadBillMeta }
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
    editBillBody: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  static defaultProps = {
    readonly: false,
  }
  state = {
    visible: false,
    collapsed: true,
    generating: false,
    locked: false,
    lockedByOthers: false,
    headData: {},
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
    this.props.validateBillDatas({ billSeqNo: this.props.billHead.bill_seq_no, delgNo: billHead.delg_no }).then(
    (result) => {
      if (result.error) {
        this.setState({ generating: false });
        message.error(result.error.message, 10);
      } else if (result.data.length > 0) {
        notification.warning({
          message: '表体数据不完整',
          duration: null,
          description: `序号为 ${result.data.join(',')} 的表体数据尚未填写完整`,
        });
        this.setState({ generating: false });
        this.props.openMergeSplitModal();
      } else if (result.data.length === 0) {
        this.setState({ generating: false });
        this.props.openMergeSplitModal();
      }
    });
  }
  handleEntryVisit = (ev) => {
    const { ietype, billMeta } = this.props;
    const pathname = `/clearance/${ietype}/customs/${billMeta.bill_seq_no}/${ev.key}`;
    this.context.router.push({ pathname });
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
    const { billHead, ietype, loginId, tenantId, formData } = this.props;
    let templateId = formData.template_id;
    if (!this.props.form.getFieldValue('model')) {
      templateId = null;
    }
    const head = { ...billHead, ...this.props.form.getFieldsValue(), template_id: templateId };
    const tradeInfo = this.validateCode(head.trade_co, head.trade_custco);
    if (tradeInfo) {
      return message.error(`${tradeInfo}`);
    }
    const ownInfo = this.validateCode(head.owner_code, head.owner_custco);
    if (ownInfo) {
      return message.error(`${ownInfo}`);
    }
    const agentInfo = this.validateCode(head.agent_code, head.agent_custco);
    if (agentInfo) {
      return message.error(`${agentInfo}`);
    }
    this.props.saveBillHead({ head, ietype, loginId, tenantId }).then(
    (result) => {
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
          self.props.resetBill(self.props.billHead).then(
            (result) => {
              if (result.error) {
                message.error(result.error.message, 10);
                return reject();
              } else {
                message.info('清单已重置');
                self.props.form.resetFields();
                return resolve();
              }
            }
          );
        }).catch(() => message.error('重置失败'));
      },
      onCancel() {},
    });
  }
  handleSelectChange = (value) => {
    if (value) {
      this.props.loadTemplateFormVals(value).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          const formData = result.data.formData;
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
            split_hscode: formData.split_hscode,
            split_spl_category: formData.split_spl_category,
            split_curr: formData.split_curr,
            split_percount: formData.split_percount,
            sort_customs: formData.sort_customs,
            sort_dectotal: formData.sort_dectotal,
            sort_hscode: formData.sort_hscode,
          };
          this.props.saveBillRules({ rules, billSeqNo: this.props.billHead.bill_seq_no });
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
      this.props.lockManifest({ loginId, loginName, billSeqNo: billHead.bill_seq_no, delgNo: billHead.delg_no }).then((result) => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          message.warning('锁定成功');
        }
      });
    } else {
      const { billHead } = this.props;
      this.props.lockManifest({ loginId: null, loginName: null, billSeqNo: billHead.bill_seq_no, delgNo: billHead.delg_no }).then((result) => {
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
    this.props.showSendDeclsModal({ visible: true, delgNo: head.delg_no, agentCustCo: head.agent_custco });
  }
  handleManifestRedo = () => {
    const head = this.props.billHead;
    this.props.redoManifest(head.delg_no, head.bill_seq_no).then((result) => {
      if (result.error) {
        message.error(result.error.message, 5);
      }
    });
  }
  handleMetaLoad = () => {
    this.props.loadBillMeta(this.props.billHead.bill_seq_no);
  }
  renderOverlayMenu(editable) {
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
        <Menu.Item key="template"><Icon type="book" /> {this.msg('saveAsTemplate')}</Menu.Item>
        {editable && lockMenuItem}
        {editable && <Menu.Item key="reset">
          <a role="button" onClick={this.handleBillReset}> <Icon type="reload" /> 重置清单</a>
        </Menu.Item>}
      </Menu>);
  }
  render() {
    const { billHeadFieldsChangeTimes, ietype, form: { getFieldDecorator }, loginId, form, billHead, billBodies, billMeta, templates } = this.props;
    const { locked, lockedByOthers } = this.state;
    const declEntryMenu = (
      <Menu onClick={this.handleEntryVisit}>
        {billMeta.entries.map(bme => (<Menu.Item key={bme.pre_entry_seq_no}>
          <Icon type="file" /> {bme.entry_id || bme.pre_entry_seq_no}</Menu.Item>)
        )}
      </Menu>);
    let sendable = billMeta.entries.length > 0;
    let revertable = billMeta.entries.length > 0;
    billMeta.entries.forEach((entry) => {
      sendable = sendable && (entry.status === CMS_DECL_STATUS.reviewed.value);
      revertable = revertable && (entry.status === CMS_DECL_STATUS.proposed.value);
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
    return (
      <Layout>
        <Layout>
          <Header className="top-bar">
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.props.ietype === 'import' ? this.msg('importClearance') : this.msg('exportClearance')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Icon type="file-text" /> <NavLink to={path}>{this.msg('declManifest')}</NavLink>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {billMeta.bill_seq_no}
              </Breadcrumb.Item>
            </Breadcrumb>
            <div className="top-bar-tools">
              {locked &&
                <Tooltip title={`清单已锁定，仅限${billHead.locking_name}可进行编辑`} placement="bottom">
                  <Switch className="switch-lock" checked={locked}
                    checkedChildren={<Icon type="lock" />}
                    unCheckedChildren={<Icon type="unlock" />}
                    disabled={lockedByOthers}
                    onChange={this.handleLock} style={{ marginTop: 4 }}
                  />
                </Tooltip>}
              {editable && getFieldDecorator('model', modelProps)(<Select
                placeholder="选择可用清单模板"
                optionFilterProp="search"
                size="large"
                onChange={this.handleSelectChange}
                style={{ width: 200 }}
                allowClear
              >
                <OptGroup label="可用清单模板">
                  {templates.map(data => (<Option key={data.id} value={data.id}
                    search={`${data.id}${data.template_name}`}
                  ><Icon type="book" /> {data.template_name}</Option>)
                    )}
                </OptGroup>
              </Select>)
              }
              <Dropdown overlay={this.renderOverlayMenu(editable)}><Button size="large" icon="ellipsis" /></Dropdown>
              {editable &&
                (<Button type="primary" size="large" icon="addfile" disabled={billHeadFieldsChangeTimes > 0}
                  loading={this.state.generating} onClick={this.handleGenerateEntry}
                >{this.msg('generateEntry')}</Button>) }
              {sendable &&
                <Button type="primary" size="large" icon="mail" onClick={this.handleSendDecls}>{this.msg('sendAllPackets')}</Button>
              }
              {billMeta.entries.length > 0 &&
                <Dropdown overlay={declEntryMenu}>
                  <Button size="large"><Icon type="schedule" />已生成报关建议书<Icon type="down" /></Button>
                </Dropdown>
              }
              {revertable &&
                <Popconfirm title="确定操作?" placement="topRight" onConfirm={this.handleManifestRedo}>
                  <Tooltip title="删除已生成的报关建议书，重新修改" placement="bottomLeft">
                    <Button size="large"><Icon type="reload" /></Button>
                  </Tooltip>
                </Popconfirm>
              }
              <ButtonToggle size="large" iconOff="folder" iconOn="folder-open" onClick={this.toggle} />
            </div>
          </Header>
          <Content className={`main-content layout-min-width layout-min-width-large ${!editable ? 'readonly' : ''}`}>
            <Spin spinning={this.props.manifestSpinning}>
              <div className="page-body tabbed">
                <Tabs defaultActiveKey="header">
                  <TabPane tab="清单表头" key="header">
                    <Spin spinning={this.props.templateValLoading}>
                      <ManifestHeadPanel ietype={ietype} readonly={!editable} form={form} formData={this.state.headData} onSave={this.handleBillSave} />
                    </Spin>
                  </TabPane>
                  <TabPane tab="清单表体" key="body">
                    <ManifestBodyPanel ietype={ietype} readonly={!editable} headForm={form} data={billBodies} billSeqNo={billHead.bill_seq_no} />
                  </TabPane>
                </Tabs>
              </div>
            </Spin>
          </Content>
        </Layout>
        <Sider
          trigger={null}
          defaultCollapsed
          collapsible
          collapsed={this.state.collapsed}
          width={480}
          collapsedWidth={0}
          className="right-sider"
        >
          <div className="right-sider-panel">
            <div className="panel-header">
              <h3>附加资料</h3>
            </div>
            <SheetExtraPanel type="bill" />
          </div>
        </Sider>
        <MergeSplitModal />
        <SaveTemplateModal ietype={ietype} />
        <SendDeclsModal ietype={ietype} entries={billMeta.entries} reload={this.handleMetaLoad} />
      </Layout>
    );
  }
}
