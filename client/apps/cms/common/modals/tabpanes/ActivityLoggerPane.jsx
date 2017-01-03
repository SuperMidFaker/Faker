import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Card, Checkbox, Col, Row, Collapse, DatePicker, Dropdown, Form, Icon,
  Input, InputNumber, Mention, Menu, Popover, Radio, Select, Tabs, Timeline, Tooltip, message } from 'antd';
import InfoItem from 'client/components/InfoItem';
import { updateBlNo, loadCustPanel } from 'common/reducers/cmsDelegation';
import { loadDeclHead, setInspect } from 'common/reducers/cmsDeclare';

const Option = Select.Option;
const FormItem = Form.Item;
const TabPane = Tabs.TabPane;
const Panel = Collapse.Panel;
const formItemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 21 },
};

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    previewer: state.cmsDelegation.previewer,
    declHeadsPane: state.cmsDeclare.declHeadsPane,
  }), {
    updateBlNo, loadDeclHead, setInspect, loadCustPanel,
  }
)
@Form.create()
export default class ActivityLoggerPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  state = {
    tabKey: 'log',
  }
  handleTabChange = (tabKey) => {
    const delgNo = this.props.previewer.delgNo;
    this.setState({ tabKey });
    if (tabKey === 'inspect') {
      this.props.loadDeclHead(delgNo);
    }
  }
  handleCancel = () => {
    this.props.form.resetFields();
  }
  handleSave = () => {
    const { previewer } = this.props;
    const key = this.state.tabKey;
    const val = this.props.form.getFieldsValue();
    // console.log('val', val);
    if (key === 'log') {

    } else if (key === 'exchange') {
      this.props.updateBlNo(previewer.delgNo, val.bl_wb_no);
    } else if (key === 'certs') {
      if (val.certs) {

      }
    } else if (key === 'inspect') {
      this.props.setInspect(val.billNo, val.inspect, 1).then((result) => {
        if (result.error) {
          message.error(result.error.message, 5);
        } else if (this.props.previewer.tabKey === 'customsDecl') {
          this.props.loadCustPanel({
            delgNo: previewer.delgNo,
            tenantId: this.props.tenantId,
          });
        }
      });
    }
  }
  render() {
    const { form: { getFieldDecorator }, previewer, declHeadsPane } = this.props;
    const { delegation, delgDispatch } = previewer;
    const menu = (
      <Menu>
        <Menu.Item key="all"><Checkbox >选择全部</Checkbox></Menu.Item>
        <Menu.Divider />
        <Menu.Item key="customs"><Checkbox >操作事件</Checkbox></Menu.Item>
        <Menu.Item key="ciq"><Checkbox >通关事件</Checkbox></Menu.Item>
      </Menu>
    );
    const timelineHeader = (
      <div>
        <span>动态</span>
        <div className="toolbar-right">
          <Dropdown overlay={menu}>
            <Button type="ghost"><Icon type="filter" /> (3/3)</Button>
          </Dropdown>
        </div>
      </div>
    );
    return (
      <div className="activity-wrapper">
        <Card bodyStyle={{ padding: 0 }}>
          <div className="card-body-wrapper">
            <Tabs activeKey={this.state.tabKey} onChange={this.handleTabChange}>
              <TabPane tab={<span><Icon type="message" />备注</span>} key="log">
                <Form horizontal>
                  <FormItem>
                    {getFieldDecorator('remarks',
                    )(<Mention
                      style={{ width: '100%', height: 72 }}
                      suggestions={['afc163', 'benjycui', 'yiminghe', 'jljsj33', 'dqaria', 'RaoHai']}
                      placeholder="@提及他人"
                      multiLines
                    />)}
                  </FormItem>
                </Form>
              </TabPane>
              {delegation.claim_do_awb === 1 &&
                <TabPane tab={<span><Icon type="retweet" />换单</span>} key="exchange">
                  <Form horizontal>
                    <FormItem label="海运单号" {...formItemLayout}>
                      <Input value={delegation.swb_no} readOnly />
                    </FormItem>
                    <FormItem label="提单号" {...formItemLayout}>
                      {getFieldDecorator('bl_wb_no', { initialValue: delegation.bl_wb_no }
                    )(<Input placeholder="提单号" />
                    )}
                    </FormItem>
                  </Form>
                </TabPane>
              }
              <TabPane tab={<span><Icon type="addfile" />办证</span>} key="certs">
                <Form horizontal>
                  <FormItem>
                    {getFieldDecorator('certs',
                    )(<Select
                      showSearch
                      style={{ width: 200, marginRight: 8 }}
                      placeholder="选择鉴定办证类型"
                      optionFilterProp="children"
                    >
                      <Option value="jdz">机电证</Option>
                      <Option value="zgz">重工证</Option>
                      <Option value="xkz">许可证</Option>
                      <Option value="3cmlwjd">3C目录外鉴定</Option>
                      <Option value="m3csq">免3C申请</Option>
                      <Option value="nxjd">能效鉴定</Option>
                      <Option value="mnxsq">免能效申请</Option>
                      <Option value="xc">消磁</Option>
                    </Select>)}
                  </FormItem>
                  <FormItem>
                    { getFieldDecorator('certsNum',
                    )(<InputNumber min={1} max={99} placeholder="型号数量" />)}
                  </FormItem>
                </Form>
              </TabPane>
              { delgDispatch.status > 1 &&
                <TabPane tab={<span><Icon type="exception" />查验</span>} key="inspect">
                  <Form horizontal>
                    <FormItem>
                      { getFieldDecorator('billNo',
                      )(<Select
                        showSearch
                        style={{ width: 200, marginRight: 8 }}
                        placeholder="选择报关单"
                        optionFilterProp="children"
                      >
                        {
                          declHeadsPane.map(dh =>
                            <Option value={dh.value}>{dh.text}</Option>
                          )
                        }
                      </Select>)}
                    </FormItem>
                    <FormItem>
                      { getFieldDecorator('inspect',
                      )(<Radio.Group>
                        <Radio.Button value="customs_inspect">海关查验</Radio.Button>
                        <Radio.Button value="ciq_quality_inspect">品质查验</Radio.Button>
                        <Radio.Button value="ciq_ap_inspect">动植检查验</Radio.Button>
                      </Radio.Group>)}
                    </FormItem>
                  </Form>
                </TabPane>
              }
            </Tabs>
          </div>
          <div className="card-footer">
            <div className="toolbar-left">
              <Button type="primary" onClick={this.handleSave}>确定</Button>
              <Button type="ghost" onClick={this.handleCancel}>取消</Button>
            </div>
            <div className="toolbar-right">
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm"
                placeholder="选择时间"
              />
            </div>
          </div>
        </Card>
        <Collapse bordered={false} defaultActiveKey={['timeline']}>
          <Panel header={timelineHeader} key="timeline">
            <Timeline>
              <Timeline.Item dot={<Icon type="check-circle-o" />} color="green">放行 2015-09-01</Timeline.Item>
              <Timeline.Item dot={<Icon type="pay-circle-o" />}>缴税 2015-09-01</Timeline.Item>
              <Timeline.Item dot={<Icon type="message" />}>发送消息 2015-09-01</Timeline.Item>
              <Timeline.Item dot={<Icon type="addfile" />}>
                <Card title={<span>办证 <small className="timestamp">2015-09-01</small></span>} extra={
                  <Popover
                    content={<div><a onClick={this.hide}>修改</a><span className="ant-divider" /><a className="mdc-text-red" onClick={this.hide}>删除</a></div>}
                    trigger="click"
                  >
                    <Button type="ghost" shape="circle" size="small" icon="ellipsis" />
                  </Popover>} bodyStyle={{ padding: 8 }}
                >
                  <Row>
                    <Col span={12}>
                      <InfoItem label="办证类别" field="机电证" />
                    </Col>
                    <Col span={12}>
                      <InfoItem label="型号数量" field="5" />
                    </Col>
                  </Row>
                </Card>
              </Timeline.Item>
              <Timeline.Item dot={<Icon type="exception" />} color="red">
                <Card title={<span>海关查验 <small className="timestamp">2015-09-01</small></span>} extra={<span className="toolbar-right">
                  <Tooltip title="标记查验通过" placement="left">
                    <Button type="primary" shape="circle" size="small" icon="check" />
                  </Tooltip>
                  <Popover
                    content={<div><a className="mdc-text-red" onClick={this.hide}>删除</a></div>}
                    trigger="click"
                  >
                    <Button type="ghost" shape="circle" size="small" icon="ellipsis" />
                  </Popover></span>} bodyStyle={{ padding: 8 }}
                >
                  <Row>
                    <Col span={12}>
                      <InfoItem label="查验状态" field="查验中" />
                    </Col>
                  </Row>
                </Card>
              </Timeline.Item>
              <Timeline.Item dot={<Icon type="calculator" />}>录入代垫费用 2015-09-01</Timeline.Item>
              <Timeline.Item dot={<Icon type="play-circle-o" />}>海关申报 2015-09-01</Timeline.Item>
              <Timeline.Item dot={<Icon type="exception" />} color="red">
                <Card title={<span>品质查验 <small className="timestamp">2015-09-01</small></span>} extra={<span className="toolbar-right">
                  <Popover
                    content={<div><a className="mdc-text-red" onClick={this.hide}>删除</a></div>}
                    trigger="click"
                  >
                    <Button type="ghost" shape="circle" size="small" icon="ellipsis" />
                  </Popover></span>} bodyStyle={{ padding: 8 }}
                >
                  <Row>
                    <Col span={12}>
                      <InfoItem label="查验状态" field="已通过" />
                    </Col>
                  </Row>
                </Card>
              </Timeline.Item>
              <Timeline.Item dot={<Icon type="copy" />}>制单 2015-09-01</Timeline.Item>
              <Timeline.Item dot={<Icon type="retweet" />}>
                <Card title={<span>换单 <small className="timestamp">2015-09-01</small></span>} extra={
                  <Popover
                    content={<div><a onClick={this.hide}>修改</a><span className="ant-divider" /><a className="mdc-text-red" onClick={this.hide}>删除</a></div>}
                    trigger="click"
                  >
                    <Button type="ghost" shape="circle" size="small" icon="ellipsis" />
                  </Popover>} bodyStyle={{ padding: 8 }}
                >
                  <Row>
                    <Col span={12}>
                      <InfoItem label="海运单号" field="1243645592455" />
                    </Col>
                    <Col span={12}>
                      <InfoItem label="提单号" field="YMLUN244556334*09" />
                    </Col>
                  </Row>
                </Card>
              </Timeline.Item>
              <Timeline.Item dot={<Icon type="solution" />}>接单 2015-09-01</Timeline.Item>
              <Timeline.Item dot={<Icon type="plus-circle-o" />} >
                创建清关委托 2015-09-01
              </Timeline.Item>
            </Timeline>
          </Panel>
        </Collapse>
      </div>
    );
  }
}
