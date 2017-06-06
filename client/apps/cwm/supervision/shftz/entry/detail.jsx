import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Breadcrumb, Icon, Form, Layout, Tabs, Steps, Button, Select, Card, Col, Row, Tag, Table } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import InfoItem from 'client/components/InfoItem';
import { loadReceiveModal } from 'common/reducers/cwmReceive';
import messages from '../message.i18n';
import { format } from 'client/common/i18n/helpers';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const Option = Select.Option;
const TabPane = Tabs.TabPane;
const Step = Steps.Step;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    username: state.account.username,
    tenantName: state.account.tenantName,
    formData: state.cmsDelegation.formData,
    submitting: state.cmsDelegation.submitting,
  }),
  { loadReceiveModal }
)
@connectNav({
  depth: 3,
  moduleName: 'cwm',
})
@Form.create()
export default class SHFTZEntryDetail extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    tenantName: PropTypes.string.isRequired,
    formData: PropTypes.object.isRequired,
    submitting: PropTypes.bool.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    receivingMode: 'scan',
  }
  msg = key => formatMsg(this.props.intl, key);
  handleSave = () => {
    this.props.form.validateFields((errors) => {
      if (!errors) {

      }
    });
  }
  handleSaveBtnClick = () => {
    this.handleSave({ accepted: false });
  }
  handleCancelBtnClick = () => {
    this.context.router.goBack();
  }
  handleSaveAccept = () => {
    this.handleSave({ accepted: true });
  }
  handleReceivingModeChange = (ev) => {
    this.setState({
      receivingMode: ev.target.value,
    });
  }
  handleReceive = () => {
    this.props.loadReceiveModal();
  }
  columns = [{
    title: '备案料号',
    dataIndex: 'ftz_cargo_no',
    width: 120,
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 120,
  }, {
    title: 'HS编码',
    dataIndex: 'hscode',
    width: 120,
  }, {
    title: '中文品名',
    dataIndex: 'g_name',
    width: 150,
  }, {
    title: '规格型号',
    dataIndex: 'model',
    width: 200,
  }, {
    title: '单位',
    dataIndex: 'unit',
  }, {
    title: '数量',
    dataIndex: 'order_qty',
    render: o => (<b>{o}</b>),
  }, {
    title: '毛重',
    dataIndex: 'gross_wt',
  }, {
    title: '净重',
    dataIndex: 'net_wt',
  }, {
    title: '金额',
    dataIndex: 'amount',
  }, {
    title: '币制',
    dataIndex: 'currency',
  }, {
    title: '原产国',
    dataIndex: 'country_code',
  }]
  mockData = [{
    seq_no: '1',
    product_no: 'N04601170548',
    order_qty: 15,
    g_name: '微纤维止血胶原粉',
    sku: '默认',
    unit: '件',
    sku_pack: '单件',
    expect_pack_qty: 15,
    expect_qty: 15,
    received_pack_qty: 15,
    received_qty: 15,
  }, {
    seq_no: '2',
    product_no: 'N04601170547',
    order_qty: 1000,
    g_name: 'PTA球囊扩张导管',
    sku: '默认',
    unit: '件',
    sku_pack: '内包装',
    expect_pack_qty: 10,
    expect_qty: 1000,
    received_pack_qty: 0,
    received_qty: 0,
  }, {
    seq_no: '3',
    product_no: 'N04601170546',
    order_qty: 1000,
    g_name: '临时起搏电极导管',
    sku: '100/10/8',
    unit: '个',
    sku_pack: '内包装',
    expect_pack_qty: 10,
    expect_qty: 1000,
    received_pack_qty: 0,
    received_qty: 0,
  }, {
    seq_no: '4',
    product_no: 'N04601170546',
    order_qty: 12,
    g_name: '肾造瘘球囊扩张导管',
    sku: '1/6/8',
    unit: '个',
    expect_pack_qty: 2,
    sku_pack: '箱',
    expect_qty: 12,
    received_pack_qty: 1,
    received_qty: 6,
  }, {
    seq_no: '5',
    product_no: 'N04601170546',
    order_qty: 1,
    g_name: '输尿管镜球囊扩张导管',
    sku: '1/1/1',
    unit: '个',
    expect_pack_qty: 1,
    sku_pack: '托盘',
    expect_qty: 1,
    received_pack_qty: 0,
    received_qty: 0,
  }];

  render() {
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    return (
      <div>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              <Select
                size="large"
                defaultValue="0960"
                placeholder="选择仓库"
                style={{ width: 160 }}
                disabled
              >
                <Option value="0960">物流大道仓库</Option>
                <Option value="0961">希雅路仓库</Option>
                <Option value="0962">富特路仓库</Option>
              </Select>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              上海自贸区监管
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('ftzEntryReg')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              ASN096120170603223
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="top-bar-tools">
            <Button size="large" icon="sync" onClick={this.handlePrint} >获取状态</Button>
            <Button type="primary" size="large" icon="export" onClick={this.handlePrint} >发送备案</Button>
          </div>
        </Header>
        <Content className="main-content layout-fixed-width layout-fixed-width-lg">
          <Form layout="vertical">
            <Card bodyStyle={{ paddingBottom: 56 }}>
              <Row>
                <Col sm={24} lg={3}>
                  <InfoItem label="备案类型" field={<Tag>一二线进境</Tag>} />
                </Col>
                <Col sm={24} lg={6}>
                  <InfoItem label="经营单位" field="04601|米思米(中国)精密机械贸易" />
                </Col>
                <Col sm={24} lg={6}>
                  <InfoItem label="收货单位" field="I096120170603223-01" />
                </Col>
                <Col sm={24} lg={3}>
                  <InfoItem label="进口日期" addonBefore={<Icon type="calendar" />} field={10} editable />
                </Col>
                <Col sm={24} lg={3}>
                  <InfoItem label="进库日期" addonBefore={<Icon type="calendar" />} field={2} editable />
                </Col>
              </Row>
              <div className="card-footer">
                <Steps progressDot current={0}>
                  <Step description="待备案" />
                  <Step description="已发送" />
                  <Step description="备案完成" />
                </Steps>
              </div>
            </Card>
            <Card bodyStyle={{ padding: 0 }}>
              <Tabs defaultActiveKey="221820171000538906">
                <TabPane tab="221820171000538906" key="221820171000538906">
                  <div className="panel-header">
                    <Row>
                      <Col span="8">
                        <InfoItem size="small" field="0963I201706023631169"
                          addonBefore="入库备案号" editable
                        />
                      </Col>
                    </Row>
                  </div>
                  <Table columns={this.columns} rowSelection={rowSelection} dataSource={this.mockData} rowKey="seq_no" />
                </TabPane>
                <TabPane tab="221820171000538907" key="221820171000538907">
                  <Table columns={this.columns} rowSelection={rowSelection} dataSource={this.mockData} rowKey="seq_no" />
                </TabPane>
                <TabPane tab="221820171000538908" key="221820171000538908">
                  <Table columns={this.columns} dataSource={this.mockData} rowKey="seq_no" />
                </TabPane>
              </Tabs>
            </Card>
          </Form>
        </Content>
      </div>
    );
  }
}
