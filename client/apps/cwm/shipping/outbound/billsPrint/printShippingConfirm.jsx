import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Icon } from 'antd';
import { intlShape, injectIntl } from 'react-intl';

@injectIntl
@connect(
  state => ({
    defaultWhse: state.cwmContext.defaultWhse,
    outboundHead: state.cwmOutbound.outboundFormHead,
    pickDetails: state.cwmOutbound.pickDetails,
  }),
  {}
)

export default class PrintShippingConfirm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    outboundNo: PropTypes.string.isRequired,
  }
  pdfHead = () => {
    const { outboundHead, defaultWhse, outboundNo } = this.props;
    const pdf = [];
    const header = [];
    header.push({ text: '出库确认单', style: 'tableHeader', colSpan: 6, alignment: 'center' }, {}, {}, {}, {}, {});
    pdf.push(header);
    pdf.push([{ text: '出库单号', style: 'table' }, { text: outboundNo, style: 'table' }, { text: '订单号', style: 'table' },
      { text: outboundHead.cust_order_no, style: 'table' }, { text: '出库日期', style: 'table' }, { text: '', style: 'table' }]);
    pdf.push([{ text: '业务编号', style: 'table' }, { text: outboundHead.so_no, style: 'table' }, { text: '客户', style: 'table' },
      { text: outboundHead.owner_name, style: 'table' }, { text: '仓库', style: 'table' }, { text: defaultWhse.name, style: 'table' }]);
    pdf.push([{ text: '总体积', style: 'table' }, { text: '', style: 'table' }, { text: '提货单号', style: 'table' },
      { text: '', style: 'table' }, { text: '收货人', style: 'table' }, { text: outboundHead.receiver_name, style: 'table' }]);
    pdf.push([{ text: '备注', style: 'table' }, { text: outboundHead.receiver_address, colSpan: 5 }, {}, {}, {}, {}]);
    return pdf;
  }
  pdfDetails = () => {
    const { outboundHead, pickDetails } = this.props;
    const pdf = [];
    pdf.push([{ text: '货物清单', style: 'tableHeader', colSpan: 10, alignment: 'center' }, {}, {}, {}, {}, {}, {}, {}, {}, {}]);
    pdf.push([{ text: '项', style: 'detailTable' }, { text: '仓库料号', style: 'detailTable' },
      { text: '包装说明', style: 'detailTable' }, { text: '实捡数', style: 'detailTable' }, { text: '库位', style: 'detailTable' },
      { text: '集箱箱号', style: 'detailTable' }, { text: '净重(kg)', style: 'detailTable' },
      { text: '客户属性1', style: 'detailTable' }, { text: '客户属性2', style: 'detailTable' }, { text: '收货人', style: 'detailTable' },
    ]);
    for (let i = 0; i < pickDetails.length; i++) {
      pdf.push([i + 1, pickDetails[i].product_no, '', pickDetails[i].picked_qty, pickDetails[i].location, '', '', '', '', '']);
    }
    pdf.push(['合计', '', '', outboundHead.total_picked_qty, '', '', '', '', '', '']);
    return pdf;
  }
  pdfSign = () => {
    const pdf = [];
    pdf.push([{ text: '签字', style: 'tableHeader', colSpan: 8, alignment: 'center' }, {}, {}, {}, {}, {}, {}, {}]);
    pdf.push([{ text: '主管', style: 'table' }, '', { text: '出库复核', style: 'table' }, '', { text: '提货人', style: 'table' },
      '', { text: '归档', style: 'table' }, '']);
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
          margin: [0, 10, 0, 10],
        },
        detailTable: {
          fontSize: 9,
          margin: [0, 10, 0, 10],
          alignment: 'center',
        },
        tableHeader: {
          fontSize: 12,
          bold: true,
          margin: [0, 2, 0, 2],
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
        table: { widths: ['10%', '25%', '10%', '25%', '10%', '20%'], headerRows: 1, body: this.pdfHead() },
      },
      {
        style: 'detailTable',
        table: { widths: ['5%', '10%', '10%', '10%', '10%', '15%', '10%', '10%', '10%', '10%'], headerRows: 1, body: this.pdfDetails() },
      },
      {
        style: 'table',
        table: { widths: ['10%', '15%', '10%', '15%', '10%', '15%', '10%', '15%'], headerRows: 1, body: this.pdfSign() },
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
