import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Breadcrumb, Icon, Form, Layout, Menu, Popconfirm, Steps, Button, Select, Card, Col, Row, Tag, Table, Input, Tooltip } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import Avatar from 'react-avatar';
import InfoItem from 'client/components/InfoItem';
import RowUpdater from 'client/components/rowUpdater';
import AllocatingModal from './modal/allocatingModal';
import { loadReceiveModal } from 'common/reducers/cwmReceive';
import messages from '../message.i18n';
import { format } from 'client/common/i18n/helpers';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const Option = Select.Option;
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
export default class OutboundAllocate extends Component {
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
    title: '序号',
    dataIndex: 'seq_no',
    width: 50,
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 120,
  }, {
    title: '中文品名',
    dataIndex: 'desc_cn',
    width: 200,
  }, {
    title: '订单数量',
    dataIndex: 'order_qty',
    width: 120,
    render: o => (<b>{o}</b>),
  }, {
    title: '主单位',
    dataIndex: 'unit',
    width: 100,
  }, {
    title: 'SKU',
    dataIndex: 'sku',
    width: 200,
    render: (o) => {
      if (o) {
        return <Button>{o}</Button>;
      }
    },
  }, {
    title: '分配规则',
    dataIndex: 'allocate_rule',
    width: 200,
    render: (o) => {
      if (o) {
        return <Button>{o}</Button>;
      }
    },
  }, {
    title: '库位',
    dataIndex: 'location',
    width: 200,
    render: (o) => {
      if (o) {
        return <Tag>{o}</Tag>;
      }
    },
  }, {
    title: '分配数量',
    width: 200,
    render: (o, record) => (<span><Tooltip title="包装单位数量"><Input className="readonly" value={record.expect_pack_qty} style={{ width: 80 }} /></Tooltip>
      <Tooltip title="主单位数量"><Input value={record.expect_qty} style={{ width: 80 }} disabled /></Tooltip></span>),
  }, {
    title: '分配异常',
    dataIndex: 'allocate_exception',
  }, {
    title: '操作',
    render: (o, record) => (<RowUpdater onHit={this.handleReceive} label="指定分配" row={record} />),
  }]
  mockData = [{
    id: 1,
    seq_no: '1',
    product_no: 'N04601170548',
    order_qty: 15,
    desc_cn: '微纤维止血胶原粉',
    sku: 'N04601170548',
    allocate_rule: 'FIFO',
    unit: '件',
    sku_pack: '单件',
    expect_pack_qty: 15,
    expect_qty: 15,
    received_pack_qty: 15,
    received_qty: 15,
    children: [{
      id: 2,
      location: 'P1CA0101',
      expect_pack_qty: 10,
      expect_qty: 10,
      received_pack_qty: 10,
      received_qty: 10,
    }, {
      id: 3,
      location: 'P1CA0102',
      expect_pack_qty: 5,
      expect_qty: 5,
      received_pack_qty: 5,
      received_qty: 5,
    }],
  }, {
    id: 4,
    seq_no: '2',
    product_no: 'N04601170547',
    order_qty: 1000,
    desc_cn: 'PTA球囊扩张导管',
    sku: 'N04601170547',
    allocate_rule: 'FIFO',
    unit: '件',
    location: 'P1CA0101',
    expect_pack_qty: 10,
    expect_qty: 1000,
    received_pack_qty: 0,
    received_qty: 0,
  }, {
    id: 5,
    seq_no: '3',
    product_no: 'SBMG-00859',
    order_qty: 1000,
    desc_cn: '临时起搏电极导管',
    sku: 'RS2A03A0AL0W00',
    allocate_rule: 'FIFO',
    unit: '个',
    location: 'P1CA0101',
    expect_pack_qty: 10,
    expect_qty: 1000,
    received_pack_qty: 0,
    received_qty: 0,
  }, {
    id: 6,
    seq_no: '4',
    product_no: 'SBME-00787',
    order_qty: 12,
    desc_cn: '肾造瘘球囊扩张导管',
    sku: '109R0612D401',
    allocate_rule: 'FIFO',
    unit: '个',
    expect_pack_qty: 2,
    location: 'P1CA0101',
    expect_qty: 12,
    received_pack_qty: 1,
    received_qty: 6,
  }, {
    id: 7,
    seq_no: '5',
    product_no: 'SBMJ-00199',
    order_qty: 1,
    desc_cn: '输尿管镜球囊扩张导管',
    sku: '9GV0912P1G03',
    allocate_rule: 'FIFO',
    unit: '个',
    expect_pack_qty: 1,
    location: 'P1CA0101',
    expect_qty: 1,
    received_pack_qty: 0,
    received_qty: 0,
  }];

  render() {
    const { submitting } = this.props;
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
              {this.msg('outboundAllocating')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              SO096120170603223
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="top-bar-tools">
            <Button size="large" icon="rocket" onClick={this.handlePrint} >
              自动分配
            </Button>
          </div>
        </Header>
        <Content className="main-content">
          <Form layout="vertical">
            <Card bodyStyle={{ paddingBottom: 56 }}>
              <Row>
                <Col sm={24} lg={6}>
                  <InfoItem label="货主" field="04601|米思米(中国)精密机械贸易" />
                </Col>
                <Col sm={24} lg={6}>
                  <InfoItem label="入库单号" field="I096120170603223-01" />
                </Col>
                <Col sm={24} lg={3}>
                  <InfoItem label="预计箱数" addonBefore={<Icon type="inbox" />} field={10} editable />
                </Col>
                <Col sm={24} lg={3}>
                  <InfoItem label="预计托盘数" addonBefore={<Icon type="appstore-o" />} field={2} editable />
                </Col>
                <Col sm={24} lg={6}>
                  <InfoItem type="dropdown" label="操作人员" addonBefore={<Avatar name="未分配" size={28} round />}
                    placeholder="分配操作人员" editable
                    overlay={<Menu onClick={this.handleMenuClick}>
                      <Menu.Item key={1}>仓管员</Menu.Item>
                    </Menu>}
                  />
                </Col>
              </Row>
              <div className="card-footer">
                <Steps progressDot current={1}>
                  <Step description="创建出库" />
                  <Step description="分配" />
                  <Step description="拣货" />
                  <Step description="装箱复核" />
                  <Step description="发货" />
                  <Step description="出库完成" />
                </Steps>
              </div>
            </Card>
            <Card bodyStyle={{ padding: 0 }}>
              <div className="toolbar">
                <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
                  <h3>已选中{this.state.selectedRowKeys.length}项</h3><Button>分批收货</Button>
                </div>
                <div className="toolbar-right">
                  {this.state.receivingMode === 'scan' && <Button type="primary" ghost icon="tablet">推送任务</Button>}
                  {this.state.receivingMode === 'manual' &&
                  <Popconfirm title="确定此次入库操作已完成?" okText="确认" cancelText="取消">
                    <Button type="primary" ghost icon="check" loading={submitting} onClick={this.handleSaveBtnClick}>
                      入库完成
                    </Button>
                  </Popconfirm>
                  }
                  {this.state.receivingMode === 'api' && <Button type="primary" ghost icon="sync">同步数据</Button>}
                </div>
              </div>
              <Table columns={this.columns} rowSelection={rowSelection} indentSize={0} dataSource={this.mockData} rowKey="id" />
              <AllocatingModal receivingMode={this.state.receivingMode} />
            </Card>
          </Form>
        </Content>
      </div>
    );
  }
}
