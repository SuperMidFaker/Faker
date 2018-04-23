import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Tag } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { showDeclElementsModal } from 'common/reducers/cmsManifest';
import { getElementByHscode } from 'common/reducers/cmsHsCode';
import { buildTipItems } from 'client/common/customs';
import Summary from 'client/components/Summary';
import DataPane from 'client/components/DataPane';
import DeclElementsModal from '../../common/modal/declElementsModal';
import { formatMsg } from '../../common/message.i18n';

function ColumnInput(props) {
  const { record, field, decimal } = props;
  if (decimal) {
    return <span>{record[field] ? parseFloat(record[field]).toFixed(decimal) : ''}</span>;
  }
  return <span>{record[field] || ''}</span>;
}
ColumnInput.propTypes = {
  record: PropTypes.shape({ id: PropTypes.number }).isRequired,
  field: PropTypes.string.isRequired,
  decimal: PropTypes.number,
};

function ColumnSelect(props) {
  const { record, field, options } = props;
  const foundOpts = options.filter(opt => opt.value === record[field]);
  const label = foundOpts.length === 1 ? `${foundOpts[0].value}|${foundOpts[0].text}` : '';
  return label && label.length > 0 ? <Tag>{label}</Tag> : <span />;
}
ColumnSelect.propTypes = {
  record: PropTypes.shape({ id: PropTypes.number }).isRequired,
  field: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    text: PropTypes.string,
    value: PropTypes.string,
    key: PropTypes.string,
  })).isRequired,
};

function calculateTotal(bodies, currencies) {
  let totGrossWt = 0;
  let totWetWt = 0;
  let totTrade = 0;
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
  }
  return {
    totGrossWt, totWetWt, totTrade,
  };
}

