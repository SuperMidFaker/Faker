import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Alert, Breadcrumb, Icon, Dropdown, Radio, Layout, Menu, Steps, Button, Card, Col, Row, Tabs, Tooltip } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import InfoItem from 'client/components/InfoItem';
import { loadInboundHead, updateInboundMode } from 'common/reducers/cwmReceive';
import { CWM_INBOUND_STATUS } from 'common/constants';
import PutawayDetailsPane from './tabpane/putawayDetailsPane';
import ReceiveDetailsPane from './tabpane/receiveDetailsPane';
import messages from '../message.i18n';
import { format } from 'client/common/i18n/helpers';

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
    inboundHead: state.cwmReceive.inboundFormHead,
    inboundProducts: state.cwmReceive.inboundProducts,
    reload: state.cwmReceive.inboundReload,
  }),
  { loadInboundHead, updateInboundMode }
)
@connectNav({
  depth: 3,
  moduleName: 'cwm',
})
export default class ReceiveInbound extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    printed: false,
    activeTab: '',
  }
  componentWillMount() {
    this.props.loadInboundHead(this.props.params.inboundNo).then((result) => {
      if (!result.error) {
        const activeTab = result.data.status === CWM_INBOUND_STATUS.COMPLETED.value ? 'putawayDetails' : 'receiveDetails';
        this.setState({
          activeTab,
        });
      }
    });
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
      this.props.loadInboundHead(nextProps.params.inboundNo).then((result) => {
        if (!result.error) {
          const activeTab = result.data.status === CWM_INBOUND_STATUS.COMPLETED.value || result.data.status === CWM_INBOUND_STATUS.PARTIAL_PUTAWAY.value ? 'putawayDetails' : 'receiveDetails';
          this.setState({
            activeTab,
          });
        }
      });
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  handleReceivingModeChange = (ev) => {
    this.props.updateInboundMode(this.props.params.inboundNo, ev.target.value);
  }
  handleTabChange = (activeTab) => {
    this.setState({ activeTab });
  }
  pdfInboundHead = () => {
    const { inboundHead, defaultWhse } = this.props;
    const pdf = [];
    const header = [];
    header.push({ text: '入库单', style: 'tableHeader', colSpan: 6, alignment: 'center' }, {}, {}, {}, {}, {});
    pdf.push(header);
    pdf.push([{ text: '入库单号', style: 'table' }, { text: this.props.params.inboundNo, style: 'table' }, { text: '采购订单号', style: 'table' },
      { text: inboundHead.po_no, style: 'table' }, { text: '入库日期', style: 'table' }, { text: '', style: 'table' }]);
    pdf.push([{ text: '货物属性', style: 'table' }, { text: inboundHead.bonded ? '保税' : '非保税', style: 'table' }, { text: '客户', style: 'table' },
      { text: inboundHead.owner_name, style: 'table' }, { text: '仓库', style: 'table' }, { text: defaultWhse.name, style: 'table' }]);
    pdf.push([{ text: '件数', style: 'table' }, { text: inboundHead.total_expect_qty, style: 'table' }, { text: '提运单号', style: 'table' },
      { text: '', style: 'table' }, { text: '海关入库编号', style: 'table' }, { text: '', style: 'table' }]);
    pdf.push([{ text: '备注', style: 'table' }, { text: '', colSpan: 5 }, {}, {}, {}, {}]);
    return pdf;
  }
  pdfInboundDetails = () => {
    const { inboundHead, inboundProducts } = this.props;
    const pdf = [];
    const header = [];
    header.push({ text: '货物清单', style: 'tableHeader', colSpan: 8, alignment: 'center' }, {}, {}, {}, {}, {}, {}, {});
    pdf.push(header);
    pdf.push([{ text: '项', style: 'table', alignment: 'center' }, { text: '产品名称', style: 'table', alignment: 'center' },
      { text: '仓库料号', style: 'table', alignment: 'center' }, { text: '计划数量', style: 'table', alignment: 'center' },
      { text: '实际数量', style: 'table', alignment: 'center' }, { text: '建议库位', style: 'table', alignment: 'center' },
      { text: '实际库位', style: 'table', alignment: 'center' }, { text: '扩展属性1', style: 'table', alignment: 'center' }]);
    for (let i = 0; i < inboundProducts.length; i++) {
      pdf.push([i + 1, inboundProducts[i].name, inboundProducts[i].product_no, inboundProducts[i].expect_qty,
        inboundProducts[i].received_qty, '', inboundProducts[i].location, '']);
    }
    pdf.push(['合计', '', '', inboundHead.total_expect_qty, '', '', '', '']);
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
        table: { widths: [60, 150, 60, 75, 50, 75], headerRows: 1, body: this.pdfInboundHead() },
      },
      {
        style: 'table',
        table: { widths: [40, 100, 60, 50, 50, 50, 50, 50], headerRows: 1, body: this.pdfInboundDetails() },
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
    const { defaultWhse, inboundHead } = this.props;
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
    const inbStatus = Object.keys(CWM_INBOUND_STATUS).filter(
      cis => CWM_INBOUND_STATUS[cis].value === inboundHead.status
    )[0];
    const currentStatus = inbStatus ? CWM_INBOUND_STATUS[inbStatus].step : 0;
    return (
      <div>
        <Header className="page-header">
          <Breadcrumb>
            <Breadcrumb.Item>
              {defaultWhse.name}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('receivingInound')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.props.params.inboundNo}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="page-header-tools">
            {currentStatus < CWM_INBOUND_STATUS.COMPLETED.step &&
            <Tooltip title="打印入库单" placement="bottom">
              <Button size="large" icon="printer" onClick={this.handlePrint} />
            </Tooltip>
            }
            {currentStatus < CWM_INBOUND_STATUS.COMPLETED.step && false &&
            <Dropdown overlay={tagMenu}>
              <Button size="large" onClick={this.handleTagging}>
                <Icon type="barcode" />标签 <Icon type="down" />
              </Button>
            </Dropdown>
            }
            <RadioGroup value={inboundHead.rec_mode} onChange={this.handleReceivingModeChange} size="large"
              disabled={currentStatus === CWM_INBOUND_STATUS.COMPLETED.step}
            >
              <Tooltip title="扫码模式" placement="bottom"><RadioButton value="scan"><Icon type="scan" /></RadioButton></Tooltip>
              <Tooltip title="手动模式" placement="bottom"><RadioButton value="manual"><Icon type="solution" /></RadioButton></Tooltip>
            </RadioGroup>
          </div>
        </Header>
        <Content className="main-content">
          {currentStatus >= CWM_INBOUND_STATUS.ALL_RECEIVED.value &&
            currentStatus < CWM_INBOUND_STATUS.COMPLETED.value &&
            inboundHead.total_received_qty < inboundHead.total_expect_qty &&
            <Alert message="实收数量少于预期数量，全部上架确认后必须手动关闭" type="info" showIcon closable />
          }
          {inboundHead.total_received_qty > inboundHead.total_expect_qty &&
            currentStatus < CWM_INBOUND_STATUS.COMPLETED.value &&
            <Alert message="实收数量超过预期数量，全部上架确认后必须手动关闭" type="warning" showIcon closable />
          }
          <Card bodyStyle={{ paddingBottom: 56 }} noHovering>
            <Row className="info-group-inline">
              <Col sm={24} lg={6}>
                <InfoItem label="货主" field={inboundHead.owner_name} />
              </Col>
              <Col sm={24} lg={6}>
                <InfoItem label="ASN编号" field={inboundHead.asn_no} />
              </Col>
              <Col sm={12} lg={3}>
                <InfoItem label="总预期数量" field={inboundHead.total_expect_qty} />
              </Col>
              <Col sm={12} lg={3}>
                <InfoItem label="总实收数量" field={inboundHead.total_received_qty} />
              </Col>
              <Col sm={12} lg={3}>
                <InfoItem label="装箱数量" field={inboundHead.convey_box_qty} editable />
              </Col>
              <Col sm={12} lg={3}>
                <InfoItem label="码盘数量" field={inboundHead.convey_pallet_qty} editable />
              </Col>
            </Row>
            <div className="card-footer">
              <Steps progressDot current={currentStatus}>
                <Step description="待入库" />
                <Step description="收货" />
                <Step description="上架" />
                <Step description="已入库" />
              </Steps>
            </div>
          </Card>
          <Card style={{ marginTop: 16 }} bodyStyle={{ padding: 0 }} noHovering>
            <Tabs activeKey={this.state.activeTab} onChange={this.handleTabChange}>
              <TabPane tab="收货明细" key="receiveDetails">
                <ReceiveDetailsPane inboundNo={this.props.params.inboundNo} />
              </TabPane>
              <TabPane tab="上架明细" key="putawayDetails" disabled={inboundHead.status === CWM_INBOUND_STATUS.CREATED.value}>
                <PutawayDetailsPane inboundNo={this.props.params.inboundNo} />
              </TabPane>
            </Tabs>
          </Card>
        </Content>
      </div>
    );
  }
}
