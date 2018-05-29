import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Icon, message } from 'antd';
import JsBarcode from 'jsbarcode';
import { intlShape, injectIntl } from 'react-intl';
import { loadPrintPickDetails } from 'common/reducers/cwmOutbound';
import { CWM_OUTBOUND_STATUS, PICK_PRINT_FIELDS } from 'common/constants';
import { formatMsg } from '../../message.i18n';

function textToBase64Barcode(text) {
  const canvas = document.createElement('canvas');
  JsBarcode(canvas, text, { text, fontSize: 24 });
  return canvas.toDataURL('image/png');
}

const PICK_PRINT_FIELD_PDFTABLE = {};
PICK_PRINT_FIELDS.forEach((ppf) => { PICK_PRINT_FIELD_PDFTABLE[ppf.field] = ppf.width; });

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
  msg = formatMsg(this.props.intl);
  pdfPickHead = () => {
    const { outboundHead, defaultWhse, outboundNo } = this.props;
    const barcode = textToBase64Barcode(outboundNo);
    const headContent = [
      {
        columns: [
          { text: '', width: 150 },
          { text: '拣货单', style: 'title', alignment: 'center' },
          { image: barcode, width: 150, alignment: 'right' },
        ],
      },
      {
        columns: [
          { text: `出库单号:  ${outboundNo || ''}`, style: 'header' },
          { text: `客户单号:  ${outboundHead.cust_order_no || ''}`, style: 'header' },
          { text: `订单数量:  ${outboundHead.total_alloc_qty || ''}`, style: 'header' },
        ],
      },
      {
        columns: [
          { text: `货物属性:  ${outboundHead.bonded ? '保税' : '非保税'}`, style: 'header' },
          { text: `客户:  ${outboundHead.owner_name || ''}`, style: 'header' },
          { text: `仓库:  ${defaultWhse.name || ''}`, style: 'header' },
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
  pdfPickDetails = (pickDetails, pdfBodyTable, printRule) => {
    const bodyHeader = [];
    const pdfBody = pdfBodyTable.body;
    pdfBodyTable.widths.push(25);
    bodyHeader.push({ text: '项', style: 'tableHeader' });
    printRule.columns.forEach((rule) => {
      pdfBodyTable.widths.push(PICK_PRINT_FIELD_PDFTABLE[rule.key]);
      bodyHeader.push({ text: rule.text, style: 'tableHeader' });
    });
    pdfBodyTable.widths.push('*');
    bodyHeader.push({ text: '待拣数', style: 'tableHeader' });
    if (printRule.remain) {
      pdfBodyTable.widths.push('*');
      bodyHeader.push({ text: '余量数', style: 'tableHeader' });
    }
    pdfBodyTable.widths.push('*');
    bodyHeader.push({ text: '实拣数', style: 'tableHeader' });
    const { outboundHead } = this.props;
    pdfBody.push(bodyHeader);
    for (let i = 0; i < pickDetails.length; i++) {
      const data = pickDetails[i];
      const pickBody = [i + 1];
      printRule.columns.forEach((rule) => {
        pickBody.push(data[rule.key] || '');
      });
      pickBody.push(data.alloc_qty);
      if (printRule.remain) {
        const remQty = (data.stock_qty - data.alloc_qty) + data.shipped_qty;
        pickBody.push(remQty);
      }
      const pickedQty = data.picked_qty === 0 ? '' : data.picked_qty;
      pickBody.push(pickedQty);
      pdfBody.push(pickBody);
    }
    const totalBody = ['合计'].concat(printRule.columns.map(() => ''))
      .concat(outboundHead.total_alloc_qty, '');
    if (printRule.remain) {
      totalBody.push('');
    }
    pdfBody.push(totalBody);
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
          { text: '计划:', fontSize: 11 },
          { text: '收货:', fontSize: 11 },
          { text: '上架:', fontSize: 11 },
          { text: '归档:', fontSize: 11 },
        ],
      },
    ];
    return foot;
  }
  handleDocDef = (pickDetails, printRule) => {
    const docDefinition = {
      content: [],
      // pageOrientation: 'landscape',
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
          fontSize: 9,
          margin: [0, 3, 0, 4],
        },
        table: {
          fontSize: 9,
          color: 'black',
          alignment: 'center',
          margin: [2, 2, 2, 2],
        },
        tableHeader: {
          fontSize: 9,
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
    const pdfBodyTable = {
      widths: [],
      body: [],
    };
    this.pdfPickDetails(pickDetails, pdfBodyTable, printRule);
    docDefinition.content = [
      this.pdfPickHead(),
      {
        style: 'table',
        table: pdfBodyTable,
        layout: {
          vLineWidth(i, node) {
            return (i === 0 || i === node.table.widths.length - 1
              || i === node.table.widths.length) ? 1.2 : 0.5;
          },
          hLineWidth(i, node) {
            return (i === 0 || i === 1 || i === node.table.body.length - 1
              || i === node.table.body.length) ? 1.2 : 0.5;
          },
          paddingBottom(i, node) { return (node.table.body[i][0].text === '') ? 10 : 1; },
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
        const pickDetails = result.data.details;
        const printRule = result.data.print;
        const docDefinition = this.handleDocDef(pickDetails, printRule);
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
