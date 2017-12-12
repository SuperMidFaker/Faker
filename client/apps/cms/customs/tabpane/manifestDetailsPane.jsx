import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Tag } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import messages from '../../common/message.i18n';
import DataPane from 'client/components/DataPane';
import Summary from 'client/components/Summary';
import { format } from 'client/common/i18n/helpers';

const formatMsg = format(messages);

function calculateTotal(bodies, currencies) {
  let totGrossWt = 0;
  let totWetWt = 0;
  let totTrade = 0;
  let totPcs = 0;
  for (let i = 0; i < bodies.length; i++) {
    const body = bodies[i];
    if (body.gross_wt) {
      totGrossWt += Number(body.gross_wt);
    }
    if (body.wet_wt) {
      totWetWt += Number(body.wet_wt);
    }
    if (body.trade_total) {
      const currency = currencies.find(curr => curr.value === body.trade_curr);
      const rate = currency ? currency.rate_cny : 1;
      totTrade += Number(body.trade_total * rate);
    }
    if (body.qty_pcs) {
      totPcs += Number(body.qty_pcs);
    }
  }
  return { totGrossWt, totWetWt, totTrade, totPcs };
}

@injectIntl
@connect(
  state => ({
    billDetails: state.cmsManifest.billDetails,
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
  }),
)
export default class ManifestDetailsPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    billDetails: PropTypes.array.isRequired,
  }
  constructor(props) {
    super(props);
    const calresult = calculateTotal(props.billDetails, props.currencies);
    this.state = {
      totGrossWt: calresult.totGrossWt,
      totWetWt: calresult.totWetWt,
      totTrade: calresult.totTrade,
      totPcs: calresult.totPcs,
    };
  }
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const { billDetails } = this.props;
    const { totGrossWt, totWetWt, totTrade } = this.state;
    const columns = [{
      title: this.msg('seqNumber'),
      dataIndex: 'g_no',
      fixed: 'left',
      className: 'cell-align-center',
      width: 45,
    }, {
      title: this.msg('copGNo'),
      fixed: 'left',
      width: 150,
      dataIndex: 'cop_g_no',
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
      width: 400,
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
        return text && text.length > 0 ? <Tag>{text}</Tag> : <span />;
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
        return text && text.length > 0 ? <Tag>{text}</Tag> : <span />;
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
        return text && text.length > 0 ? <Tag>{text}</Tag> : <span />;
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
        return text && text.length > 0 ? <Tag>{text}</Tag> : <span />;
      },
    }, {
      title: this.msg('exemptionWay'),
      width: 80,
      dataIndex: 'duty_mode',
      render: (o) => {
        const exemption = this.props.exemptions.filter(cur => cur.value === o)[0];
        const text = exemption ? `${exemption.value}| ${exemption.text}` : o;
        return text && text.length > 0 ? <Tag>{text}</Tag> : <span />;
      },
    }, {
      title: this.msg('ecountry'),
      width: 120,
      dataIndex: 'dest_country',
      render: (o) => {
        const country = this.props.countries.filter(cur => cur.value === o)[0];
        const text = country ? `${country.value}| ${country.text}` : o;
        return text && text.length > 0 ? <Tag>{text}</Tag> : <span />;
      },
    }, {
      title: this.msg('icountry'),
      dataIndex: 'orig_country',
      render: (o) => {
        const country = this.props.countries.filter(cur => cur.value === o)[0];
        const text = country ? `${country.value}| ${country.text}` : o;
        return text && text.length > 0 ? <Tag>{text}</Tag> : <span />;
      },
    }];
    return (
      <DataPane fullscreen={this.props.fullscreen}
        columns={columns} bordered scrollOffset={312}
        dataSource={billDetails} rowKey="id"
      >
        <DataPane.Toolbar>
          <DataPane.Actions>
            <Summary>
              <Summary.Item label="总毛重" addonAfter="KG">{totGrossWt.toFixed(3)}</Summary.Item>
              <Summary.Item label="总净重" addonAfter="KG">{totWetWt.toFixed(3)}</Summary.Item>
              <Summary.Item label="总金额" addonAfter="元">{totTrade.toFixed(3)}</Summary.Item>
            </Summary>
          </DataPane.Actions>
        </DataPane.Toolbar>
      </DataPane>
    );
  }
}
