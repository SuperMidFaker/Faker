import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import currencyFormatter from 'currency-formatter';
import { Card, Table, Tag, Popconfirm, message, Button } from 'antd';
import { loadPaneTax, taxRecalculate } from 'common/reducers/cmsDelgInfoHub';
import { CMS_FEE_UNIT } from 'common/constants';

const Column = Table.Column;

@injectIntl
@connect(
  state => ({
    delgNo: state.cmsDelgInfoHub.previewer.delegation.delg_no,
    taxTots: state.cmsDelgInfoHub.taxTots,
    taxMaps: state.cmsDelgInfoHub.taxMaps,
    trxModes: state.cmsDelgInfoHub.params.trxModes.map(tm => ({
      value: tm.trx_mode,
      text: `${tm.trx_spec}`,
    })),
  }),
  { loadPaneTax, taxRecalculate }
)
export default class DutyTaxPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    delgNo: PropTypes.string.isRequired,
    taxTots: PropTypes.array.isRequired,
    taxMaps: PropTypes.object.isRequired,
    trxModes: PropTypes.array.isRequired,
  }
  state = {
    sumval: [],
    recalLoading: false,
  }
  componentDidMount() {
    this.props.loadPaneTax(this.props.delgNo);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.delgNo !== this.props.delgNo) {
      this.setState({ sumval: [] });
      nextProps.loadPaneTax(nextProps.delgNo);
    }
    if (nextProps.taxTots !== this.props.taxTots && nextProps.taxTots.length > 0) {
      const sumval = nextProps.taxTots.reduce((a, b) => ({
        trxn_mode: '',
        duty_paid: a.duty_paid + b.duty_paid,
        duty_tax: a.duty_tax + b.duty_tax,
        excise_tax: a.excise_tax + b.excise_tax,
        vat_tax: a.vat_tax + b.vat_tax,
        total_tax: a.total_tax + b.total_tax,
      }), {
        trxn_mode: '',
        duty_paid: 0,
        duty_tax: 0,
        excise_tax: 0,
        vat_tax: 0,
        total_tax: 0,
      });
      this.setState({ sumval: [sumval] });
    }
  }
  columns = [{
    title: '报关单号',
    dataIndex: 'pre_entry_seq_no',
    width: 190,
    key: 'pre_entry_seq_no',
  }, {
    title: '完税价格',
    dataIndex: 'duty_paid',
    key: 'duty_paid',
    width: 110,
    className: 'cell-align-right',
    render(o) {
      return o ? currencyFormatter.format(o, { code: 'CNY' }) : '';
    },
  }, {
    title: '成交方式',
    dataIndex: 'trxn_mode',
    key: 'trxn_mode',
    width: 110,
    render: (o) => {
      const trxMd = this.props.trxModes.filter(tm => tm.value === o)[0];
      const trx = trxMd ? trxMd.text : '';
      return <Tag color="blue">{trx}</Tag>;
    },
  }, {
    title: '关税',
    dataIndex: 'duty_tax',
    key: 'duty_tax',
    width: 110,
    className: 'cell-align-right',
    render(o) {
      return o ? currencyFormatter.format(o, { code: 'CNY' }) : '';
    },
  }, {
    title: '增值税',
    dataIndex: 'vat_tax',
    key: 'vat_tax',
    width: 110,
    className: 'cell-align-right',
    render(o) {
      return o ? currencyFormatter.format(o, { code: 'CNY' }) : '';
    },
  }, {
    title: '消费税',
    dataIndex: 'excise_tax',
    key: 'excise_tax',
    className: 'cell-align-right',
    width: 110,
    render(o) {
      return o ? currencyFormatter.format(o, { code: 'CNY' }) : '';
    },
  }, {
    title: '税费总金额',
    dataIndex: 'total_tax',
    key: 'total_tax',
    width: 110,
    className: 'cell-align-right',
    render(o) {
      return o ? currencyFormatter.format(o, { code: 'CNY' }) : '';
    },
  }]
  subCols = [{
    title: '商品编码',
    dataIndex: 'hscode',
    key: 'hscode',
  }, {
    title: '运费/率',
    dataIndex: 'ship_fee',
    key: 'ship_fee',
    className: 'cell-align-right',
    render(o, record) {
      if (record.ship_mark === CMS_FEE_UNIT[1].value) {
        const val = o ? o * 100 : 0;
        return val ? `${val}%` : '';
      } else {
        return o ? o.toFixed(3) : '';
      }
    },
  }, {
    title: '保费/率',
    dataIndex: 'insur_fee',
    key: 'insur_fee',
    className: 'cell-align-right',
    render(o, record) {
      if (record.insur_mark === CMS_FEE_UNIT[1].value) {
        const val = o ? o * 100 : 0;
        return val ? `${val}%` : '';
      } else {
        return o ? o.toFixed(3) : '';
      }
    },
  }, {
    title: '杂费/率',
    dataIndex: 'other_fee',
    key: 'other_fee',
    className: 'cell-align-right',
    render(o, record) {
      if (record.other_mark === CMS_FEE_UNIT[1].value) {
        const val = o ? o * 100 : 0;
        return val ? `${val}%` : '';
      } else {
        return o ? o.toFixed(3) : '';
      }
    },
  }, {
    title: '完税价格',
    dataIndex: 'duty_paid',
    key: 'duty_paid',
    className: 'cell-align-right',
    render(o) {
      return o ? currencyFormatter.format(o, { code: 'CNY' }) : '';
    },
  }, {
    title: '关税率',
    dataIndex: 'duty_rate',
    key: 'duty_rate',
    className: 'cell-align-right',
    render(o) {
      const val = o ? o * 100 : 0;
      return val ? `${val}%` : '';
    },
  }, {
    title: '关税',
    dataIndex: 'duty_tax',
    key: 'duty_tax',
    className: 'cell-align-right',
    render(o) {
      return o ? currencyFormatter.format(o, { code: 'CNY' }) : '';
    },
  }, {
    title: '增值税率',
    dataIndex: 'vat_rates',
    key: 'vat_rates',
    className: 'cell-align-right',
    render(o) {
      const val = o ? o * 100 : 0;
      return val ? `${val}%` : '';
    },
  }, {
    title: '增值税',
    dataIndex: 'vat_tax',
    key: 'vat_tax',
    className: 'cell-align-right',
    render(o) {
      return o ? currencyFormatter.format(o, { code: 'CNY' }) : '';
    },
  }, {
    title: '消费税率',
    dataIndex: 'gst_rates',
    key: 'gst_rates',
    className: 'cell-align-right',
    render(o) {
      const val = o ? o * 100 : 0;
      return val ? `${val}%` : '';
    },
  }, {
    title: '消费税',
    dataIndex: 'excise_tax',
    key: 'excise_tax',
    className: 'cell-align-right',
    render(o) {
      return o ? currencyFormatter.format(o, { code: 'CNY' }) : '';
    },
  }, {
    title: '缴税金额',
    dataIndex: 'total_tax',
    key: 'total_tax',
    className: 'cell-align-right',
    render(o) {
      return o ? currencyFormatter.format(o, { code: 'CNY' }) : '';
    },
  }]
  handleExpandDetail = (row) => {
    const data = this.props.taxMaps[row.pre_entry_seq_no];
    return (
      <Table
        columns={this.subCols}
        dataSource={data}
        pagination={false}
        bordered
      />
    );
  }
  handleRecalculation = () => {
    this.setState({ recalLoading: true });
    this.props.taxRecalculate(this.props.delgNo).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.setState({ sumval: [], recalLoading: false });
        this.props.loadPaneTax(this.props.delgNo);
      }
    });
  }
  renderValFixed = o => o ? currencyFormatter.format(o, { code: 'CNY' }) : ''
  render() {
    const gridStyle = { width: `${1 / 6 * 100}%`, textAlign: 'center' };
    const tax = this.state.sumval[0] || {};
    return (
      <div className="pane-content tab-pane">
        <Card noHovering bodyStyle={{ padding: 0 }}>
          <Card.Grid style={gridStyle}>
            <div className="statistics-cell">
              <h3>完税价格</h3>
              <h2 className="data-num text-emphasis">{this.renderValFixed(tax.duty_paid)}</h2>
            </div>
          </Card.Grid>
          <Card.Grid style={gridStyle}>
            <h3>成交方式</h3>
            <h2 className="data-num text-emphasis" style={{ minHeight: 27 }}>{tax.trxn_mode || ' '}</h2>
          </Card.Grid>
          <Card.Grid style={gridStyle}>
            <div className="statistics-cell">
              <h3>关税</h3>
              <h2 className="data-num text-emphasis">{this.renderValFixed(tax.duty_tax)}</h2>
            </div>
          </Card.Grid>
          <Card.Grid style={gridStyle}>
            <div className="statistics-cell">
              <h3>增值税</h3>
              <h2 className="data-num text-emphasis">{this.renderValFixed(tax.vat_tax)}</h2>
            </div>
          </Card.Grid>
          <Card.Grid style={gridStyle}>
            <div className="statistics-cell">
              <h3>消费税</h3>
              <h2 className="data-num text-emphasis" style={{ minHeight: 27 }}>{this.renderValFixed(tax.excise_tax)}</h2>
            </div>
          </Card.Grid>
          <Card.Grid style={gridStyle}>
            <div className="statistics-cell">
              <h3>总税费</h3>
              <h2 className="data-num text-error">{this.renderValFixed(tax.total_tax)}</h2>
            </div>
          </Card.Grid>
        </Card>
        <Table size="middle" showHeader={false} pagination={false} dataSource={this.state.sumval}>
          <Column dataIndex="total" width={230} className="sub-total" />
          <Column dataIndex="duty_paid" width={110} render={this.renderValFixed} className="sub-total" />
          <Column dataIndex="trxn_mode" width={110} />
          <Column dataIndex="duty_tax" width={110} render={this.renderValFixed} className="sub-total" />
          <Column dataIndex="vat_tax" width={110} render={this.renderValFixed} className="sub-total" />
          <Column dataIndex="excise_tax" width={110} render={this.renderValFixed} className="sub-total" />
          <Column dataIndex="total_tax" width={110} render={this.renderValFixed} className="sub-total" />
        </Table>
        <Card title="缴税明细" bodyStyle={{ padding: 0 }}
          extra={<Popconfirm title="确定重新估算?" onConfirm={this.handleRecalculation}>
            <Button icon="calculator" loading={this.state.recalLoading}>估算</Button>
          </Popconfirm>}
        >
          <Table size="middle" columns={this.columns} pagination={false} dataSource={this.props.taxTots}
            rowKey="pre_entry_seq_no" expandedRowRender={this.handleExpandDetail}
          />
        </Card>
      </div>
    );
  }
}
