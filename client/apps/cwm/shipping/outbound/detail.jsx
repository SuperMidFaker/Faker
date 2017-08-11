import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Breadcrumb, Icon, Layout, Tabs, Steps, Button, Card, Col, Row, Tooltip, Radio } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import InfoItem from 'client/components/InfoItem';
import OrderDetailsPane from './tabpane/orderDetailsPane';
import PickingDetailsPane from './tabpane/pickingDetailsPane';
import PackingDetailsPane from './tabpane/packingDetailsPane';
import ShippingDetailsPane from './tabpane/shippingDetailsPane';
import { loadOutboundHead, updateOutboundMode, readWaybillLogo } from 'common/reducers/cwmOutbound';
import { CWM_OUTBOUND_STATUS } from 'common/constants';
import messages from '../message.i18n';
import { format } from 'client/common/i18n/helpers';
import { WaybillDef } from './docDef';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const Step = Steps.Step;
const TabPane = Tabs.TabPane;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    username: state.account.username,
    defaultWhse: state.cwmContext.defaultWhse,
    outboundHead: state.cwmOutbound.outboundFormHead,
    reload: state.cwmOutbound.outboundReload,
    pickDetails: state.cwmOutbound.pickDetails,
    waybill: state.cwmOutbound.waybill,
  }),
  { loadOutboundHead, updateOutboundMode, readWaybillLogo }
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
  handleWaybillPrint = () => {
    this.setState({
      printedPickingList: true,
    });
    const docDefinition = WaybillDef(this.props.waybill);
    window.pdfMake.fonts = {
      yahei: {
        normal: 'msyh.ttf',
        bold: 'msyh.ttf',
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
  pdfPickHead = () => {
    const { outboundHead, defaultWhse } = this.props;
    const pdf = [];
    const header = [];
    header.push({ text: '拣货单', style: 'tableHeader', colSpan: 6, alignment: 'center' }, {}, {}, {}, {}, {});
    pdf.push(header);
    pdf.push([{ text: '入库单号', style: 'table' }, { text: this.props.params.outboundNo, style: 'table' }, { text: '客户订单号', style: 'table' },
      { text: outboundHead.cust_order_no, style: 'table' }, { text: '出库日期', style: 'table' }, { text: '', style: 'table' }]);
    pdf.push([{ text: '货物属性', style: 'table' }, { text: outboundHead.bonded ? '保税' : '非保税', style: 'table' }, { text: '客户', style: 'table' },
      { text: outboundHead.owner_name, style: 'table' }, { text: '仓库', style: 'table' }, { text: defaultWhse.name, style: 'table' }]);
    pdf.push([{ text: '备注', style: 'table' }, { text: '', colSpan: 5 }, {}, {}, {}, {}]);
    return pdf;
  }
  pdfPickDetails = () => {
    const { outboundHead, pickDetails } = this.props;
    const pdf = [];
    const header = [];
    header.push({ text: '货物清单', style: 'tableHeader', colSpan: 7, alignment: 'center' }, {}, {}, {}, {}, {}, {});
    pdf.push(header);
    pdf.push([{ text: '项', style: 'table', alignment: 'center' }, { text: '货号', style: 'table', alignment: 'center' },
      { text: '产品名称', style: 'table', alignment: 'center' }, { text: '待捡数', style: 'table', alignment: 'center' },
      { text: '实件数', style: 'table', alignment: 'center' }, { text: '库位', style: 'table', alignment: 'center' },
      { text: '扩展属性1', style: 'table', alignment: 'center' }]);
    for (let i = 0; i < pickDetails.length; i++) {
      pdf.push([i + 1, pickDetails[i].product_no, pickDetails[i].name, pickDetails[i].alloc_qty,
        '', pickDetails[i].location, '']);
    }
    pdf.push(['合计', '', '', outboundHead.total_alloc_qty, '', '', '']);
    return pdf;
  }
  pdfSign = () => {
    const pdf = [];
    pdf.push([{ text: '签字', style: 'tableHeader', colSpan: 8, alignment: 'center' }, {}, {}, {}, {}, {}, {}, {}]);
    pdf.push([{ text: '计划', style: 'table' }, '', { text: '收货', style: 'table' }, '', { text: '上架', style: 'table' },
      '', { text: '归档', style: 'table' }, '']);
    pdf.push([{ text: '实收包装件数', style: 'table' }, { text: '', colSpan: 2 }, {}, { text: '实测计价体积', style: 'table' },
      { text: '', colSpan: 2 }, {}, { text: '记录人', style: 'table' }, '']);
    return pdf;
  }
  handleDocDef = () => {
    const docDefinition = {
      content: [],
      styles: {
        eachheader: {
          fontSize: 9,
          margin: [40, 20, 30, 30],
        },
        table: {
          fontSize: 9,
          color: 'black',
          margin: [2, 10, 2, 10],
        },
        tableHeader: {
          fontSize: 12,
          bold: true,
          color: 'black',
          margin: [2, 2, 2, 2],
        },
      },
      defaultStyle: {
        font: 'yahei',
      },
    };
    docDefinition.header = {
      columns: [
        { text: moment(new Date()).format('YYYY/MM/DD'), style: 'eachheader' },
      ],
    };
    docDefinition.content = [
      { style: 'table',
        table: { widths: [60, 150, 60, 75, 50, 75], headerRows: 1, body: this.pdfPickHead() },
      },
      {
        style: 'table',
        table: { widths: [40, 80, 140, 50, 50, 50, 50], headerRows: 1, body: this.pdfPickDetails() },
      },
      {
        style: 'table',
        table: { widths: [40, 75, 40, 75, 40, 75, 40, 75], headerRows: 1, body: this.pdfSign() },
      },
    ];
    return docDefinition;
  }
  handlePrint = () => {
    // pdfMake.vfs = pdfFonts.pdfMake.vfs;
    const docDefinition = this.handleDocDef();
    window.pdfMake.fonts = {
      yahei: {
        normal: 'msyh.ttf',
        bold: 'msyh.ttf',
        italics: 'msyh.ttf',
        bolditalics: 'msyh.ttf',
      },
    };
    window.pdfMake.createPdf(docDefinition).open();
    this.setState({
      printed: true,
    });
  }
  render() {
    const { defaultWhse, outboundHead, pickDetails } = this.props;
    const outbStatus = Object.keys(CWM_OUTBOUND_STATUS).filter(
      cis => CWM_OUTBOUND_STATUS[cis].value === outboundHead.status
    )[0];
    const outboundStep = outbStatus ? CWM_OUTBOUND_STATUS[outbStatus].step : 0;
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
          <div className="page-header-tools">
            {this.state.tabKey === 'pickingDetails' &&
            <Button size="large" icon="printer" disabled={!pickDetails.length > 0} onClick={this.handlePrint} />
            }
            <Button size="large" icon="printer" onClick={this.handleWaybillPrint} />
            <RadioGroup value={outboundHead.shipping_mode} onChange={this.handleShippingModeChange} size="large" disabled={outboundStep === 5}>
              <Tooltip title="扫码模式"><RadioButton value="scan"><Icon type="scan" /></RadioButton></Tooltip>
              <Tooltip title="手动模式"><RadioButton value="manual"><Icon type="solution" /></RadioButton></Tooltip>
            </RadioGroup>
          </div>
        </Header>
        <Content className="main-content">
          <Card bodyStyle={{ paddingBottom: 56 }}>
            <Row className="info-group-inline">
              <Col sm={24} lg={6}>
                <InfoItem label="货主" field={outboundHead.owner_name} />
              </Col>
              { outboundHead.wave_no &&
              <Col sm={24} lg={6}>
                <InfoItem label="波次编号" field={outboundHead.wave_no} />
              </Col>
                }
              { outboundHead.so_no &&
              <Col sm={24} lg={6}>
                <InfoItem label="SO编号" field={outboundHead.so_no} />
              </Col>
                }
              <Col sm={12} lg={2}>
                <InfoItem label="订货总数" field={outboundHead.total_qty} />
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
          <Card style={{ marginTop: 16 }} bodyStyle={{ padding: 0 }}>
            <Tabs activeKey={this.state.tabKey} onChange={this.handleTabChange}>
              <TabPane tab="订单明细" key="orderDetails">
                <OrderDetailsPane outboundNo={this.props.params.outboundNo} />
              </TabPane>
              <TabPane tab="拣货明细" key="pickingDetails">
                <PickingDetailsPane shippingMode={this.state.shippingMode} outboundNo={this.props.params.outboundNo} />
              </TabPane>
              <TabPane tab="装箱明细" key="packingDetails">
                <PackingDetailsPane shippingMode={this.state.shippingMode} outboundNo={this.props.params.outboundNo} />
              </TabPane>
              <TabPane tab="发货明细" key="shippingDetails">
                <ShippingDetailsPane shippingMode={this.state.shippingMode} outboundNo={this.props.params.outboundNo} />
              </TabPane>
            </Tabs>
          </Card>
        </Content>
      </div>
    );
  }
}
