import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Breadcrumb, Icon, Layout, Tabs, Steps, Button, Card, Col, Row, Tooltip, Radio, Modal, Form, Input,
  Table, Tag, Select, Dropdown, Menu } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import InfoItem from 'client/components/InfoItem';
import { Logixon } from 'client/components/FontIcon';
import OrderDetailsPane from './tabpane/orderDetailsPane';
import PickingDetailsPane from './tabpane/pickingDetailsPane';
import PackingDetailsPane from './tabpane/packingDetailsPane';
import ShippingDetailsPane from './tabpane/shippingDetailsPane';
import { loadOutboundHead, updateOutboundMode, readWaybillLogo, loadCourierNo } from 'common/reducers/cwmOutbound';
import PrintPickList from './billsPrint/printPIckList';
import PrintShippingList from './billsPrint/printShippingList';
import PrintShippingConfirm from './billsPrint/printShippingConfirm';
import { CWM_OUTBOUND_STATUS, CWM_SO_BONDED_REGTYPES, CWM_SHFTZ_REG_STATUS } from 'common/constants';
import messages from '../message.i18n';
import { format } from 'client/common/i18n/helpers';
import { WaybillDef } from './billsPrint/docDef';
import Cascader from 'client/components/RegionCascader';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const Step = Steps.Step;
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const Option = Select.Option;

const EXPRESS_TYPES = [
  { text: '顺丰标快', value: '1' },
  { text: '顺丰特惠', value: '2' },
  { text: '顺丰次晨', value: '5' },
  { text: '顺丰即日', value: '6' },
  { text: '重货快运', value: '18' },
  { text: '物流普运', value: '13' },
];

const PAY_METHODS = [
  { text: '寄付月结', value: '1' },
  { text: '到付', value: '2' },
  { text: '第三方付', value: '3' },
];

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    username: state.account.username,
    defaultWhse: state.cwmContext.defaultWhse,
    outboundHead: state.cwmOutbound.outboundFormHead,
    reload: state.cwmOutbound.outboundReload,
    waybill: state.cwmOutbound.waybill,
    outboundProducts: state.cwmOutbound.outboundProducts,
  }),
  { loadOutboundHead, updateOutboundMode, readWaybillLogo, loadCourierNo }
)
@connectNav({
  depth: 3,
  moduleName: 'cwm',
})
export default class OutboundDetail extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    updateOutboundMode: PropTypes.func.isRequired,
    outboundProducts: PropTypes.arrayOf(PropTypes.shape({ seq_no: PropTypes.string.isRequired })),
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }

