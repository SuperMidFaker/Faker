import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Button, Card, Checkbox, Col, Row, Collapse, Dropdown, Form, Icon, Menu, Popover, Timeline, Tooltip, message } from 'antd';
import InfoItem from 'client/components/InfoItem';
import { loadBasicInfo, loadCustPanel, loadDeclCiqPanel, updateCertParam, exchangeBlNo } from 'common/reducers/cmsDelgInfoHub';
import { loadDeclHead, setInspect } from 'common/reducers/cmsDeclare';
import { loadPaneExp } from 'common/reducers/cmsExpense';
import { CERTS, INSPECT_STATUS } from 'common/constants';
import MainInfoCard from '../card/mainInfoCard';
import ActivityEditCard from '../card/activityEditCard';

const Panel = Collapse.Panel;

const ACTIVITY_DESC_MAP = {
  create: { text: '创建清关委托', icon: 'plus-circle-o' },
  accept: { text: '接单', icon: 'solution' },
  dispatch: { text: '分配', icon: 'export' },
  ciqdispatch: { text: '分配报检', icon: 'export' },
  manifest: { text: '制单', icon: 'copy' },
  lock: { text: '锁定', icon: 'lock' },
  unlock: { text: '解锁', icon: 'unlock' },
  declared: { text: '海关申报', icon: 'play-circle-o' },
  advance: { text: '录入代垫费用', icon: 'calculator' },
  hgcy: { text: '海关查验' },
  pzcy: { text: '品质查验' },
  djcy: { text: '动植检查验' },
  message: { text: '发送消息', icon: 'message' },
  clean: { text: '放行', icon: 'check-circle-o' },
};

