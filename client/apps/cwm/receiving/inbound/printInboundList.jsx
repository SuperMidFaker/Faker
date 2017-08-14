import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Button, Tooltip } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import messages from '../message.i18n';
import { format } from 'client/common/i18n/helpers';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    defaultWhse: state.cwmContext.defaultWhse,
    inboundHead: state.cwmReceive.inboundFormHead,
    inboundProducts: state.cwmReceive.inboundProducts,
  }),
  { }
)

export default class Print extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    inboundNo: PropTypes.string.isRequired,
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
  msg = key => formatMsg(this.props.intl, key);
  pdfInboundHead = () => {
    const { inboundHead, defaultWhse, inboundNo } = this.props;
    const pdf = [];
    const header = [];
    header.push({ text: '入库单', style: 'tableHeader', colSpan: 6, alignment: 'center' }, {}, {}, {}, {}, {});
    pdf.push(header);
    pdf.push([{ text: '入库单号', style: 'table' }, { text: inboundNo, style: 'table' }, { text: '采购订单号', style: 'table' },
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
        '', '', inboundProducts[i].location, '']);
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
    return (
      <Tooltip title="打印入库单" placement="bottom">
        <Button size="large" icon="printer" onClick={this.handlePrint} />
      </Tooltip>
    );
  }
}
