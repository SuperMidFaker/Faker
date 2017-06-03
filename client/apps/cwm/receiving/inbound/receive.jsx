import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Breadcrumb, Icon, Dropdown, Form, Radio, Layout, Menu, Button, Select, Card, Col, Row, Tag, Table, Input, Tooltip } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import Avatar from 'react-avatar';
import InfoItem from 'client/components/InfoItem';
import RowUpdater from 'client/components/rowUpdater';
import PackagePopover from './popover/packagePopover';
import ReceivingModal from './modal/receivingModal';
import { loadReceiveModal } from 'common/reducers/cwmReceive';
import messages from '../message.i18n';
import { format } from 'client/common/i18n/helpers';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

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
export default class ReceiveInbound extends Component {
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
    render: o => (<b>{o}</b>),
  }, {
    title: '主单位',
    dataIndex: 'unit',
  }, {
    title: '包装代码',
    dataIndex: 'packing_code',
    render: o => (
      <PackagePopover data={o} />
      ),
  }, {
    title: '收货包装',
    dataIndex: 'receive_pack',
    render: o => (<Tooltip title="=10主单位" placement="right"><Tag>{o}</Tag></Tooltip>),
  }, {
    title: '预期数量',
    render: (o, record) => (<span><Tooltip title="包装单位数量"><Input className="readonly" value={record.expect_pack_qty} style={{ width: 80 }} /></Tooltip>
      <Tooltip title="主单位数量"><Input value={record.expect_qty} style={{ width: 80 }} disabled /></Tooltip></span>),
  }, {
    title: '收货数量',
    render: (o, record) => {
      if (record.expect_pack_qty === record.received_pack_qty) {
        return (<span className="mdc-text-green"><Tooltip title="包装单位数量"><Input className="readonly" value={record.received_pack_qty} style={{ width: 80 }} /></Tooltip>
          <Tooltip title="主单位数量"><Input value={record.received_qty} style={{ width: 80 }} disabled /></Tooltip></span>);
      } else {
        return (<span className="mdc-text-red"><Tooltip title="包装单位数量"><Input className="readonly" value={record.received_pack_qty} style={{ width: 80 }} /></Tooltip>
          <Tooltip title="主单位数量"><Input value={record.received_qty} style={{ width: 80 }} disabled /></Tooltip></span>);
      }
    },
  }, {
    title: '操作',
    render: (o, record) => {
      if (this.state.receivingMode === 'scan' || this.state.receivingMode === 'api') {
        return (<RowUpdater onHit={this.handleReceive} label={<Icon type="eye-o" />} row={record} />);
      } else if (this.state.receivingMode === 'manual') {
        if (record.expect_qty === record.received_qty) {
          return (<RowUpdater onHit={this.handleReceive} label={<Icon type="check-circle" />} row={record} />);
        }
        return (<RowUpdater onHit={this.handleReceive} label="收货" row={record} />);
      }
    },
  }]
  mockData = [{
    seq_no: '1',
    product_no: 'N04601170548',
    order_qty: 15,
    desc_cn: '微纤维止血胶原粉',
    packing_code: '1/10/10',
    unit: '件',
    receive_pack: '单件',
    expect_pack_qty: 15,
    expect_qty: 15,
    received_pack_qty: 15,
    received_qty: 15,
  }, {
    seq_no: '2',
    product_no: 'N04601170547',
    order_qty: 1000,
    desc_cn: 'PTA球囊扩张导管',
    packing_code: '100/10/8',
    unit: '件',
    receive_pack: '内包装',
    expect_pack_qty: 10,
    expect_qty: 1000,
    received_pack_qty: 0,
    received_qty: 0,
  }, {
    seq_no: '3',
    product_no: 'N04601170546',
    order_qty: 1000,
    desc_cn: '临时起搏电极导管',
    packing_code: '100/10/8',
    unit: '个',
    receive_pack: '内包装',
    expect_pack_qty: 10,
    expect_qty: 1000,
    received_pack_qty: 0,
    received_qty: 0,
  }, {
    seq_no: '4',
    product_no: 'N04601170546',
    order_qty: 12,
    desc_cn: '肾造瘘球囊扩张导管',
    packing_code: '1/6/8',
    unit: '个',
    expect_pack_qty: 2,
    receive_pack: '箱',
    expect_qty: 12,
    received_pack_qty: 1,
    received_qty: 6,
  }, {
    seq_no: '5',
    product_no: 'N04601170546',
    order_qty: 1,
    desc_cn: '输尿管镜球囊扩张导管',
    packing_code: '1/1/1',
    unit: '个',
    expect_pack_qty: 1,
    receive_pack: '托盘',
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
    const tagMenu = (
      <Menu>
        <Menu.Item key="printTraceTag">打印追踪标签</Menu.Item>
        <Menu.Item key="exportTraceTag">导出追踪标签</Menu.Item>
        <Menu.Divider />
        <Menu.Item key="printConveyTag">打印箱/托标签</Menu.Item>
        <Menu.Item key="exportConveyTag">导出箱/托标签</Menu.Item>
        <Menu.Divider />
        <Menu.Item key="exportAllTag">导出全部标签</Menu.Item>
      </Menu>
    );
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
              {this.msg('receivingInound')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              ASN096120170603223
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="top-bar-tools">
            {(this.state.receivingMode === 'manual' || this.state.receivingMode === 'api') && <Dropdown overlay={tagMenu}>
              <Button size="large" onClick={this.handlePrint}>
                <Icon type="barcode" /> <Icon type="down" />
              </Button>
            </Dropdown>}
            {this.state.receivingMode === 'manual' && <Button type="primary" size="large" icon="printer" onClick={this.handlePrint} >打印入库请单</Button>}
            {(this.state.receivingMode === 'scan' || this.state.receivingMode === 'api') && <Button size="large" icon="printer" onClick={this.handlePrint} />}
            {this.state.receivingMode === 'scan' && <Dropdown overlay={tagMenu}>
              <Button type="primary" size="large" onClick={this.handlePrint}>
                <Icon type="barcode" />标签 <Icon type="down" />
              </Button>
            </Dropdown>}
            <RadioGroup defaultValue={this.state.receivingMode} onChange={this.handleReceivingModeChange} size="large">
              <RadioButton value="scan"><Icon type="scan" /> 扫描收货</RadioButton>
              <RadioButton value="manual"><Icon type="user" /> 人工收货</RadioButton>
              <RadioButton value="api"><Icon type="api" /> 接口收货</RadioButton>
            </RadioGroup>
            <Button size="large" type="primary" loading={submitting} onClick={this.handleSaveBtnClick} disabled>
              入库完成
            </Button>
          </div>
        </Header>
        <Content className="main-content layout-fixed-width layout-fixed-width-lg">
          <Form layout="vertical">
            <Card>
              <Row gutter={16}>
                <Col sm={24} lg={8}>
                  <InfoItem label="入库单号" field="I096120170603223-01" />
                </Col>
                <Col sm={24} lg={4}>
                  <InfoItem label="入库状态" field={<Tag color="blue">上架</Tag>} />
                </Col>
                <Col sm={24} lg={4}>
                  <InfoItem label="预计箱数" addonBefore={<Icon type="inbox" />} field={10} />
                </Col>
                <Col sm={24} lg={4}>
                  <InfoItem label="预计托盘数" addonBefore={<Icon type="appstore-o" />} field={2} />
                </Col>
                <Col sm={24} lg={4}>
                  <InfoItem type="dropdown" label="操作人员" addonBefore={<Avatar name="未分配" size={28} round />}
                    placeholder="分配操作人员" editable
                    overlay={<Menu onClick={this.handleMenuClick}>
                      <Menu.Item key={1}>仓管员</Menu.Item>
                    </Menu>}
                  />
                </Col>
              </Row>
            </Card>
            <Card bodyStyle={{ padding: 0 }}>
              <div className="toolbar">
                {this.state.receivingMode === 'scan' && <Button type="primary" ghost size="large" icon="tablet">推送任务</Button>}
                {this.state.receivingMode === 'manual' && <Button type="primary" ghost size="large">收货确认</Button>}
                {this.state.receivingMode === 'api' && <Button type="primary" ghost size="large" icon="sync">同步数据</Button>}
                <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
                  <h3>已选中{this.state.selectedRowKeys.length}项</h3><Button>分批收货</Button>
                </div>
              </div>
              <Table columns={this.columns} rowSelection={rowSelection} dataSource={this.mockData} rowKey="seq_no" />
              <ReceivingModal receivingMode={this.state.receivingMode} />
            </Card>
          </Form>
        </Content>
      </div>
    );
  }
}
