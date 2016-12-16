import React from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Card, DatePicker, Form, InputNumber, Mention, Radio, Select, Tabs, Timeline } from 'antd';

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
    return (
      <div>
        <Card bodyStyle={{ padding: 8 }}>
          <Tabs defaultActiveKey="log">
            <TabPane tab="记录" key="log">
              <Form horizontal onSubmit={this.handleSubmit}>
                <FormItem>
                  <Mention
                    style={{ width: '100%', height: 72 }}
                    suggestions={['afc163', 'benjycui', 'yiminghe', 'jljsj33', 'dqaria', 'RaoHai']}
                    placeholder="@提及他人"
                    multiLines
                  />
                </FormItem>
                <FormItem>
                  <Button type="primary" style={{ marginRight: 8 }}>确定</Button>
                  <Button type="ghost">取消</Button>
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
      </div>
    );
  }
}
