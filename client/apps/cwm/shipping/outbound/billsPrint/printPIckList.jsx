import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Icon, message } from 'antd';
import JsBarcode from 'jsbarcode';
import { intlShape, injectIntl } from 'react-intl';
import { loadPrintPickDetails } from 'common/reducers/cwmOutbound';
import { CWM_OUTBOUND_STATUS } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';

const formatMsg = format(messages);

function textToBase64Barcode(text) {
  const canvas = document.createElement('canvas');
  JsBarcode(canvas, text, { text, fontSize: 24 });
  return canvas.toDataURL('image/png');
}

@injectIntl
@connect(
  state => ({
    defaultWhse: state.cwmContext.defaultWhse,
    outboundHead: state.cwmOutbound.outboundFormHead,
    pickDetails: state.cwmOutbound.pickDetails,
  }),
  { loadPrintPickDetails }
)
export default class OutboundPickPrint extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    outboundNo: PropTypes.string.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);
  pdfPickHead = () => {
    const { outboundHead, defaultWhse, outboundNo } = this.props;
    const barcode = textToBase64Barcode(outboundNo);
    const headContent = [
      { columns: [
        { text: '', width: 150 },
        { text: '拣货单', style: 'title', alignment: 'center' },
        { image: barcode, width: 150, alignment: 'right' },
      ] },
      { columns: [
        { text: `出库单号:  ${outboundNo || ''}`, style: 'header' },
        { text: `客户订单号:  ${outboundHead.cust_order_no || ''}`, style: 'header' },
        { text: `订单数量:  ${outboundHead.total_alloc_qty || ''}`, style: 'header' },
      ] },
      { columns: [
        { text: `货物属性:  ${outboundHead.bonded ? '保税' : '非保税'}`, style: 'header' },
        { text: `客户:  ${outboundHead.owner_name || ''}`, style: 'header' },
        { text: `仓库:  ${defaultWhse.name || ''}`, style: 'header' },
      ] },
      { columns: [
        { text: '备注: ', style: 'header' },
      ] },
    ];
    return headContent;
  }
  pdfPickDetails = (pickDetails) => {
    const { outboundHead } = this.props;
    const pdf = [];
    pdf.push([
      { text: '项', style: 'tableHeader' },
      { text: '货号', style: 'tableHeader' },
      { text: '产品名称', style: 'tableHeader' },
      { text: '批次号', style: 'tableHeader' },
      { text: '库位', style: 'tableHeader' },
      { text: '待拣数', style: 'tableHeader' },
      { text: '余量数', style: 'tableHeader' },
      { text: '实拣数', style: 'tableHeader' }]);
    for (let i = 0; i < pickDetails.length; i++) {
      const data = pickDetails[i];
      const remQty = data.stock_qty - data.alloc_qty + data.shipped_qty;
      const pickedQty = data.picked_qty === 0 ? '' : data.picked_qty;
      pdf.push([i + 1, data.product_no || '', data.name || '', data.external_lot_no || '', data.location || '',
        data.alloc_qty, remQty, pickedQty]);
    }
    if (pickDetails.length !== 16) {
      pdf.push(['', '', '', '', '', '', '', '']);
    }
    pdf.push(['合计', '', '', '', '', outboundHead.total_alloc_qty, '', '']);
    return pdf;
  }
  pdfSign = () => {
    const foot = [
      { columns: [
        { text: moment(new Date()).format('YYYY/MM/DD'), fontSize: 9, alignment: 'right' },
      ] },
      { columns: [
        { text: '计划:', fontSize: 11 },
        { text: '收货:', fontSize: 11 },
        { text: '上架:', fontSize: 11 },
        { text: '归档:', fontSize: 11 },
      ] },
    ];
    return foot;
  }
  handleDocDef = (pickDetails) => {
    const docDefinition = {
      content: [],
      pageOrientation: 'landscape',
      pageSize: 'A4',
      pageMargins: [20, 15],
      styles: {
        title: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          width: '100%',
          margin: [0, 0, 0, 8],
        },
        header: {
          fontSize: 10,
          margin: [0, 3, 0, 4],
        },
        table: {
          fontSize: 11,
          color: 'black',
          alignment: 'center',
          margin: [2, 2, 2, 2],
        },
        tableHeader: {
          fontSize: 11,
          bold: true,
          color: 'black',
          alignment: 'center',
          margin: [2, 5, 2, 5],
        },
        footer: {
          fontSize: 8,
        },
      },
      defaultStyle: {
        font: 'yahei',
      },
    };
    let num = 0;
    if (pickDetails.length > 23) {
      num = 30 - (pickDetails.length - 23) % 30;
    } else {
      num = 23 - pickDetails.length;
    }
    docDefinition.content = [
      this.pdfPickHead(),
      {
        style: 'table',
        table: {
          widths: [25, 100, 120, 100, 60, '*', '*', '*'],
          body: this.pdfPickDetails(pickDetails),
        },
        layout: {
          vLineWidth(i, node) {
            return (i === 0 || i === node.table.widths.length - 1 || i === node.table.widths.length) ? 1.2 : 0.5;
          },
          hLineWidth(i, node) {
            return (i === 0 || i === 1 || i === node.table.body.length - 1 || i === node.table.body.length) ? 1.2 : 0.5;
          },
          paddingBottom(i, node) { return (node.table.body[i][0].text === '') ? 10 * num : 1; },
        },
      },
      this.pdfSign(),
    ];
    docDefinition.footer = (currentPage, pageCount) => ({ text: `第 ${currentPage.toString()}页，共 ${pageCount}页`, alignment: 'center', style: 'footer' });
    return docDefinition;
  }
  handlePrint = () => {
    this.props.loadPrintPickDetails(this.props.outboundNo).then((result) => {
      if (!result.error) {
        const pickDetails = result.data;
        const docDefinition = this.handleDocDef(pickDetails);
        window.pdfMake.fonts = {
          yahei: {
            normal: 'msyh.ttf',
            bold: 'msyh.ttf',
            italics: 'msyh.ttf',
            bolditalics: 'msyh.ttf',
          },
        };
        window.pdfMake.createPdf(docDefinition).open();
      } else {
        message.error(result.error.message);
      }
    });
  }
  render() {
    const { outboundHead } = this.props;
    const printable = outboundHead.status >= CWM_OUTBOUND_STATUS.PARTIAL_ALLOC.value;
    return (
      <div>
        <Icon type={printable ? 'check' : 'close'} />
        <a disabled={!printable} onClick={this.handlePrint}>拣货单</a>
      </div>
    );
  }
}
