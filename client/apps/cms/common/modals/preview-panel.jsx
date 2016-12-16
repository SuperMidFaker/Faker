import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Badge, Button, Card, Col, DatePicker, Form, InputNumber, Radio, Row, Select, Tabs, Timeline } from 'antd';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import InfoItem from 'client/components/InfoItem';
import BasicPane from './tabpanes/BasicPane';
import CustomsDeclPane from './tabpanes/CustomsDeclPane';
import CiqDeclPane from './tabpanes/CiqDeclPane';
import DutyTaxPane from './tabpanes/DutyTaxPane';
import ExpensesPane from './tabpanes/ExpensesPane';
import { hidePreviewer, setPreviewStatus, setPreviewTabkey } from 'common/reducers/cmsDelegation';

const TabPane = Tabs.TabPane;
const Option = Select.Option;
const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    visible: state.cmsDelegation.previewer.visible,
    previewer: state.cmsDelegation.previewer,
    tabKey: state.cmsDelegation.previewer.tabKey,
    delgPanel: state.cmsDelegation.delgPanel,
    ciqdecl: state.cmsDeclare.previewer.ciqdecl,
    delegateListFilter: state.cmsDelegation.delegateListFilter,
  }),
  { hidePreviewer, setPreviewStatus, setPreviewTabkey }
)
export default class PreviewPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ietype: PropTypes.oneOf(['import', 'export']),
    tenantId: PropTypes.number.isRequired,
    tabKey: PropTypes.string,
    hidePreviewer: PropTypes.func.isRequired,
    previewer: PropTypes.object.isRequired,
    ciqdecl: PropTypes.object.isRequired,
    delegateListFilter: PropTypes.object.isRequired,
    setPreviewStatus: PropTypes.func.isRequired,
    setPreviewTabkey: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  handleTabChange = (tabKey) => {
    this.props.setPreviewTabkey(tabKey);
  }
  handleClose = () => {
    this.props.hidePreviewer();
  }
  handleAccept = () => {
    this.props.setPreviewStatus({ preStatus: 'accept' });
  }
  handleMake = () => {
    this.props.setPreviewStatus({ preStatus: 'make' });
    this.props.hidePreviewer();
  }
  handleDisp = () => {
    this.props.setPreviewStatus({ preStatus: 'dispatch' });
    this.props.hidePreviewer();
  }
  handleCiqDisp = () => {
    this.props.setPreviewStatus({ preStatus: 'ciqdispatch' });
    this.props.hidePreviewer();
  }
  handleAssignAll = () => {
    this.props.setPreviewStatus({ preStatus: 'assignAll' });
    this.props.hidePreviewer();
  }
  handleDispAllCancel = () => {
    this.props.setPreviewStatus({ preStatus: 'allDispCancel' });
    this.props.hidePreviewer();
  }
  handleDispCancel = () => {
    this.props.setPreviewStatus({ preStatus: 'delgDispCancel' });
    this.props.hidePreviewer();
  }
  handleCiqDispCancel = () => {
    this.props.setPreviewStatus({ preStatus: 'ciqDispCancel' });
    this.props.hidePreviewer();
  }
  handleView = () => {
    this.props.setPreviewStatus({ preStatus: 'view' });
    this.props.hidePreviewer();
  }
  handleCiqFinish = () => {
    this.props.setPreviewStatus({ preStatus: 'ciqfinish' });
    this.props.hidePreviewer();
  }
  translateStatus(delg) {
    const status = delg.status;
    const tenantid = delg.recv_tenant_id;
    switch (status) {
      case 0:
        {
          if (tenantid === this.props.tenantId) {
            return <Badge status="default" text="待接单" />;
          } else {
            return <Badge status="default" text="待供应商接单" />;
          }
        }
      case 1:
        {
          if (tenantid === this.props.tenantId) {
            return <Badge status="default" text="已接单" />;
          } else {
            return <Badge status="default" text="供应商已接单" />;
          }
        }
      case 2:
        {
          if (tenantid === this.props.tenantId) {
            return <Badge status="warning" text="制单中" />;
          } else {
            return <Badge status="warning" text="供应商制单中" />;
          }
        }
      case 3:
        {
          if (delg.sub_status === 1) {
            return <Badge status="processing" text="部分申报" />;
          } else {
            return <Badge status="processing" text="已申报" />;
          }
        }
      case 4:
        {
          if (delg.sub_status === 1) {
            return <Badge status="success" text="部分放行" />;
          } else {
            return <Badge status="success" text="已放行" />;
          }
        }
      default: return '';
    }
  }
  tablePan() {
    const { previewer, tabKey } = this.props;
    const { delegation, files } = previewer;
    if (delegation.status === 0) {
      return (
        <Tabs type="card" activeKey={tabKey} onChange={this.handleTabChange}>
          <TabPane tab="委托详情" key="basic">
            <BasicPane delegation={delegation} files={files} />
          </TabPane>
        </Tabs>
      );
    } else if (delegation.status === 1 || delegation.status === 2) {
      if (delegation.ciq_type === 'NA') {
        return (
          <Tabs type="card" activeKey={tabKey} onChange={this.handleTabChange}>
            <TabPane tab="委托详情" key="basic">
              <BasicPane delegation={delegation} files={files} />
            </TabPane>
            <TabPane tab="报关" key="customsDecl">
              <CustomsDeclPane />
            </TabPane>
            <TabPane tab="费用" key="expenses">
              <ExpensesPane />
            </TabPane>
          </Tabs>
        );
      }
      return (
        <Tabs type="card" activeKey={tabKey} onChange={this.handleTabChange}>
          <TabPane tab="委托详情" key="basic">
            <BasicPane delegation={delegation} files={files} />
          </TabPane>
          <TabPane tab="报关" key="customsDecl">
            <CustomsDeclPane />
          </TabPane>
          <TabPane tab="报检" key="ciqDecl">
            <CiqDeclPane />
          </TabPane>
          <TabPane tab="费用" key="expenses">
            <ExpensesPane />
          </TabPane>
        </Tabs>
      );
    } else if (delegation.status === 3 || delegation.status === 4) {
      if (delegation.ciq_type === 'NA') {
        return (
          <Tabs type="card" activeKey={tabKey} onChange={this.handleTabChange}>
            <TabPane tab="委托详情" key="basic">
              <BasicPane delegation={delegation} files={files} />
            </TabPane>
            <TabPane tab="报关" key="customsDecl">
              <CustomsDeclPane />
            </TabPane>
            <TabPane tab="缴税" key="taxes">
              <DutyTaxPane />
            </TabPane>
            <TabPane tab="费用" key="expenses">
              <ExpensesPane />
            </TabPane>
          </Tabs>
        );
      }
      return (
        <Tabs type="card" activeKey={tabKey} onChange={this.handleTabChange}>
          <TabPane tab="委托详情" key="basic">
            <BasicPane delegation={delegation} files={files} />
          </TabPane>
          <TabPane tab="报关" key="customsDecl">
            <CustomsDeclPane />
          </TabPane>
          <TabPane tab="报检" key="ciqDecl">
            <CiqDeclPane />
          </TabPane>
          <TabPane tab="缴税" key="taxes">
            <DutyTaxPane />
          </TabPane>
          <TabPane tab="费用" key="expenses">
            <ExpensesPane />
          </TabPane>
        </Tabs>
      );
    }
  }
  button() {
    const { previewer, tabKey, ciqdecl, delgPanel } = this.props;
    if (tabKey === 'basic') {
      if (previewer.delegation.btkey === 'recall') {
        return (
          <PrivilegeCover module="clearance" feature={this.props.ietype} action="edit">
            <Button type="default" onClick={this.handleDispAllCancel}>
              撤回
            </Button>
          </PrivilegeCover>
        );
      } else if (previewer.delegation.btkey === 'assign') {
        return (
          <PrivilegeCover module="clearance" feature={this.props.ietype} action="edit">
            <Button type="ghost" onClick={this.handleAssignAll}>
              转包
            </Button>
          </PrivilegeCover>
        );
      }
    } else if (tabKey === 'customsDecl') {
      if (delgPanel.btkey === 'delgDispMake') {
        return (
          <PrivilegeCover module="clearance" feature={this.props.ietype} action="create">
            <div className="btn-bar">
              <Button type="primary" onClick={this.handleMake}>
                制单
              </Button>
              <span />
              <Button type="ghost" onClick={this.handleDisp}>
                指定报关单位
              </Button>
            </div>
          </PrivilegeCover>
        );
      } else if (delgPanel.btkey === 'delgRecall') {
        return (
          <PrivilegeCover module="clearance" feature={this.props.ietype} action="edit">
            <Button type="default" onClick={this.handleDispCancel}>
              撤回
            </Button>
          </PrivilegeCover>
        );
      } else if (delgPanel.btkey === 'delgRecallMake') {
        return (
          <PrivilegeCover module="clearance" feature={this.props.ietype} action="create">
            <div className="btn-bar">
              <Button type="default" onClick={this.handleDispCancel}>
                撤回
              </Button>
              <span />
              <Button type="ghost" onClick={this.handleMake}>
                制单
              </Button>
            </div>
          </PrivilegeCover>
        );
      } else if (delgPanel.btkey === 'delgMake') {
        return (
          <PrivilegeCover module="clearance" feature={this.props.ietype} action="create">
            <div className="btn-bar">
              <Button type="ghost" onClick={this.handleMake}>
                制单
              </Button>
            </div>
          </PrivilegeCover>
        );
      } else if (delgPanel.btkey === 'delgView') {
        return (
          <div className="btn-bar">
            <Button type="ghost" onClick={this.handleView}>
            查看
            </Button>
          </div>
        );
      }
    } else if (tabKey === 'ciqDecl') {
      if (ciqdecl.btkey === 'ciqDispFinish') {
        return (
          <PrivilegeCover module="clearance" feature={this.props.ietype} action="create">
            <div className="btn-bar">
              <Button type="ghost" onClick={this.handleCiqDisp}>
                指定报检单位
              </Button>
              <span />
              <Button type="primary" onClick={this.handleCiqFinish}>
                完成
              </Button>
            </div>
          </PrivilegeCover>
        );
      } else if (ciqdecl.btkey === 'ciqRecall') {
        return (
          <PrivilegeCover module="clearance" feature={this.props.ietype} action="edit">
            <Button type="default" onClick={this.handleCiqDispCancel}>
              撤回
            </Button>
          </PrivilegeCover>
        );
      } else if (ciqdecl.btkey === 'ciqRecallFinish') {
        return (
          <PrivilegeCover module="clearance" feature={this.props.ietype} action="edit">
            <div className="btn-bar">
              <Button type="default" onClick={this.handleCiqDispCancel}>
                撤回
              </Button>
              <span />
              <Button type="primary" onClick={this.handleCiqFinish}>
                完成
              </Button>
            </div>
          </PrivilegeCover>
        );
      }
    }
  }
  render() {
    const { visible, previewer } = this.props;
    const { delegation, delegateTracking } = previewer;
    const closer = (
      <button
        onClick={this.handleClose}
        aria-label="Close"
        className="ant-modal-close"
      >
        <span className="ant-modal-close-x" />
      </button>);
    return (
      <div className={`dock-panel preview-panel ${visible ? 'inside' : ''}`}>
        <div className="panel-content">
          <div className="header">
            <span className="title">{delegation.delg_no}</span>
            {this.translateStatus(delegateTracking)}
            <div className="toolbar">
              {this.button()}
            </div>
            {closer}
            <Row>
              <Col span="6">
                <InfoItem labelCol={{ span: 3 }} label="委托方"
                  field={delegation.customer_name} fieldCol={{ span: 9 }}
                />
              </Col>
              <Col span="6">
                <InfoItem labelCol={{ span: 3 }} label="提运单号"
                  field={delegation.bl_wb_no} fieldCol={{ span: 9 }}
                />
              </Col>
              <Col span="6">
                <InfoItem labelCol={{ span: 3 }} label="操作人"
                  field={delegation.customer_name} fieldCol={{ span: 9 }}
                />
              </Col>
              <Col span="6">
                <InfoItem labelCol={{ span: 3 }} label="委托日期" fieldCol={{ span: 9 }}
                  field={moment(delegateTracking.delg_time).format('YYYY.MM.DD HH:mm')}
                />
              </Col>
            </Row>
          </div>
          <div className="body with-header-summary">
            <Row gutter={16}>
              <Col sm={24} md={14} lg={14}>
                {this.tablePan()}
              </Col>
              <Col sm={24} md={10} lg={10}>
                <Card bodyStyle={{ padding: 8 }}>
                  <Tabs defaultActiveKey="certs">
                    <TabPane tab="办证" key="certs">
                      <Form horizontal onSubmit={this.handleSubmit}>
                        <FormItem>
                          <Select
                            showSearch
                            style={{ width: 200, marginRight: 8 }}
                            placeholder="选择鉴定办证类型"
                            optionFilterProp="children"
                          >
                            <Option value="mech_elec_cert">机电证</Option>
                            <Option value="zgz">重工证</Option>
                            <Option value="xkz">许可证</Option>
                            <Option value="3cjd">3C外目录鉴定</Option>
                            <Option value="m3csq">免3C申请</Option>
                            <Option value="nxjd">能效鉴定</Option>
                            <Option value="mnxsq">免能效申请</Option>
                            <Option value="xc">消磁</Option>
                          </Select>
                        </FormItem>
                        <FormItem>
                          <InputNumber min={1} max={99} placeholder="型号数量" />
                        </FormItem>
                        <FormItem>
                          <Button type="primary" style={{ marginRight: 8 }}>确定</Button>
                          <Button type="ghost">取消</Button>
                        </FormItem>
                      </Form>
                    </TabPane>
                    <TabPane tab="查验" key="inspect">
                      <Form horizontal onSubmit={this.handleSubmit}>
                        <FormItem>
                          <Select
                            showSearch
                            style={{ width: 200, marginRight: 8 }}
                            placeholder="选择报关单"
                            optionFilterProp="children"
                          >
                            <Option value="200030001234567890">200030001234567890</Option>
                            <Option value="200030001234567891">200030001234567891</Option>
                            <Option value="200030001234567892">200030001234567892</Option>
                          </Select>
                          <DatePicker
                            showTime
                            format="YYYY-MM-DD HH:mm:ss"
                            placeholder="选择查验时间"
                          />
                        </FormItem>
                        <FormItem>
                          <Radio.Group>
                            <Radio.Button value="large">海关查验</Radio.Button>
                            <Radio.Button value="default">品质查验</Radio.Button>
                            <Radio.Button value="small">动植检查验</Radio.Button>
                          </Radio.Group>
                        </FormItem>
                        <FormItem>
                          <Button type="primary" style={{ marginRight: 8 }}>确定</Button>
                          <Button type="ghost">取消</Button>
                        </FormItem>
                      </Form>
                    </TabPane>
                  </Tabs>
                </Card>
                <Timeline>
                  <Timeline.Item>缴税 2015-09-01</Timeline.Item>
                  <Timeline.Item>海关申报 2015-09-01</Timeline.Item>
                  <Timeline.Item color="red">
                    <Card bodyStyle={{ padding: 8 }}>海关查验 2015-09-01
                      <Button type="default" size="small" icon="check" />
                    </Card>
                  </Timeline.Item>
                  <Timeline.Item>创建清关委托 2015-09-01</Timeline.Item>
                </Timeline>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    );
  }
}
