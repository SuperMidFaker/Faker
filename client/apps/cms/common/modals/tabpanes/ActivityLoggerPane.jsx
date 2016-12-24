import React from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Card, Checkbox, DatePicker, Dropdown, Form, Icon, Input, InputNumber, Mention, Menu, Radio, Select, Tabs, Timeline } from 'antd';

const Option = Select.Option;
const FormItem = Form.Item;
const TabPane = Tabs.TabPane;

@injectIntl
@connect(
  state => ({
    previewer: state.cmsDelegation.previewer,
  })
)
export default class ActivityLoggerPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  render() {
    const menu = (
      <Menu>
        <Menu.Item key="all"><Checkbox >全选</Checkbox></Menu.Item>
        <Menu.Item key="customs"><Checkbox >待处理项</Checkbox></Menu.Item>
        <Menu.Item key="ciq"><Checkbox >事件</Checkbox></Menu.Item>
      </Menu>
    );
    return (
      <div>
        <Card bodyStyle={{ padding: 8 }}>
          <Tabs defaultActiveKey="log">
            <TabPane tab="备注" key="log">
              <Form horizontal onSubmit={this.handleSubmit}>
                <FormItem>
                  <Mention
                    style={{ width: '100%', height: 72 }}
                    suggestions={['afc163', 'benjycui', 'yiminghe', 'jljsj33', 'dqaria', 'RaoHai']}
                    placeholder="@提及他人"
                    multiLines
                  />
                </FormItem>
              </Form>
            </TabPane>
            <TabPane tab="换单" key="exchange">
              <Form horizontal onSubmit={this.handleSubmit}>
                <FormItem>
                  <Input placeholder="海运单号" />
                </FormItem>
                <FormItem>
                  <Input placeholder="提单号" />
                </FormItem>
              </Form>
            </TabPane>
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

                </FormItem>
                <FormItem>
                  <Radio.Group>
                    <Radio.Button value="large">海关查验</Radio.Button>
                    <Radio.Button value="default">品质查验</Radio.Button>
                    <Radio.Button value="small">动植检查验</Radio.Button>
                  </Radio.Group>
                </FormItem>
              </Form>
            </TabPane>
          </Tabs>
          <div className="toolbar-left">
            <Button type="primary" disabled>确定</Button>
            <Button type="ghost">取消</Button>
          </div>
          <div className="toolbar-right">
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              placeholder="选择时间"
            />
          </div>
        </Card>
        <section className="timeline">
          <h3>
            <div className="toolbar-right">
              <Dropdown overlay={menu}>
                <Button type="ghost">
                  <Icon type="filter" />
                </Button>
              </Dropdown>
            </div>
            动态
          </h3>
          <Timeline>
            <Timeline.Item dot={<Icon type="check-circle-o" />} color="green">放行 2015-09-01</Timeline.Item>
            <Timeline.Item dot={<Icon type="pay-circle-o" />}>缴税 2015-09-01</Timeline.Item>
            <Timeline.Item dot={<Icon type="message" />}>发送消息 2015-09-01</Timeline.Item>
            <Timeline.Item dot={<Icon type="addfile" />}>办证 2015-09-01</Timeline.Item>
            <Timeline.Item dot={<Icon type="pause-circle-o" />} color="red">
              <Card bodyStyle={{ padding: 16 }}>
                海关查验 2015-09-01
                <div className="toolbar-right">
                  <Button type="primary" shape="circle" size="small" icon="check" />
                  <Button type="ghost" shape="circle" size="small" icon="ellipsis" />
                </div>
              </Card>
            </Timeline.Item>
            <Timeline.Item dot={<Icon type="calculator" />}>录入代垫费用 2015-09-01</Timeline.Item>
            <Timeline.Item dot={<Icon type="play-circle-o" />}>海关申报 2015-09-01</Timeline.Item>
            <Timeline.Item dot={<Icon type="pause-circle-o" />} color="green">
              <Card bodyStyle={{ padding: 16 }}>
                品质查验 2015-09-01
                <div className="toolbar-right">
                  <Button size="small" shape="circle" icon="check" disabled />
                  <Button type="ghost" shape="circle" size="small" icon="ellipsis" />
                </div>
              </Card>
            </Timeline.Item>
            <Timeline.Item dot={<Icon type="copy" />}>制单 2015-09-01</Timeline.Item>
            <Timeline.Item dot={<Icon type="retweet" />}>
              <Card bodyStyle={{ padding: 16 }}>
                换单 2015-09-01
                <div className="toolbar-right">
                  <Button type="ghost" shape="circle" size="small" icon="ellipsis" />
                </div>
              </Card>
            </Timeline.Item>
            <Timeline.Item dot={<Icon type="solution" />}>接单 2015-09-01</Timeline.Item>
            <Timeline.Item dot={<Icon type="plus-circle-o" />} >
              创建清关委托 2015-09-01
            </Timeline.Item>
          </Timeline>
        </section>
      </div>
    );
  }
}
