import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Icon } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import messages from '../../message.i18n';
import { format } from 'client/common/i18n/helpers';
import JsBarcode from 'jsbarcode';

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
  {}
)

export default class Print extends Component {
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
        { text: '拣货单', style: 'title', alignment: 'center' },
      ] },
      { columns: [
        { text: '' },
        { image: barcode, width: 200 },
        { text: '' },
      ] },
      { columns: [
        { text: `入库单号:  ${outboundNo || ''}`, style: 'header' },
        { text: `客户订单号:  ${outboundHead.cust_order_no || ''}`, style: 'header' },
        { text: '出库日期:  ', style: 'header' },
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
  pdfPickDetails = () => {
    const { outboundHead, pickDetails } = this.props;
    let datas = [];
    if (pickDetails.length !== 16) {
      datas = pickDetails.concat([{}]);
    }
    const pdf = [];
    pdf.push([{ text: '项', style: 'tableHeader', alignment: 'center' }, { text: '货号', style: 'tableHeader', alignment: 'center' },
      { text: '产品名称', style: 'tableHeader', alignment: 'center' }, { text: '待捡数', style: 'tableHeader', alignment: 'center' },
      { text: '实件数', style: 'tableHeader', alignment: 'center' }, { text: '库位', style: 'tableHeader', alignment: 'center' },
      { text: '扩展属性1', style: 'tableHeader', alignment: 'center' }]);
    for (let i = 0; i < datas.length; i++) {
      const data = datas[i];
      pdf.push([i + 1, data.product_no || '', data.name || '', data.alloc_qty || '', '', data.location || '', '']);
    }
    pdf.push(['合计', '', '', outboundHead.total_alloc_qty, '', '', '']);
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
  handleDocDef = () => {
    const { pickDetails } = this.props;
    const docDefinition = {
      content: [],
      pageOrientation: 'landscape',
      pageSize: 'A4',
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
          fontSize: 10,
          color: 'black',
          margin: [2, 2, 2, 2],
        },
        tableHeader: {
          fontSize: 11,
          bold: true,
          color: 'black',
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
    if (pickDetails.length > 16) {
      num = 24 - (pickDetails.length - 16) % 24;
    } else {
      num = 16 - pickDetails.length;
    }
    docDefinition.content = [
      this.pdfPickHead(),
      {
        style: 'table',
        table: { widths: ['3%', '22%', '27%', '12%', '12%', '12%', '12%'], headerRows: 1, body: this.pdfPickDetails() },
        layout: {
          hLineColor: 'gray',
          vLineColor: 'gray',
          paddingBottom(i, node) { console.log(node.table.body, num); return (node.table.body[i][3].text === '') ? 10 * num : 1; },
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
        <Icon type={pickDetails.length > 0 ? 'check' : 'close'} /> <a disabled={!pickDetails.length > 0} onClick={this.handlePrint}>拣货单</a>
      </div>
    );
  }
}
