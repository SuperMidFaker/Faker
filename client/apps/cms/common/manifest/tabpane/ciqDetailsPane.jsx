import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Table } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import messages from '../../form/message.i18n';
import { format } from 'client/common/i18n/helpers';
const formatMsg = format(messages);
import { buildTipItems } from 'client/common/customs';

@injectIntl
@connect(
  state => ({
    units: state.cmsManifest.params.units.map(un => ({
      value: un.unit_code,
      text: un.unit_name,
    })),
    countries: state.cmsManifest.params.tradeCountries.map(tc => ({
      value: tc.cntry_co,
      text: tc.cntry_name_cn,
    })),
    currencies: state.cmsManifest.params.currencies.map(cr => ({
      value: cr.curr_code,
      text: cr.curr_name,
    })),
    exemptions: state.cmsManifest.params.exemptionWays.map(ep => ({
      value: ep.value,
      text: ep.text,
    })),
  })
)
export default class ManifestLegalInspection extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    filterProducts: PropTypes.array.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const { filterProducts } = this.props;
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
      title: this.msg('codeT'),
      width: 110,
      dataIndex: 'codes',
    }, {
      title: this.msg('gName'),
      width: 200,
      dataIndex: 'g_name',
    }, {
      title: '海关监管条件',
      dataIndex: 'customs',
      width: 250,
      render: col => buildTipItems(col),
    }, {
      title: '检验检疫类别',
      dataIndex: 'inspection',
      width: 250,
      render: col => buildTipItems(col, true),
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
      render: (o) => {
        const unit = this.props.units.filter(cur => cur.value === o)[0];
        const text = unit ? `${unit.value}| ${unit.text}` : o;
        return text;
      },
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
      render: (o) => {
        const currency = this.props.currencies.filter(cur => cur.value === o)[0];
        const text = currency ? `${currency.value}| ${currency.text}` : o;
        return text;
      },
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
      render: (o) => {
        const unit = this.props.units.filter(cur => cur.value === o)[0];
        const text = unit ? `${unit.value}| ${unit.text}` : o;
        return text;
      },
    }, {
      title: <div className="cell-align-right">{this.msg('qty2')}</div>,
      width: 80,
      className: 'cell-align-right',
      dataIndex: 'qty_2',
    }, {
      title: this.msg('unit2'),
      width: 80,
      dataIndex: 'unit_2',
      render: (o) => {
        const unit = this.props.units.filter(cur => cur.value === o)[0];
        const text = unit ? `${unit.value}| ${unit.text}` : o;
        return text;
      },
    }, {
      title: this.msg('exemptionWay'),
      width: 80,
      dataIndex: 'duty_mode',
      render: (o) => {
        const exemption = this.props.exemptions.filter(cur => cur.value === o)[0];
        const text = exemption ? `${exemption.value}| ${exemption.text}` : o;
        return text;
      },
    }, {
      title: this.msg('ecountry'),
      width: 120,
      dataIndex: 'dest_country',
      render: (o) => {
        const country = this.props.countries.filter(cur => cur.value === o)[0];
        const text = country ? `${country.value}| ${country.text}` : o;
        return text;
      },
    }, {
      title: this.msg('icountry'),
      width: 120,
      dataIndex: 'orig_country',
      render: (o) => {
        const country = this.props.countries.filter(cur => cur.value === o)[0];
        const text = country ? `${country.value}| ${country.text}` : o;
        return text;
      },
    }];
    return (
      <div className="panel-body table-panel">
        <Table columns={columns} dataSource={filterProducts}
          scroll={{ x: columns.reduce((acc, cur) => acc + (cur.width ? cur.width : 200), 0) }}
        />
      </div>
    );
  }
}
