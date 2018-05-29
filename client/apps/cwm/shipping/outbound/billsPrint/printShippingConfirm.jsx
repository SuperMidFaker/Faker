import React, { Component } from 'react';
import PropTypes from 'prop-types';
import JsBarcode from 'jsbarcode';
import { connect } from 'react-redux';
import moment from 'moment';
import { Icon } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { formatMsg } from '../../message.i18n';

function textToBase64Barcode(text) {
  const canvas = document.createElement('canvas');
  JsBarcode(canvas, text, { text, fontSize: 24 });
  return canvas.toDataURL('image/png');
}

@injectIntl
@connect(state => ({
  defaultWhse: state.cwmContext.defaultWhse,
  outboundHead: state.cwmOutbound.outboundFormHead,
  pickDetails: state.cwmOutbound.pickDetails,
}))
export default class PrintShippingConfirm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    outboundNo: PropTypes.string.isRequired,
  }
  msg = formatMsg(this.props.intl);
  pdfHead = () => {
    const { outboundHead, defaultWhse, outboundNo } = this.props;
    const barcode = textToBase64Barcode(outboundNo);
    const headContent = [
      {
        columns: [
          { text: '', width: 150 },
          { text: '出库确认单', style: 'title', alignment: 'center' },
          { image: barcode, width: 150, alignment: 'right' },
        ],
      },
      {
        columns: [
          { text: `出库单号:  ${outboundNo || ''}`, style: 'header' },
          { text: `订单号:  ${outboundHead.cust_order_no || ''}`, style: 'header' },
          { text: '出库日期:  ', style: 'header' },
        ],
      },
      {
        columns: [
          { text: `业务编号:  ${outboundHead.so_no || ''}`, style: 'header' },
          { text: `客户:  ${outboundHead.owner_name || ''}`, style: 'header' },
          { text: `仓库:  ${defaultWhse.name || ''}`, style: 'header' },
        ],
      },
      {
        columns: [
          { text: '总体积:  ', style: 'header' },
          { text: '提货单号:  ', style: 'header' },
          { text: `收货人:  ${outboundHead.receiver_name || ''}`, style: 'header' },
        ],
      },
      {
        columns: [
          { text: '备注: ', style: 'header' },
        ],
      },
    ];
    return headContent;
  }
  pdfDetails = () => {
    const { outboundHead, pickDetails } = this.props;
    const pdf = [];
    pdf.push([
      { text: '项', style: 'detailTable' },
      { text: '仓库料号', style: 'detailTable' },
      { text: '包装说明', style: 'detailTable' },
      { text: '实拣数', style: 'detailTable' },
      { text: '库位', style: 'detailTable' },
      { text: '集箱箱号', style: 'detailTable' },
      { text: '净重(kg)', style: 'detailTable' },
      { text: '客户属性1', style: 'detailTable' },
      { text: '客户属性2', style: 'detailTable' },
      { text: '收货人', style: 'detailTable' },
    ]);
    for (let i = 0; i < pickDetails.length; i++) {
      const pd = pickDetails[i];
      pdf.push([i + 1, pd.product_no, '', pd.picked_qty, pd.location, pd.packed_no || '', '', '', '', '']);
    }
    if (pickDetails.length !== 15) {
      pdf.push(['', '', '', '', '', '', '', '', '', '']);
    }
    pdf.push(['合计', '', '', outboundHead.total_picked_qty, '', '', '', '', '', '']);
    return pdf;
  }
  pdfSign = () => {
    const foot = [
      {
        columns: [
          { text: moment(new Date()).format('YYYY/MM/DD'), fontSize: 9, alignment: 'right' },
        ],
      },
      {
        columns: [
          { text: '主管:', fontSize: 11 },
          { text: '出库复核:', fontSize: 11 },
          { text: '提货人:', fontSize: 11 },
          { text: '归档:', fontSize: 11 },
        ],
      },
    ];
    return foot;
  }
  handleDocDef = () => {
    const { pickDetails } = this.props;
    const docDefinition = {
      content: [],
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
        detailTable: {
          fontSize: 10,
          bold: true,
          color: 'black',
          margin: [2, 5, 2, 5],
          alignment: 'center',
        },
        table: {
          fontSize: 11,
          color: 'black',
          margin: [2, 2, 2, 2],
          alignment: 'center',
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
    if (pickDetails.length > 22) {
      num = 30 - ((pickDetails.length - 22) % 30);
    } else {
      num = 22 - pickDetails.length;
    }
    docDefinition.content = [
      this.pdfHead(),
      {
        style: 'table',
        table: { widths: [25, 100, 80, 50, 60, 80, 50, '*', '*', '*'], body: this.pdfDetails() },
        layout: {
          vLineWidth(i, node) {
            return (i === 0 || i === node.table.widths.length) ? 1.2 : 0.5;
          },
          hLineWidth(i, node) {
            return (((i === 0 || i === 1) || i === node.table.body.length - 1)
              || i === node.table.body.length) ? 1.2 : 0.5;
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
  }
  render() {
    const { pickDetails } = this.props;
    return (
      <div>
        <Icon type={pickDetails.length > 0 ? 'check' : 'close'} /> <a disabled={!pickDetails.length > 0} onClick={this.handlePrint}>出货确认单</a>
      </div>
    );
  }
}
