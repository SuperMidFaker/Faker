import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Breadcrumb, Icon, Layout, Tabs, Steps, Button, Card, Col, Row, Tooltip, Radio, Modal, Form, Input, Table, Tag } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import InfoItem from 'client/components/InfoItem';
import { Logixon } from 'client/components/FontIcon';
import OrderDetailsPane from './tabpane/orderDetailsPane';
import PickingDetailsPane from './tabpane/pickingDetailsPane';
import PackingDetailsPane from './tabpane/packingDetailsPane';
import ShippingDetailsPane from './tabpane/shippingDetailsPane';
import { loadOutboundHead, updateOutboundMode, readWaybillLogo, loadCourierNo } from 'common/reducers/cwmOutbound';
import Print from './printPIckList';
import { CWM_OUTBOUND_STATUS, CWM_SO_BONDED_REGTYPES } from 'common/constants';
import messages from '../message.i18n';
import { format } from 'client/common/i18n/helpers';
import { WaybillDef } from './docDef';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const Step = Steps.Step;
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;

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
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    allocated: true,
    pushedTask: false,
    printedPickingList: false,
    picking: false,
    picked: false,
    tabKey: 'orderDetails',
    expressModalvisible: false,
    expressNum: 0,
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
    const { outboundHead } = this.props;
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
  handleWaybillPrint = (courierNo, courierNoSon) => {
    this.setState({
      printedPickingList: true,
    });
    const { expressNum } = this.state;
    const docDefinition = WaybillDef({ ...this.props.waybill, courierNo, courierNoSon, expressNum });
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
    this.props.loadCourierNo({
      outboundNo: this.props.params.outboundNo,
      tenantId: this.props.tenantId,
      expressNum: this.state.expressNum,
    }).then(() => {
      this.props.loadOutboundHead(this.props.params.outboundNo);
    });
  }
  render() {
    const { defaultWhse, outboundHead } = this.props;
    const outbStatus = Object.keys(CWM_OUTBOUND_STATUS).filter(
      cis => CWM_OUTBOUND_STATUS[cis].value === outboundHead.status
    )[0];
    const regtype = CWM_SO_BONDED_REGTYPES.filter(sbr => sbr.value === outboundHead.bonded_outtype)[0];
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
      render: row => (<a onClick={() => this.handleWaybillPrint(courierNo[0], row.courier_no)}><Icon type="printer" /></a>),
    }];
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
            {!!outboundHead.bonded && <Button type="primary" size="large" onClick={this.handleRegPage}>
              备案</Button>}
            {this.state.tabKey === 'pickingDetails' &&
            <Print outboundNo={this.props.params.outboundNo} />
            }
            <Button size="large" onClick={this.showExpressModal} >
              <Logixon type="sf-express" />
            </Button>
            <RadioGroup value={outboundHead.shipping_mode} onChange={this.handleShippingModeChange} size="large" disabled={outboundStep === 5}>
              <Tooltip title="扫码模式"><RadioButton value="scan"><Icon type="scan" /></RadioButton></Tooltip>
              <Tooltip title="手动模式"><RadioButton value="manual"><Icon type="solution" /></RadioButton></Tooltip>
            </RadioGroup>
          </div>
        </Header>
        <Content className="main-content">
          <Card bodyStyle={{ padding: 16, paddingBottom: 56 }} noHovering>
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
          <Card style={{ marginTop: 16 }} bodyStyle={{ padding: 0 }} noHovering>
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
            <Card title="运单信息" extra={
              <Button onClick={this.loadCourierNo}>
                  确定
                </Button>}
            >
              <FormItem label="单数" labelCol={{ span: 4 }} wrapperCol={{ span: 8 }}>
                <Input value={this.state.expressNum} type="number" onChange={e => this.setState({ expressNum: Number(e.target.value) })} />
              </FormItem>
            </Card>
            <Card title="快递单号">
              <Table dataSource={dataSource} columns={columns} showHeader={false} size="small" />
            </Card>
          </Modal>
        </Content>
      </div>
    );
  }
}
