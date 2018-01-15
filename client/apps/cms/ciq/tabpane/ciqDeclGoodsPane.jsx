import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import Summary from 'client/components/Summary';
import DataPane from 'client/components/DataPane';
import RowAction from 'client/components/RowAction';
import { showDeclElementsModal } from 'common/reducers/cmsManifest';
import { getElementByHscode } from 'common/reducers/cmsHsCode';
import { loadCiqDeclGoods, showGoodsModal } from 'common/reducers/cmsCiqDeclare';
import GoodsModal from '../modal/goodsModal';
import messages from '../message.i18n';

const formatMsg = format(messages);

function calculateTotal(bodies) {
  let totQty = 0;
  let totWet = 0;
  let totStdQty = 0;
  for (let i = 0; i < bodies.length; i++) {
    const body = bodies[i];
    if (body.g_qty) {
      totQty += Number(body.g_qty);
    }
    if (body.weight) {
      totWet += Number(body.weight);
    }
    if (body.std_qty) {
      totStdQty += Number(body.std_qty);
    }
  }
  return { totQty, totWet, totStdQty };
}

@injectIntl
@connect(state => ({
  tenantId: state.account.tenantId,
  currencies: state.cmsCiqDeclare.ciqParams.currencies,
  ports: state.cmsCiqDeclare.ciqParams.ports,
  countries: state.cmsCiqDeclare.ciqParams.countries,
  units: state.cmsCiqDeclare.ciqParams.units,
  loginId: state.account.loginId,
  ciqDeclGoods: state.cmsCiqDeclare.ciqDeclGoods,
}), {
  showDeclElementsModal, getElementByHscode, loadCiqDeclGoods, showGoodsModal,
})
export default class CiqDeclGoodsPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ioType: PropTypes.oneOf(['in', 'out']),
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  constructor(props) {
    super(props);
    this.state = {
      pagination: {
        current: 1,
        total: 0,
        pageSize: 8,
        showQuickJumper: false,
        onChange: this.handlePageChange,
      },

    };
  }
  componentWillMount() {
    this.props.loadCiqDeclGoods(this.context.router.params.declNo).then((result) => {
      if (!result.error) {
        const calresult = calculateTotal(result.data);
        this.setState({
          totQty: calresult.totQty,
          totWet: calresult.totWet,
          totStdQty: calresult.totStdQty,
        });
      }
    });
  }
  getColumns() {
    const columns = [{
      title: this.msg('gNo'),
      dataIndex: 'g_no',
      fixed: 'left',
      width: 45,
      align: 'center',
    }, {
      title: this.msg('hscode'),
      dataIndex: 'hscode',
      width: 120,
      fixed: 'left',

    }, {
      title: this.msg('ciqCode'),
      dataIndex: 'ciq_code',
      width: 150,

    }, {
      title: this.msg('gName'),
      dataIndex: 'g_name',
      width: 200,
    }, {
      title: <div className="cell-align-right">{this.msg('qty')}</div>,
      dataIndex: 'g_qty',
      width: 100,
      align: 'right',
    }, {
      title: this.msg('gUnit'),
      dataIndex: 'g_unit',
      width: 100,
      align: 'center',
      render: o => this.props.units.find(unit => unit.unit_code === o) &&
      this.props.units.find(unit => unit.unit_code === o).unit_name,
    }, {
      title: <div className="cell-align-right">{this.msg('weight')}</div>,
      dataIndex: 'weight',
      width: 100,
      align: 'right',
    }, {
      title: this.msg('wtMeasUnit'),
      dataIndex: 'wt_meas_unit',
      width: 100,
      align: 'center',
      render: o => this.props.units.find(unit => unit.unit_code === o) &&
      this.props.units.find(unit => unit.unit_code === o).unit_name,
    }, {
      title: <div className="cell-align-right">{this.msg('stdQty')}</div>,
      dataIndex: 'std_qty',
      width: 100,
      align: 'right',
    }, {
      title: this.msg('stdUnit'),
      dataIndex: 'std_unit',
      width: 120,
      align: 'center',
      render: o => this.props.units.find(unit => unit.unit_code === o) &&
      this.props.units.find(unit => unit.unit_code === o).unit_name,
    }, {
      title: <div className="cell-align-right">{this.msg('decPrice')}</div>,
      dataIndex: 'dec_price',
      width: 100,
      align: 'right',
    }, {
      title: <div className="cell-align-right">{this.msg('totalVal')}</div>,
      dataIndex: 'total_val',
      width: 100,
      align: 'right',
      render: (o, record) => record.dec_price * record.g_qty,
    }, {
      title: this.msg('tradeCurr'),
      dataIndex: 'trade_curr',
      width: 100,
      align: 'center',
      render: o => this.props.currencies.find(curr => curr.curr_code === o) &&
      this.props.currencies.find(curr => curr.curr_code === o).curr_name,
    }, {
      title: this.msg('origCountry'),
      dataIndex: 'orig_country',
      width: 100,
      render: o => this.props.countries.find(coun => coun.country_code === o) &&
      this.props.countries.find(coun => coun.country_code === o).country_cn_name,
    }, {
      title: this.msg('origPlace'),
      dataIndex: 'orig_place_code',
      width: 120,
    }, {
      title: this.msg('goodsAttr'),
      dataIndex: 'goods_attr',
      width: 120,
    }, {
      dataIndex: 'OP_COL',
      width: 60,
      fixed: 'right',
      render: (o, record, index) => (
        <span>
          <RowAction onClick={this.handleRowClick} icon="edit" row={record} index={index} />
        </span>
      ),
    }];
    return columns;
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  handlePageChange = (current) => {
    this.setState({
      pagination: {
        ...this.state.pagination,
        current,
      },
    });
  }
  handleRowClick = (record) => {
    this.props.showGoodsModal(record);
  }
  render() {
    const { ioType, ciqDeclGoods } = this.props;
    const { totQty, totWet, totStdQty } = this.state;
    const columns = this.getColumns();
    return (
      <DataPane
        fullscreen={this.props.fullscreen}
        columns={columns}
        bordered
        scrollOffset={312}
        dataSource={ciqDeclGoods}
        rowKey="id"
        loading={this.state.loading}
        onRow={record => ({
          onDoubleClick: () => { this.handleRowClick(record); },
        })}
      >
        <DataPane.Toolbar>
          <DataPane.Extra>
            <Summary>
              <Summary.Item label={this.msg('totalQty')} addonAfter="KG">{totQty && totQty.toFixed(2)}</Summary.Item>
              <Summary.Item label={this.msg('totWet')} addonAfter="KG">{totWet && totWet.toFixed(3)}</Summary.Item>
              <Summary.Item label={this.msg('totStdQty')} addonAfter="元">{totStdQty && totStdQty.toFixed(2)}</Summary.Item>
            </Summary>
          </DataPane.Extra>
        </DataPane.Toolbar>
        <GoodsModal ioType={ioType} />
      </DataPane>
    );
  }
}
