import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Icon } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { formatMsg } from '../../message.i18n';

@injectIntl
@connect(
  state => ({
    defaultWhse: state.cwmContext.defaultWhse,
    outboundHead: state.cwmOutbound.outboundFormHead,
    pickDetails: state.cwmOutbound.pickDetails,
  }),
  {}
)

export default class PrintShippingList extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    pickDetails: PropTypes.arrayOf(PropTypes.shape({ picked_qty: PropTypes.number.isRequired })),
  }
  msg = formatMsg(this.props.intl)
  pdfHead = () => {
    const { outboundHead } = this.props;
    const header = [
      { text: `客户名称:   ${outboundHead.owner_name}`, style: 'content' },
      { text: `订单编号:   ${outboundHead.cust_order_no || ''}`, style: 'content' },
      { text: `送货地址:   ${outboundHead.receiver_address || ''}`, style: 'content' },
    ];
    return header;
  }
  pdfTable = () => {
    const { pickDetails } = this.props;
    const body = [];
    body.push([
      { text: '序号', style: 'tableHeader' },
      { text: '产品编号', style: 'tableHeader' },
      { text: '产品描述', style: 'tableHeader' },
      { text: '数量', style: 'tableHeader' },
    ]);
    for (let i = 0; i < pickDetails.length; i++) {
      const sp = pickDetails[i];
      body.push([i + 1, sp.product_no, sp.name, sp.picked_qty]);
    }
    const total = pickDetails.reduce((res, bsf) => ({
      shipped_qty: (res.shipped_qty || 0) + (bsf.shipped_qty || 0),
    }), {
      shipped_qty: 0,
    });
    body.push(['总计', '', '', `${total.shipped_qty}`]);
    return body;
  }
  handleDocDef = () => {
    const docDefinition = {
      content: [],
      styles: {
        title: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 20, 0, 20],
        },
        content: {
          fontSize: 10,
          margin: [10, 0, 5, 10],
        },
        table: {
          fontSize: 10,
          alignment: 'center',
        },
        tableHeader: {
          fontSize: 10,
          alignment: 'center',
        },
        footer: {
          fontSize: 10,
          bold: true,
          margin: [2, 4, 90, 2],
        },
      },
      defaultStyle: {
        font: 'yahei',
      },
    };
    docDefinition.content = [
      { text: '发  货  清  单', style: 'title' },
    ];
    docDefinition.content.push(this.pdfHead());
    docDefinition.content.push({
      style: 'table',
      table: { widths: ['10%', '25%', '45%', '20%'], body: this.pdfTable() },
      layout: {
        hLineColor: 'gray',
        vLineColor: 'gray',
      },
    });
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
        <Icon type={pickDetails.length > 0 ? 'check' : 'close'} /> <a disabled={!pickDetails.length > 0} onClick={this.handlePrint}>发货清单</a>
      </div>
    );
  }
}