@injectIntl
@connect(state => ({
  tenantId: state.account.tenantId,
  units: state.cmsManifest.params.units.map(un => ({
    value: un.unit_code,
    text: un.unit_name,
    search: `${un.unit_code}${un.unit_name}`,
  })),
  countries: state.cmsManifest.params.tradeCountries.map(tc => ({
    value: tc.cntry_co,
    text: tc.cntry_name_cn,
    search: `${tc.cntry_co}${tc.cntry_name_en}${tc.cntry_name_cn}${tc.cntry_en_short}`,
  })),
  currencies: state.cmsManifest.params.currencies.map(cr => ({
    value: cr.curr_code,
    text: cr.curr_name,
    search: `${cr.curr_code}${cr.curr_symb}${cr.curr_name}`,
    rate_cny: cr.rate_CNY,
  })),
  exemptions: state.cmsManifest.params.exemptionWays.map(ep => ({
    value: ep.value,
    text: ep.text,
    search: `${ep.value}${ep.text}`,
  })),
  loginId: state.account.loginId,
  billHead: state.cmsManifest.billHead,
  bodyItem: state.cmsTradeitem.bodyItem,
  bodyHscode: state.cmsTradeitem.bodyHscode,
  entryHead: state.cmsManifest.entryHead,
}), { showDeclElementsModal, getElementByHscode })
export default class CusDeclBodyPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    data: PropTypes.arrayOf(PropTypes.shape({ g_no: PropTypes.string })).isRequired,
    headNo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }
  constructor(props) {
    super(props);
    const bodies = props.data;
    const calresult = calculateTotal(bodies, props.currencies);
    this.state = {
      editBody: {},
      bodies,
      totGrossWt: calresult.totGrossWt,
      totWetWt: calresult.totWetWt,
      totTrade: calresult.totTrade,
      pagination: {
        current: 1,
        total: 0,
        pageSize: 8,
        showQuickJumper: false,
        onChange: this.handlePageChange,
      },

    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data) {
      const bodies = [...nextProps.data];
      const calresult = calculateTotal(bodies, this.props.currencies);
      this.setState({
        bodies,
        totGrossWt: calresult.totGrossWt,
        totWetWt: calresult.totWetWt,
        totTrade: calresult.totTrade,
        pagination: { ...this.state.pagination, total: bodies.length },
      });
    }
    if (nextProps.bodyItem !== this.props.bodyItem) {
      const item = nextProps.bodyItem;
      if (item) {
        const unit1 = this.props.units.filter(unit => unit.value === item.unit_1)[0];
        const unit1Val = unit1 ? unit1.value : '';
        const unit2 = this.props.units.filter(unit => unit.value === item.unit_2)[0];
        const unit2Val = unit2 ? unit2.value : '';
        const unitg = this.props.units.filter(unit => unit.value === item.g_unit)[0];
        const gunitVal = unitg ? unitg.value : '';
        this.setState({
          editBody: {
            ...this.state.editBody,
            codes: item.hscode,
            g_name: item.g_name,
            g_model: item.g_model,
            element: item.element,
            g_unit: gunitVal,
            unit_1: unit1Val,
            unit_2: unit2Val,
            fixed_unit: item.fixed_unit,
            fixed_qty: item.fixed_qty,
          },
        });
      } else {
        this.setState({
          editBody: {
            ...this.state.editBody,
            codes: '',
            g_name: '',
            g_model: '',
            element: '',
            g_unit: '',
            unit_1: '',
            unit_2: '',
          },
        });
      }
    }
    if (nextProps.bodyHscode !== this.props.bodyHscode) {
      const hscode = nextProps.bodyHscode;
      if (hscode) {
        const unit1 = this.props.units.filter(unit => unit.text === hscode.first_unit)[0];
        const unit1Val = unit1 ? unit1.value : '';
        const unit2 = this.props.units.filter(unit => unit.text === hscode.second_unit)[0];
        const unit2Val = unit2 ? unit2.value : '';
        this.setState({
          editBody: {
            ...this.state.editBody,
            g_name: hscode.product_name,
            element: hscode.declared_elements,
            unit_1: unit1Val,
            unit_2: unit2Val,
          },
        });
      } else {
        this.setState({
          editBody: {
            ...this.state.editBody,
            g_name: '',
            element: '',
            unit_1: '',
            unit_2: '',
          },
        });
      }
    }
  }
  msg = formatMsg(this.props.intl)


    columns = [{
      title: this.msg('itemNo'),
      dataIndex: 'g_no',
      fixed: 'left',
      width: 45,
      align: 'center',
    }, {
      title: this.msg('codeT'),
      width: 110,
      fixed: 'left',
      render: (o, record) =>
        (<ColumnInput
          field="codes"
          record={record}
        />),
    }, {
      title: this.msg('gName'),
      width: 200,
      render: (o, record) =>
        (<ColumnInput
          field="g_name"
          record={record}
        />),
    }, {
      title: this.msg('gModel'),
      width: 400,
      onCellClick: record => this.handleShowDeclElementModal(record),
      render: (o, record) =>
        (<ColumnInput
          field="g_model"
          record={record}
        />),
    }, {
      title: <div className="cell-align-right">{this.msg('quantity')}</div>,
      width: 80,
      align: 'right',
      render: (o, record) =>
        (<ColumnInput
          field="g_qty"
          record={record}
        />),
    }, {
      title: this.msg('unit'),
      width: 80,
      align: 'center',
      render: (o, record) =>
        (<ColumnSelect
          field="g_unit"
          record={record}
          options={this.props.units}
        />),
    }, {
      title: <div className="cell-align-right">{this.msg('decPrice')}</div>,
      width: 100,
      align: 'right',
      render: (o, record) =>
        (<ColumnInput
          field="dec_price"
          record={record}
        />),
    }, {
      title: <div className="cell-align-right">{this.msg('decTotal')}</div>,
      width: 100,
      align: 'right',
      render: (o, record) =>
        (<ColumnInput
          field="trade_total"
          record={record}
        />),
    }, {
      title: this.msg('currency'),
      width: 100,
      align: 'center',
      render: (o, record) =>
        (<ColumnSelect
          field="trade_curr"
          record={record}
          options={this.props.currencies}
        />),
    }, {
      title: <div className="cell-align-right">{this.msg('grosswt')}</div>,
      width: 80,
      align: 'right',
      render: (o, record) =>
        (<ColumnInput
          field="gross_wt"
          record={record}
        />),
    }, {
      title: <div className="cell-align-right">{this.msg('netwt')}</div>,
      width: 80,
      align: 'right',
      render: (o, record) =>
        (<ColumnInput
          field="wet_wt"
          record={record}
        />),
    }, {
      title: <div className="cell-align-right">{this.msg('qty1')}</div>,
      width: 80,
      align: 'right',
      render: (o, record) =>
        (<ColumnInput
          field="qty_1"
          record={record}
        />),
    }, {
      title: this.msg('unit1'),
      width: 80,
      align: 'center',
      render: (o, record) =>
        (<ColumnSelect
          field="unit_1"
          record={record}
          options={this.props.units}
        />),
    }, {
      title: <div className="cell-align-right">{this.msg('qty2')}</div>,
      width: 80,
      align: 'right',
      render: (o, record) =>
        (<ColumnInput
          field="qty_2"
          record={record}
        />),
    }, {
      title: this.msg('unit2'),
      width: 80,
      align: 'center',
      render: (o, record) =>
        (<ColumnSelect
          field="unit_2"
          record={record}
          options={this.props.units}
        />),
    }, {
      title: this.msg('exemptionWay'),
      width: 100,
      render: (o, record) =>
        (<ColumnSelect
          field="duty_mode"
          record={record}
          options={this.props.exemptions}
        />),
    }, {
      title: this.msg('destCountry'),
      width: 120,
      render: (o, record) =>
        (<ColumnSelect
          field="dest_country"
          record={record}
          options={this.props.countries}
        />),
    }, {
      title: this.msg('origCountry'),
      width: 120,
      render: (o, record) =>
        (<ColumnSelect
          field="orig_country"
          record={record}
          options={this.props.countries}
        />),
    }, {
      title: this.msg('customs'),
      width: 150,
      dataIndex: 'customs',
      render: col => buildTipItems(col),
    }, {
      title: this.msg('inspection'),
      dataIndex: 'inspection',
      render: col => buildTipItems(col, true),
    }];

  handleShowDeclElementModal = (record) => {
    this.props.getElementByHscode(record.codes).then((result) => {
      if (!result.error) {
        this.props.showDeclElementsModal(
          result.data.declared_elements,
          record.id, record.g_model,
          true,
          record.g_name,
        );
      }
    });
  }
  handlePageChange = (current) => {
    this.setState({
      pagination: {
        ...this.state.pagination,
        current,
      },
    });
  }
  handleEntrybodyExport = () => {
    const preSeqNo = this.props.entryHead.pre_entry_seq_no;
    const timestamp = Date.now().toString().substr(-6);
    window.open(`${API_ROOTS.default}v1/cms/manifest/declare/export/entry_${preSeqNo}_${timestamp}.xlsx?headId=${this.props.headNo}`);
  }
  render() {
    const { totGrossWt, totWetWt, totTrade } = this.state;
    return (
      <DataPane
        columns={this.columns}
        bordered
        dataSource={this.state.bodies}
        rowKey="id"
        loading={this.state.loading}
      >
        <DataPane.Toolbar>
          <Button icon="export" onClick={this.handleEntrybodyExport}>导出表体数据</Button>
          <DataPane.Extra>
            <Summary>
              <Summary.Item label="总毛重" addonAfter="KG">{totGrossWt.toFixed(2)}</Summary.Item>
              <Summary.Item label="总净重" addonAfter="KG">{totWetWt.toFixed(3)}</Summary.Item>
              <Summary.Item label="总金额" addonAfter="元">{totTrade.toFixed(2)}</Summary.Item>
            </Summary>
          </DataPane.Extra>
        </DataPane.Toolbar>
        <DeclElementsModal />
      </DataPane>
    );
  }
}
