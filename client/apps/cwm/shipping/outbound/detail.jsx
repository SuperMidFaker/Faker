import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import FileSaver from 'file-saver';
import XLSX from 'xlsx';
import { Badge, Breadcrumb, Icon, Layout, Tabs, Steps, Button, Card, Col, Row, Tooltip, Radio,
  Tag, Dropdown, Menu, notification, message } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import InfoItem from 'client/components/InfoItem';
import { string2Bytes } from 'client/util/dataTransform';
import { Logixon } from 'client/components/FontIcon';
import PageHeader from 'client/components/PageHeader';
import MagicCard from 'client/components/MagicCard';
import { CWM_OUTBOUND_STATUS, CWM_SO_BONDED_REGTYPES, CWM_SHFTZ_REG_STATUS_INDICATOR, CWM_SHFTZ_TRANSFER_OUT_STATUS_INDICATOR } from 'common/constants';
import { loadOutboundHead, updateOutboundMode, toggleSFExpressModal, loadSFExpressConfig, loadPrintPickDetails } from 'common/reducers/cwmOutbound';
import OrderDetailsPane from './tabpane/orderDetailsPane';
import PickingDetailsPane from './tabpane/pickingDetailsPane';
import PackingDetailsPane from './tabpane/packingDetailsPane';
import ShippingDetailsPane from './tabpane/shippingDetailsPane';
import PrintPickList from './billsPrint/printPIckList';
import PrintShippingList from './billsPrint/printShippingList';
import PrintShippingConfirm from './billsPrint/printShippingConfirm';
import messages from '../message.i18n';
import SFExpressModal from './modal/SFExpressModal';