// 第一单：顺丰标快--寄付月结--保价；
// 第二单：顺丰特惠--到付--签回单；
// 第三单：顺丰次晨--第三方付--代收货款；
// 第四单：顺丰即日--寄付月结--子母件；
// 第五单：重货快运--寄付月结；
// 第六单：物流普运--寄付月结
  state = {
    allocated: true,
    pushedTask: false,
    printedPickingList: false,
    picking: false,
    picked: false,
    tabKey: 'orderDetails',
    expressModalvisible: false,
    expressNum: 0,


    phone: '15757129719',
    address: '物流大道浦东物流股份有限公司',
    contact: '徐天龙',
    province: '上海市',
    city: '市辖区',
    district: '浦东新区',
    street: '',

    express_type: '13',
    pay_method: '1',
    insure: 0,
  }
  componentWillMount() {
    this.props.loadOutboundHead(this.props.params.outboundNo);
    this.props.readWaybillLogo();
  }
  componentDidMount() {
    let script;
    if (!document.getElementById('pdfmake-min')) {
      script = document.createElement('script');
      script.id = 'pdfmake-min';
      script.src = `${__CDN__}/assets/pdfmake/pdfmake.min.js`;
      script.async = true;
      document.body.appendChild(script);
    }
    if (!document.getElementById('pdfmake-vfsfont')) {
      script = document.createElement('script');
      script.id = 'pdfmake-vfsfont';
      script.src = `${__CDN__}/assets/pdfmake/vfs_fonts.js`;
      script.async = true;
      document.body.appendChild(script);
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.reload) {
      this.props.loadOutboundHead(this.props.params.outboundNo);
    }
    const { outboundHead } = nextProps;
    const courierNo = outboundHead.courier_no ? outboundHead.courier_no.split(',') : [];
    this.setState({ expressNum: courierNo.length });
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
  handleAutoAllocate = () => {
    this.setState({
      allocated: true,
      currentStep: 1,
    });
  }
  handleUndoAllocate = () => {
    this.setState({
      allocated: false,
      currentStep: 0,
      printedPickingList: false,
    });
  }
  handleShippingModeChange = (ev) => {
    this.props.updateOutboundMode(this.props.params.outboundNo, ev.target.value);
  }
  handlePushTask = () => {
    this.setState({
      pushedTask: true,
      currentStep: 2,
      picking: true,
    });
  }
  handleWithdrawTask = () => {
    this.setState({
      pushedTask: false,
      currentStep: 1,
      picking: false,
    });
  }
  handleWaybillPrint = (courierNo, courierNoSon, seq) => {
    const { outboundHead, outboundProducts } = this.props;
    const expressType = EXPRESS_TYPES.find(item => item.value === this.state.express_type).text;
    const payMethod = PAY_METHODS.find(item => item.value === this.state.pay_method).text;
    const whseInfo = {
      phone: this.state.phone,
      address: this.state.address,
      contact: this.state.contact,
      province: this.state.province,
      city: this.state.city,
      district: this.state.district,
      street: this.state.street,

      express_type: expressType,
      pay_method: payMethod,
      return_tracking_no: '',
    };
    this.setState({
      printedPickingList: true,
    });
    const { expressNum } = this.state;
    // podWaybillDef
    // const docDefinition = podWaybillDef({
    //   ...this.props.waybill,
    //   courierNo,
    //   courierNoSon,
    //   expressNum,
    //   seq,
    //   outboundHead: {...outboundHead, origincode: '021'},
    //   whseInfo,
    //   productName: `${outboundProducts[0] ? outboundProducts[0].name : ''} ${outboundHead.total_qty}`
    // });
    const docDefinition = WaybillDef({
      ...this.props.waybill,
      courierNo,
      courierNoSon,
      expressNum: Number(expressNum),
      seq,
      outboundHead: { ...outboundHead, origincode: '021' },
      whseInfo,
      productName: `${outboundProducts[0] ? outboundProducts[0].name : ''} ${outboundHead.total_qty}`,
    });
    window.pdfMake.fonts = {
      selfFont: {
        normal: 'msyh.ttf',
        bold: 'msyh.ttf',
        italics: 'frutigel.ttf',
      },
    };
    window.pdfMake.createPdf(docDefinition).open();
  }
  handleConfirmPicked = () => {
    this.setState({
      picked: true,
      currentStep: 2,
    });
  }
  handleTabChange = (tabKey) => {
    this.setState({
      tabKey,
    });
  }
  handleRegPage = () => {
    this.context.router.push(`/cwm/supervision/shftz/release/${this.props.outboundHead.so_no}`);
  }
  showExpressModal = () => {
    this.setState({ expressModalvisible: true });
  }
  loadCourierNo = () => {
    const { outboundHead, outboundProducts } = this.props;
    const expressInfo = {
      phone: this.state.phone,
      address: this.state.address,
      contact: this.state.contact,
      province: this.state.province,
      city: this.state.city,
      district: this.state.district,
      street: this.state.street,
      whse_name: this.props.defaultWhse.name,
      express_type: this.state.express_type,
      pay_method: this.state.pay_method,
      productName: `${outboundProducts[0] ? outboundProducts[0].name : ''} ${outboundHead.total_qty}`,
    };
    this.props.loadCourierNo({
      soNo: this.props.outboundHead.so_no,
      outboundNo: this.props.params.outboundNo,
      tenantId: this.props.tenantId,
      expressNum: Number(this.state.expressNum),
      expressInfo,
    }).then(() => {
      this.props.loadOutboundHead(this.props.params.outboundNo);
    });
  }
  handleRegionChange = (value) => {
    this.setState({
      province: value.province,
      city: value.city,
      district: value.district,
      street: value.street,
    });
  }
  render() {
    const { defaultWhse, outboundHead } = this.props;
    console.log(defaultWhse);
    const outbStatus = Object.keys(CWM_OUTBOUND_STATUS).filter(
      cis => CWM_OUTBOUND_STATUS[cis].value === outboundHead.status
    )[0];
    const regtype = CWM_SO_BONDED_REGTYPES.filter(sbr => sbr.value === outboundHead.bonded_outtype)[0];
    const regStatus = CWM_SHFTZ_REG_STATUS.filter(status => status.value === outboundHead.reg_status)[0];
    const outboundStep = outbStatus ? CWM_OUTBOUND_STATUS[outbStatus].step : 0;
    const courierNo = outboundHead.courier_no ? outboundHead.courier_no.split(',') : [];
    const dataSource = courierNo.map((item, index) => {
      if (index === 0) {
        return {
          courier_no: item,
        };
      } else {
        return {
          courier_no: item,
        };
      }
    });
    const columns = [{
      width: 180,
      dataIndex: 'courier_no',
      render: (col, row, index) => {
        if (index === 0) {
          return <Tooltip title="母单号"><strong>{col}</strong></Tooltip>;
        }
        return <Tooltip title="子单号">{col}</Tooltip>;
      },
    }, {
      width: 80,
      render: (col, row, index) => (<a onClick={() => this.handleWaybillPrint(courierNo[0], row.courier_no, index + 1)}><Icon type="printer" /></a>),
    }];
    const { province, city, district, street } = this.state;
    const regionValues = [province, city, district, street];
    const printMenu = (
      <Menu>
        <Menu.Item>
          <PrintPickList outboundNo={this.props.params.outboundNo} />
        </Menu.Item>
        <Menu.Item>
          <PrintShippingList outboundNo={this.props.params.outboundNo} />
        </Menu.Item>
        <Menu.Item>
          <PrintShippingConfirm outboundNo={this.props.params.outboundNo} />
        </Menu.Item>
      </Menu>
    );
    return (
      <div>
        <Header className="page-header">
          <Breadcrumb>
            <Breadcrumb.Item>
              {defaultWhse.name}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('shippingOutbound')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.props.params.outboundNo}
            </Breadcrumb.Item>
          </Breadcrumb>
          {!!outboundHead.bonded && <Tag color={regtype.tagcolor}>{regtype.ftztext}</Tag>}
          <div className="page-header-tools">
            {!!outboundHead.bonded && <Tooltip title="海关备案详情" placement="bottom">
              <Button size="large" onClick={this.handleRegPage}><Logixon type="customs" />{regStatus.text}</Button>
            </Tooltip>
            }
            {this.state.tabKey === 'pickingDetails' && <Dropdown overlay={printMenu}>
              <Button size="large" icon="printer" />
            </Dropdown>}
            <Tooltip title="打印顺丰速运面单" placement="bottom">
              <Button size="large" onClick={this.showExpressModal} >
                <Logixon type="sf-express" />
              </Button>
            </Tooltip>
            <RadioGroup value={outboundHead.shipping_mode} onChange={this.handleShippingModeChange} size="large" disabled={outboundStep === 5}>
              <Tooltip title="扫码模式" placement="bottom"><RadioButton value="scan"><Icon type="scan" /></RadioButton></Tooltip>
              <Tooltip title="手动模式" placement="bottom"><RadioButton value="manual"><Icon type="solution" /></RadioButton></Tooltip>
            </RadioGroup>
          </div>
        </Header>
        <Content className="main-content">
          <Card bodyStyle={{ padding: 16, paddingBottom: 48 }} noHovering>
            <Row gutter={16} className="info-group-underline">
              <Col sm={24} lg={4}>
                <InfoItem label="货主" field={outboundHead.owner_name} />
              </Col>
              { outboundHead.wave_no &&
              <Col sm={24} lg={4}>
                <InfoItem label="波次编号" field={outboundHead.wave_no} />
              </Col>
                }
              { outboundHead.so_no &&
              <Col sm={24} lg={4}>
                <InfoItem label="SO编号" field={outboundHead.so_no} />
              </Col>
                }
              <Col sm={12} lg={2}>
                <InfoItem label="订单总数" field={outboundHead.total_qty} />
              </Col>
              <Col sm={12} lg={2}>
                <InfoItem label="分配总数" field={outboundHead.total_alloc_qty} />
              </Col>
              <Col sm={12} lg={2}>
                <InfoItem label="拣货总数" field={outboundHead.total_picked_qty} />
              </Col>
              <Col sm={12} lg={2}>
                <InfoItem label="发货总数" field={outboundHead.total_shipped_qty} />
              </Col>
              <Col sm={12} lg={3}>
                <InfoItem label="创建时间" addonBefore={<Icon type="clock-circle-o" />}
                  field={outboundHead.created_date && moment(outboundHead.created_date).format('YYYY.MM.DD HH:mm')}
                />
              </Col>
              <Col sm={12} lg={3}>
                <InfoItem label="出库时间" addonBefore={<Icon type="clock-circle-o" />}
                  field={outboundHead.completed_date && moment(outboundHead.completed_date).format('YYYY.MM.DD HH:mm')}
                />
              </Col>
              <Col sm={12} lg={2}>
                <InfoItem label="操作模式" field={outboundHead.shipping_mode === 'manual' ? '手动' : '扫码'} />
              </Col>
            </Row>
            <div className="card-footer">
              <Steps progressDot current={outboundStep}>
                <Step description="待出库" />
                <Step description="分配" />
                <Step description="拣货" />
                <Step description="装箱" />
                <Step description="发货" />
                <Step description="已出库" />
              </Steps>
            </div>
          </Card>
          <Card bodyStyle={{ padding: 0 }} noHovering>
            <Tabs activeKey={this.state.tabKey} onChange={this.handleTabChange}>
              <TabPane tab="订单明细" key="orderDetails">
                <OrderDetailsPane outboundNo={this.props.params.outboundNo} />
              </TabPane>
              <TabPane tab="拣货明细" key="pickingDetails">
                <PickingDetailsPane outboundNo={this.props.params.outboundNo} />
              </TabPane>
              <TabPane tab="装箱明细" key="packingDetails">
                <PackingDetailsPane outboundNo={this.props.params.outboundNo} />
              </TabPane>
              <TabPane tab="发货明细" key="shippingDetails">
                <ShippingDetailsPane outboundNo={this.props.params.outboundNo} />
              </TabPane>
            </Tabs>
          </Card>
          <Modal title="顺丰快递" visible={this.state.expressModalvisible}
            onCancel={() => this.setState({ expressModalvisible: false })}
            onOk={() => this.setState({ expressModalvisible: false })}
          >
            <Card title="运单信息" bodyStyle={{ padding: '8 0 0 0' }} extra={
              <Button onClick={this.loadCourierNo}>
                  确定
                </Button>}
            >
              <FormItem label="单数" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
                <Input value={this.state.expressNum} type="number" onChange={e => this.setState({ expressNum: e.target.value })} />
              </FormItem>
              <FormItem label="发货人" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
                <Input value={this.state.contact} type="text" onChange={e => this.setState({ contact: e.target.value })} />
              </FormItem>
              <FormItem label="地址" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
                <Cascader defaultRegion={regionValues} onChange={this.handleRegionChange} />
              </FormItem>
              <FormItem label="详细地址" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
                <Input value={this.state.address} type="text" onChange={e => this.setState({ address: e.target.value })} />
              </FormItem>
              <FormItem label="电话" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
                <Input value={this.state.phone} type="text" onChange={e => this.setState({ phone: e.target.value })} />
              </FormItem>
              <FormItem label="快递类型" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
                <Select placeholder="快递类型" value={this.state.express_type} onChange={value => this.setState({ express_type: value })} style={{ width: '100%' }}>
                  {EXPRESS_TYPES.map(item => (<Option value={item.value}>{item.text}</Option>))}
                </Select>
              </FormItem>
              <FormItem label="付款方式" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
                <Select placeholder="付款方式" value={this.state.pay_method} onChange={value => this.setState({ pay_method: value })} style={{ width: '100%' }}>
                  {PAY_METHODS.map(item => (<Option value={item.value}>{item.text}</Option>))}
                </Select>
              </FormItem>
              <FormItem label="保价金额" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
                <Input value={this.state.insure} type="number" onChange={e => this.setState({ insure: e.target.value })} />
              </FormItem>
            </Card>
            <Card title="快递单号" bodyStyle={{ padding: 0 }}>
              <Table dataSource={dataSource} columns={columns} showHeader={false} size="small" pagination={false} />
            </Card>
          </Modal>
        </Content>
      </div>
    );
  }
}