@injectIntl
@connect(state => ({
  tenantId: state.account.tenantId,
  previewer: state.cmsDelgInfoHub.previewer,
  tabKey: state.cmsDelgInfoHub.tabKey,
  declHeadsPane: state.cmsDeclare.decl_heads,
}), {
  exchangeBlNo,
  loadDeclHead,
  setInspect,
  loadCustPanel,
  loadBasicInfo,
  updateCertParam,
  loadDeclCiqPanel,
  loadPaneExp,
})
@Form.create()
export default class DelegationPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    tabKey: PropTypes.string.isRequired,
  }
  state = {
    tabKey: 'message',
    filterKey: 'all',
    filterActivities: null,
  }
  handleTabChange = (tabKey) => {
    const delgNo = this.props.previewer.delegation.delg_no;
    this.setState({ tabKey });
    if (tabKey === 'inspect') {
      this.props.loadDeclHead(delgNo);
    }
  }
  handleCancel = () => {
    this.props.form.resetFields();
  }
  handleInspectSave = ({
    preEntrySeqNo, delgNo, enabled, field,
  }) => {
    this.props.setInspect({
      preEntrySeqNo, delgNo, field, enabled,
    }).then((result) => {
      if (result.error) {
        if (result.error.message === 'repeated') {
          if (enabled === 'passed') {
            message.error('查验结果重复通过');
          } else if (enabled === true) {
            message.error('重复设置查验');
          } else if (enabled === false) {
            message.error('重复删除查验结果');
          }
        } else {
          message.error(result.error.message, 5);
        }
      } else {
        message.info('保存成功', 5);
        this.props.loadBasicInfo(
          this.props.tenantId,
          this.props.previewer.delegation.delg_no,
          this.props.tabKey
        );
        if (enabled === true || enabled === false) {
          this.props.loadPaneExp(this.props.previewer.delegation.delg_no, this.props.tenantId);
        }
        if (field === 'hgcy' && this.props.tabKey === 'customsDecl') {
          this.props.loadCustPanel({
            delgNo: this.props.previewer.delegation.delg_no,
            tenantId: this.props.tenantId,
          });
        }
        if ((field === 'pzcy' || field === 'djcy') && this.props.tabKey === 'ciqDecl') {
          this.props.loadDeclCiqPanel(this.props.previewer.delegation.delg_no, this.props.tenantId);
        }
      }
    });
  }
  handleSaveCert = ({ field, value }) => {
    const certQty = value || null;
    this.props.updateCertParam(this.props.previewer.delegation.delg_no, this.props.previewer.delgDispatch.id, field, certQty).then((result) => {
      if (result.error) {
        if (result.error.message === 'repeated') {
          if (certQty === null) {
            message.error('该证已删除');
          }
        } else {
          message.error(result.error.message, 5);
        }
      } else {
        message.info('保存成功', 5);
        this.props.loadBasicInfo(
          this.props.tenantId,
          this.props.previewer.delegation.delg_no,
          this.props.tabKey
        );
      }
    });
  }
  handleBlNoExchange = ({ value }) => {
    this.props.exchangeBlNo(this.props.previewer.delegation.delg_no, value).then((result) => {
      if (result.error) {
        message.error(result.error.message, 5);
      } else {
        this.props.loadBasicInfo(
          this.props.tenantId,
          this.props.previewer.delegation.delg_no,
          this.props.tabKey
        );
      }
    });
  }
  handleFilterClick = (ev) => {
    ev.stopPropagation();
  }
  handleCheckActivies = (filterKey, checked) => {
    if (checked) {
      if (filterKey === 'all') {
        this.setState({ filterKey, filterActivities: null });
      } else if (this.state.filterKey !== '' && this.state.filterKey !== filterKey) {
        this.setState({ filterKey: 'all', filterActivities: null });
      } else {
        this.setState({
          filterKey,
          filterActivities:
            this.props.previewer.activities.filter(acty => acty.category === filterKey),
        });
      }
    } else if (filterKey === 'all') {
      this.setState({ filterKey: '', filterActivities: [] });
    } else if (this.state.filterKey === filterKey) {
      this.setState({ filterKey: '', filterActivities: [] });
    } else if (this.state.filterKey === 'all') {
      this.setState({
        filterKey: filterKey === 'ciq' ? 'operation' : 'ciq',
        filterActivities: this.props.previewer.activities.filter(acty => acty.category !== filterKey),
      });
    }
  }
  handleSave = () => {
    const { previewer } = this.props;
    const key = this.state.tabKey;
    const formVals = this.props.form.getFieldsValue();
    if (key === 'message') {

    } else if (key === 'exchange') {
      this.handleBlNoExchange({ value: formVals.bl_wb_no });
    } else if (key === 'certs') {
      if (formVals.certs) {
        this.handleSaveCert({ field: formVals.certs, value: formVals.certsNum });
      }
    } else if (key === 'inspect') {
      this.handleInspectSave({
        preEntrySeqNo: formVals.pre_entry_no,
        delgNo: previewer.delegation.delg_no,
        field: formVals.inspect_field,
        enabled: true,
      });
    }
  }
  render() {
    const { previewer } = this.props;
    const { delegation, activities } = previewer;
    const selectActivities = this.state.filterActivities || activities;
    const menu = (
      <Menu>
        <Menu.Item key="all">
          <Checkbox onChange={ev => this.handleCheckActivies('all', ev.target.checked)} checked={this.state.filterKey === 'all'}>
            选择全部
          </Checkbox>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="operation">
          <Checkbox onChange={ev => this.handleCheckActivies('operation', ev.target.checked)} checked={['all', 'operation'].indexOf(this.state.filterKey) !== -1}>
            操作记录
          </Checkbox>
        </Menu.Item>
        <Menu.Item key="ciq">
          <Checkbox onChange={ev => this.handleCheckActivies('ciq', ev.target.checked)} checked={['all', 'ciq'].indexOf(this.state.filterKey) !== -1}>
            通关事件
          </Checkbox>
        </Menu.Item>
      </Menu>
    );
    const timelineHeader = (
      <div>
        <span>操作记录</span>
        <div className="toolbar-right">
          <Dropdown overlay={menu}>
            <Button type="ghost" onClick={this.handleFilterClick}><Icon type="filter" /> ({selectActivities.length}/{activities.length})</Button>
          </Dropdown>
        </div>
      </div>
    );
    return (
      <div className="pane-content tab-pane">
        <MainInfoCard />
        <Collapse bordered={false} defaultActiveKey={['timeline']}>
          <Panel header={timelineHeader} key="timeline">
            <Timeline>
              {
                selectActivities.map((activity) => {
                  switch (activity.type) {
                    case 'exchange':
                      return (
                        <Timeline.Item dot={<Icon type="retweet" />} key={activity.id}>
                          <ActivityEditCard title="换单" createdDate={activity.oper_date} leftLabel="海运单号"
                            leftValue={delegation.swb_no} rightLabel="提货单号" rightValue={delegation.bl_wb_no}
                            onSave={this.handleBlNoExchange}
                          />
                        </Timeline.Item>);
                    case 'hgcy':
                    case 'pzcy':
                    case 'djcy': {
                      const inspect = parseInt(activity.note, 10);
                      let inspectStatusTxt;
                      if (inspect === INSPECT_STATUS.inspecting) {
                        inspectStatusTxt = '查验中';
                      } else if (inspect === INSPECT_STATUS.finish) {
                        inspectStatusTxt = '通过';
                      }
                      return (<Timeline.Item dot={<Icon type="exception" />} color="red" key={activity.id}>
                        <Card title={<span>{ACTIVITY_DESC_MAP[activity.type].text}
                          <small className="timestamp">{moment(activity.oper_date).format('YYYY-MM-DD HH:mm')}</small>
                        </span>}
                          extra={<span className="toolbar-right">
                            {inspect !== INSPECT_STATUS.finish &&
                            <Tooltip title="标记查验通过" placement="left">
                              <Button type="primary" shape="circle" size="small" icon="check" onClick={() => this.handleInspectSave({
                                preEntrySeqNo: activity.field, delgNo: delegation.delg_no, enabled: 'passed', field: activity.type,
                              })}
                              />
                            </Tooltip>
                            }
                            <Popover trigger="click" content={
                              <div>
                                <a className="mdc-text-red" onClick={() =>
                                  this.handleInspectSave({
 preEntrySeqNo: activity.field,
                                    delgNo: delegation.delg_no,
                                    enabled: false,
                                    field: activity.type,
})}
                                >
                                  删除
                                </a>
                              </div>}
                            >
                              <Button type="ghost" shape="circle" size="small" icon="ellipsis" />
                            </Popover>
                          </span>} bodyStyle={{ padding: 8 }}
                        >
                          <Row>
                            <Col span={12}>
                              <InfoItem label="统一编号" field={activity.field} />
                            </Col>
                            <Col span={12}>
                              <InfoItem label="查验状态" field={inspectStatusTxt} />
                            </Col>
                          </Row>
                        </Card>
                      </Timeline.Item>);
                    }
                    case 'cert': {
                      const certKey = activity.field;
                      const certQty = activity.note;
                      const certText = CERTS.filter(ct => ct.value === certKey)[0].text;
                      return (
                        <Timeline.Item dot={<Icon type="addfile" />} key={activity.id}>
                          <ActivityEditCard title="办证" createdDate={activity.oper_date} leftLabel="办证类别"
                            leftValue={certText} rightLabel="型号数量" rightValue={certQty}
                            onSave={this.handleSaveCert} field={certKey}
                          />
                        </Timeline.Item>
                      );
                    }
                    default: {
                      const descObj = ACTIVITY_DESC_MAP[activity.type];
                      return (<Timeline.Item dot={<Icon type={descObj.icon} />} key={activity.id}>
                        <p>{descObj.text} {moment(activity.oper_date).format('YYYY-MM-DD HH:mm')}</p>
                        <p>{activity.oper_name} {activity.oper_tenant_name}</p>
                      </Timeline.Item>);
                    }
                  }
                })
              }
            </Timeline>
          </Panel>
        </Collapse>
      </div>
    );
  }
}
