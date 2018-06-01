import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { Icon } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { formatMsg } from '../../message.i18n';

@injectIntl
@connect(
  state => ({
    movementHead: state.cwmMovement.movementHead,
    movementDetails: state.cwmMovement.movementDetails,
  }),
  {}
)
export default class OutboundPickPrint extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  msg = formatMsg(this.props.intl);
  pdfHead = () => {
    const { movementHead } = this.props;
    const headContent = [
      {
        columns: [
          { text: '移库单', style: 'title', alignment: 'center' },
        ],
      },
      {
        columns: [
          { text: `移库单号:  ${movementHead.movement_no || ''}`, style: 'header' },
          { text: `指令单号:  ${movementHead.transaction_no || ''}`, style: 'header' },
        ],
      },
    ];
    return headContent;
  }
  pdfDetails = () => {
    const { movementDetails } = this.props;
    const body = [];
    body.push([
      { text: '商品货号', style: 'tableHeader' },
      { text: '商品名称', style: 'tableHeader' },
      { text: '原库位', style: 'tableHeader' },
      { text: '目标库位', style: 'tableHeader' },
      { text: '数量', style: 'tableHeader' },
    ]);
    for (let i = 0; i < movementDetails.length; i++) {
      const md = movementDetails[i];
      body.push([
        md.product_no,
        md.name,
        md.from_location,
        md.to_location,
        md.move_qty,
      ]);
    }
    const total = movementDetails.reduce((prev, next) => prev + Number(next.move_qty), 0);
    body.push(['总计', '', '', '', `${total}`]);
    return body;
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
          { text: '计划/时间:', fontSize: 11 },
          { text: '拣货/时间:', fontSize: 11 },
          { text: '复核/时间:', fontSize: 11 },
          { text: '归档/时间:', fontSize: 11 },
        ],
      },
    ];
    return foot;
  }
  handleDocDef = () => {
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
          margin: [0, 0, 0, 0],
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
    docDefinition.content.push(this.pdfHead());
    docDefinition.content.push({
      style: 'table',
      table: {
        widths: ['15%', '25%', '25%', '20%', '15%'],
        body: this.pdfDetails(),
      },
      layout: {
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
    });
    docDefinition.content.push(this.pdfSign());
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
    return (
      <div>
        <Icon type="check" />
        <a onClick={this.handlePrint}>移库单</a>
      </div>
    );
  }
}
