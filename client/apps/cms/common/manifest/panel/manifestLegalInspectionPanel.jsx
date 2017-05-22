import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Table } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import messages from '../../form/message.i18n';
import { format } from 'client/common/i18n/helpers';
const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    billBodies: state.cmsManifest.billBodies,
  }),
  {}
)

export default class ManifestLegalInspection extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ietype: PropTypes.string.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const { billBodies, ietype } = this.props;
    let filterProducts = [];
    if (ietype === 'import') {
      filterProducts = billBodies.filter(item => item.customs.indexOf('A') !== -1);
    } else {
      filterProducts = billBodies.filter(item => item.customs.indexOf('B') !== -1);
    }

    const columns = [{
      title: this.msg('seqNumber'),
      dataIndex: 'g_no',
      fixed: 'left',
      width: 45,
    }, {
      title: this.msg('copGNo'),
      fixed: 'left',
      width: 150,
      dataIndex: 'cop_g_no',
    }, {
      title: this.msg('emGNo'),
      width: 100,
      dataIndex: 'em_g_no',
    }, {
      title: this.msg('codeT'),
      width: 110,
      dataIndex: 'code_t',
    }, {
      title: this.msg('gName'),
      width: 200,
      dataIndex: 'g_name',
    }, {
      title: this.msg('gModel'),
      width: 300,
      dataIndex: 'g_model',
    }, {
      title: <div className="cell-align-right">{this.msg('quantity')}</div>,
      width: 80,
      className: 'cell-align-right',
      dataIndex: 'g_qty',
    }, {
      title: this.msg('unit'),
      width: 80,
      className: 'cell-align-right',
      dataIndex: 'g_unit',
    }, {
      title: <div className="cell-align-right">{this.msg('decPrice')}</div>,
      width: 100,
      className: 'cell-align-right',
      dataIndex: 'dec_price',
    }, {
      title: <div className="cell-align-right">{this.msg('decTotal')}</div>,
      width: 100,
      className: 'cell-align-right',
      dataIndex: 'trade_total',
    }, {
      title: this.msg('currency'),
      width: 100,
      dataIndex: 'trade_curr',
    }, {
      title: <div className="cell-align-right">{this.msg('grosswt')}</div>,
      width: 80,
      className: 'cell-align-right',
      dataIndex: 'gross_wt',
    }, {
      title: <div className="cell-align-right">{this.msg('netwt')}</div>,
      width: 80,
      className: 'cell-align-right',
      dataIndex: 'wet_wt',
    }, {
      title: <div className="cell-align-right">{this.msg('qty1')}</div>,
      width: 80,
      className: 'cell-align-right',
      dataIndex: 'qty_1',
    }, {
      title: this.msg('unit1'),
      width: 80,
      dataIndex: 'unit_1',
    }, {
      title: <div className="cell-align-right">{this.msg('qty2')}</div>,
      width: 80,
      className: 'cell-align-right',
      dataIndex: 'qty_2',
    }, {
      title: this.msg('unit2'),
      width: 80,
      dataIndex: 'unit_2',
    }, {
      title: this.msg('exemptionWay'),
      width: 80,
      dataIndex: 'duty_mode',
    }, {
      title: this.msg('ecountry'),
      width: 120,
      dataIndex: 'dest_country',
    }, {
      title: this.msg('icountry'),
      width: 120,
      dataIndex: 'orig_country',
    }, {
      title: this.msg('qtyPcs'),
      width: 100,
      dataIndex: 'qty_pcs',
    }, {
      title: this.msg('unitPcs'),
      width: 100,
      dataIndex: 'unit_pcs',
    }, {
      title: this.msg('element'),
      width: 380,
      dataIndex: 'element',
    }, {
      title: this.msg('versionNo'),
      width: 80,
      dataIndex: 'version_no',
    }, {
      title: <div className="cell-align-right">{this.msg('processingFees')}</div>,
      width: 80,
      className: 'cell-align-right',
      dataIndex: 'processing_fees',
    }];
    return (
      <div className="panel-body table-panel">
        <Table columns={columns} dataSource={filterProducts} scroll={{ x: 3000 }} />
      </div>
    );
  }
}