const formatMsg = format(messages);
const { Content } = Layout;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const { Step } = Steps;
const { TabPane } = Tabs;

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    username: state.account.username,
    defaultWhse: state.cwmContext.defaultWhse,
    outboundHead: state.cwmOutbound.outboundFormHead,
    reload: state.cwmOutbound.outboundReload,
    waybill: state.cwmOutbound.waybill,
    outboundProducts: state.cwmOutbound.outboundProducts,
  }),
  {
    loadOutboundHead,
    updateOutboundMode,
    toggleSFExpressModal,
    loadSFExpressConfig,
    loadPrintPickDetails,
  }
)
@connectNav({
  depth: 3,
  moduleName: 'cwm',
  jumpOut: true,
})
export default class OutboundDetail extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    updateOutboundMode: PropTypes.func.isRequired,
    toggleSFExpressModal: PropTypes.func.isRequired,
    outboundProducts: PropTypes.arrayOf(PropTypes.shape({ seq_no: PropTypes.string.isRequired })),
    loadSFExpressConfig: PropTypes.func.isRequired,
    loadPrintPickDetails: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    tabKey: 'orderDetails',
    fullscreen: true,
    expLoad: false,
  }
  componentWillMount() {
    this.props.loadOutboundHead(this.props.params.outboundNo);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.reload) {
      this.props.loadOutboundHead(this.props.params.outboundNo);
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  handleShippingModeChange = (ev) => {
    this.props.updateOutboundMode(this.props.params.outboundNo, ev.target.value);
  }
  handleTabChange = (tabKey) => {
    this.setState({
      tabKey,
    });
  }
  handleRegPage = (type) => {
    const link = type === 'transfer' ? `/cwm/supervision/shftz/transfer/out/${this.props.outboundHead.so_no}`
      : `/cwm/supervision/shftz/release/${type}/${this.props.outboundHead.so_no}`;
    this.context.router.push(link);
  }
  toggleFullscreen = (fullscreen) => {
    this.setState({ fullscreen });
  }

  handleExportPickingListXLS = () => {
    const { defaultWhse, outboundHead, params } = this.props;
    this.setState({ expLoad: true });
    this.props.loadPrintPickDetails(params.outboundNo).then((result) => {
      if (!result.error) {
        const pickDetails = result.data;
        const csvData = pickDetails.map((dv, index) => {
          const out = {};
          out['项'] = index + 1;
          out['货号'] = dv.product_no;
          out['产品名称'] = dv.name || '';
          out['批次号'] = dv.external_lot_no || '';
          out['客户属性'] = dv.attrib_1_string || '';
          out['库位'] = dv.location || '';
          out['待拣数'] = Number(dv.alloc_qty);
          out['余量数'] = Number((dv.stock_qty - dv.alloc_qty) + dv.shipped_qty);
          out['实拣数'] = Number(dv.picked_qty === 0 ? '' : dv.picked_qty);
          return out;
        });
        const _headers = ['项', '货号', '产品名称', '批次号', '客户属性', '库位', '待拣数', '余量数', '实拣数'];
        const headers = _headers.map((v, i) =>
          Object.assign({}, { v, position: String.fromCharCode(65 + i) + 5 }))
          .reduce((prev, next) => Object.assign({}, prev, { [next.position]: { v: next.v } }), {});
        const data = csvData.map((v, i) => _headers.map((k, j) =>
          Object.assign({}, { v: v[k], position: String.fromCharCode(65 + j) + (i + 6) })))
          .reduce((prev, next) => prev.concat(next))
          .reduce((prev, next) => Object.assign({}, prev, { [next.position]: { v: next.v } }), {});
        const ref = 'A1' + ':' + `I${csvData.length + 8}`;
        const ws = Object.assign({}, headers, data, { '!ref': ref });
        const wopts = { bookType: 'xlsx', bookSST: false, type: 'binary' };
        const wb = { SheetNames: ['Sheet1'], Sheets: {}, Props: {} };
        ws.A1 = { v: '拣货单' };
        ws.A2 = { v: `出库单号:  ${params.outboundNo || ''}` };
        ws.D2 = { v: `客户单号:  ${outboundHead.cust_order_no || ''}` };
        ws.G2 = { v: `订单数量:  ${outboundHead.total_alloc_qty || ''}` };
        ws.A3 = { v: `货物属性:  ${outboundHead.bonded ? '保税' : '非保税'}` };
        ws.D3 = { v: `客户:  ${outboundHead.owner_name || ''}` };
        ws.G3 = { v: `仓库:  ${defaultWhse.name || ''}` };
        ws.A4 = { v: '备注: ' };
        ws[`A${csvData.length + 6}`] = { v: '合计' };
        ws[`G${csvData.length + 6}`] = { v: `${outboundHead.total_alloc_qty}` };
        ws[`I${csvData.length + 7}`] = { v: `${moment(new Date()).format('YYYY/MM/DD')}` };
        ws[`A${csvData.length + 8}`] = { v: '计划:' };
        ws[`C${csvData.length + 8}`] = { v: '收货:' };
        ws[`E${csvData.length + 8}`] = { v: '上架:' };
        ws[`G${csvData.length + 8}`] = { v: '归档:' };
        const merge = { s: { r: 0, c: 0 }, e: { r: 0, c: 10 } };
        if (!ws['!merges']) { ws['!merges'] = []; }
        ws['!merges'].push(merge);
        ws['!rows'] = [
          { hpx: 25 }, // "pixels"
        ];
        /* change cell format of range G6:I~ to number */
        const irow = csvData.length + 5;
        const range = { s: { r: 5, c: 6 }, e: { r: irow, c: 8 } };
        for (let R = range.s.r; R <= range.e.r; ++R) {
          for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
            if (cell) cell.t = 'n';
          }
        }
        wb.Sheets.Sheet1 = ws;
        FileSaver.saveAs(
          new window.Blob([string2Bytes(XLSX.write(wb, wopts))], { type: 'application/octet-stream' }),
          `拣货单_${params.outboundNo}_${Date.now()}.xlsx`
        );
        this.setState({ expLoad: false });
      } else {
        message.error(result.error.message);
        this.setState({ expLoad: false });
      }
    });
  }
  showExpressModal = () => {
    this.props.loadSFExpressConfig().then((result) => {
      if (result.error) {
        const key = `open${Date.now()}`;
        const btnClick = () => {
          this.context.router.push('/hub/integration/sfexpress/install');
          notification.close(key);
        };
        const btn = (
          <Button type="primary" size="small" onClick={btnClick}>
            去配置
          </Button>
        );
        notification.open({
          message: '顺丰快递接口',
          description: result.error.message,
          btn,
          key,
          onClose: () => notification.close(key),
        });
      } else {
        const { defaultWhse, outboundHead, outboundProducts } = this.props;
        this.props.toggleSFExpressModal(true, {
          ...result.data,
          order_no: outboundHead.outbound_no,
          sender_phone: defaultWhse.whse_tel,
          sender_address: defaultWhse.whse_address,
          sender_contact: defaultWhse.name,
          sender_province: defaultWhse.whse_province,
          sender_city: defaultWhse.whse_city,
          sender_district: defaultWhse.whse_district,
          sender_street: defaultWhse.whse_street,
          sender_region_code: defaultWhse.whse_region_code,

          receiver_phone: outboundHead.receiver_phone || outboundHead.receiver_number,
          receiver_address: outboundHead.receiver_address,
          receiver_contact: outboundHead.receiver_contact,
          receiver_province: outboundHead.receiver_province,
          receiver_city: outboundHead.receiver_city,
          receiver_district: outboundHead.receiver_district,
          receiver_street: outboundHead.receiver_street,
          receiver_region_code: outboundHead.receiver_region_code,

          product_name: outboundProducts[0] ? outboundProducts[0].name : '',
          product_qty: outboundProducts.map(item => item.order_qty).reduce((a, b) => a + b),
        });
      }
    });
  }
  render() {
    const { defaultWhse, outboundHead } = this.props;
    const outbStatus = Object.keys(CWM_OUTBOUND_STATUS).filter(cis =>
      CWM_OUTBOUND_STATUS[cis].value === outboundHead.status)[0];
    let regTag;
    let regTypes = [];
    if (outboundHead.bonded === 1) {
      [regTag] = CWM_SO_BONDED_REGTYPES.filter(sbr =>
        sbr.value === outboundHead.bonded_outtype && sbr.tagcolor);
      if (regTag) {
        regTypes = [{
          tooltip: '关联监管备案',
          type: outboundHead.bonded_outtype,
          status: outboundHead.reg_status,
        }];
      }
    } else if (outboundHead.bonded === -1 && outboundHead.bonded_outtype.length > 0) {
      regTypes = outboundHead.bonded_outtype.map((type, index) => {
        const sreg = CWM_SO_BONDED_REGTYPES.filter(sbr => sbr.value === type)[0];
        return { type, tooltip: sreg && sreg.ftztext, status: outboundHead.reg_status[index] };
      });
    }
    const outboundStep = outbStatus ? CWM_OUTBOUND_STATUS[outbStatus].step : 0;
    const scanLabel = outboundHead.shipping_mode === 'scan' ? ' 扫码模式' : '';
    const manualLabel = outboundHead.shipping_mode === 'manual' ? ' 手动模式' : '';
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
        <PageHeader>
          <PageHeader.Title>
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
            {regTag && <Tag color={regTag.tagcolor}>{regTag.ftztext}</Tag>}
          </PageHeader.Title>
          <PageHeader.Nav>
            {regTypes.map((reg) => {
              const regStatus = reg.type === 'transfer' ?
                CWM_SHFTZ_TRANSFER_OUT_STATUS_INDICATOR.filter(status =>
                  status.value === reg.status)[0] :
                CWM_SHFTZ_REG_STATUS_INDICATOR.filter(status =>
                  status.value === reg.status)[0];
              if (regStatus) {
                return (<Tooltip title={reg.tooltip} placement="bottom" key={reg.type}>
                  <Button icon="link" onClick={() => this.handleRegPage(reg.type)} style={{ marginLeft: 8 }}>
                    <Badge status={regStatus.badge} text={regStatus.text} />
                  </Button>
                </Tooltip>);
              }
                return null;
            })
            }
          </PageHeader.Nav>
          <PageHeader.Actions>
            {this.state.tabKey === 'pickingDetails' && <Dropdown overlay={printMenu}>
              <Button icon="printer" />
            </Dropdown>}
            {this.state.tabKey === 'pickingDetails' &&
              <Tooltip title="导出拣货单Excel" placement="bottom">
                <Button onClick={this.handleExportPickingListXLS} loading={this.state.expLoad}>
                  <Logixon type="export" />
                </Button>
              </Tooltip>
            }
            <Tooltip title="打印顺丰速运面单" placement="bottom">
              <Button onClick={this.showExpressModal} >
                <Logixon type="sf-express" />
              </Button>
            </Tooltip>
            <RadioGroup
              value={outboundHead.shipping_mode}
              onChange={this.handleShippingModeChange}
              disabled={outboundStep === 5}
            >
              <Tooltip title="扫码出库操作模式" placement="bottom">
                <RadioButton value="scan"><Icon type="scan" />{scanLabel}</RadioButton>
              </Tooltip>
              <Tooltip title="手动出库操作模式" placement="bottom">
                <RadioButton value="manual"><Icon type="solution" />{manualLabel}</RadioButton>
              </Tooltip>
            </RadioGroup>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content">
          <Card bodyStyle={{ padding: 16, paddingBottom: 56 }} >
            <Row gutter={16} className="info-group-underline">
              <Col sm={24} lg={4}>
                <InfoItem label="货主" field={outboundHead.owner_name} />
              </Col>
              { outboundHead.wave_no &&
              <Col sm={24} lg={4}>
                <InfoItem label="波次编号" field={outboundHead.wave_no} />
              </Col>
                }
              <Col sm={24} lg={4}>
                <InfoItem label="客户单号" field={outboundHead.cust_order_no} />
              </Col>
              <Col sm={12} lg={3}>
                <InfoItem label="订单总数" field={outboundHead.total_qty} />
              </Col>
              <Col sm={12} lg={3}>
                <InfoItem label="分配总数" field={outboundHead.total_alloc_qty} upperLimit={outboundHead.total_qty} />
              </Col>
              <Col sm={12} lg={2}>
                <InfoItem label="拣货总数" field={outboundHead.total_picked_qty} upperLimit={outboundHead.total_alloc_qty} />
              </Col>
              <Col sm={12} lg={2}>
                <InfoItem label="发货总数" field={outboundHead.total_shipped_qty} upperLimit={outboundHead.total_picked_qty} />
              </Col>
              <Col sm={12} lg={3}>
                <InfoItem
                  label="创建时间"
                  addonBefore={<Icon type="clock-circle-o" />}
                  field={outboundHead.created_date && moment(outboundHead.created_date).format('YYYY.MM.DD')}
                />
              </Col>
              <Col sm={12} lg={3}>
                <InfoItem
                  label="出库时间"
                  addonBefore={<Icon type="clock-circle-o" />}
                  field={outboundHead.completed_date && moment(outboundHead.completed_date).format('MM.DD HH:mm')}
                />
              </Col>
            </Row>
            <div className="card-footer">
              <Steps progressDot current={outboundStep}>
                <Step title="待出库" />
                <Step title="分配" />
                <Step title="拣货" />
                <Step title="复核装箱" />
                <Step title="发货" />
                <Step title="已出库" />
              </Steps>
            </div>
          </Card>
          <MagicCard
            bodyStyle={{ padding: 0 }}

            onSizeChange={this.toggleFullscreen}
          >
            <Tabs activeKey={this.state.tabKey} onChange={this.handleTabChange}>
              <TabPane tab="订单明细" key="orderDetails">
                <OrderDetailsPane
                  outboundNo={this.props.params.outboundNo}
                  fullscreen={this.state.fullscreen}
                />
              </TabPane>
              <TabPane tab="拣货明细" key="pickingDetails">
                <PickingDetailsPane
                  outboundNo={this.props.params.outboundNo}
                  fullscreen={this.state.fullscreen}
                />
              </TabPane>
              <TabPane tab="装箱明细" key="packingDetails">
                <PackingDetailsPane
                  outboundNo={this.props.params.outboundNo}
                  fullscreen={this.state.fullscreen}
                />
              </TabPane>
              <TabPane tab="发货明细" key="shippingDetails">
                <ShippingDetailsPane
                  outboundNo={this.props.params.outboundNo}
                  fullscreen={this.state.fullscreen}
                />
              </TabPane>
            </Tabs>
          </MagicCard>
          <SFExpressModal />
        </Content>
      </div>
    );
  }
}
