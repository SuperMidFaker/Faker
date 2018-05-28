import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Collapse, Card, Table } from 'antd';
import { loadShftzRelease } from 'common/reducers/cwmShippingOrder';
import { loadParams } from 'common/reducers/cwmShFtz';
// import InfoItem from 'client/components/InfoItem';
// import { MdIcon } from 'client/components/FontIcon';

const { Panel } = Collapse;

@injectIntl
@connect(
  state => ({
    order: state.sofOrders.dock.order,
    units: state.cwmShFtz.params.units.map(un => ({
      value: un.unit_code,
      text: un.unit_name,
    })),
    currencies: state.cwmShFtz.params.currencies.map(cr => ({
      value: cr.curr_code,
      text: cr.curr_name,
    })),
    tradeCountries: state.cwmShFtz.params.tradeCountries.map(tc => ({
      value: tc.cntry_co,
      text: tc.cntry_name_cn,
    })),
  }),
  { loadShftzRelease, loadParams }
)
export default class FTZPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    soNo: PropTypes.string.isRequired,
  }
  state = {
    data: [],
  }
  componentWillMount() {
    this.props.loadParams();
    this.props.loadShftzRelease(this.props.soNo).then((result) => {
      if (!result.error) {
        this.setState({
          data: result.data,
        });
      }
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.soNo !== this.props.soNo) {
      this.props.loadShftzRelease(nextProps.soNo).then((result) => {
        if (!result.error) {
          this.setState({
            data: result.data,
          });
        }
      });
    }
  }
  columns = [{
    title: '备案料号',
    dataIndex: 'ftz_cargo_no',
    width: 150,
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 120,
  }, {
    title: '商品编码',
    dataIndex: 'hscode',
    width: 150,
  }, {
    title: '中文品名',
    dataIndex: 'g_name',
    width: 150,
  }, {
    title: '规格型号',
    dataIndex: 'model',
    width: 200,
  }, {
    title: '单位',
    dataIndex: 'out_unit',
    width: 80,
    render: (o) => {
      const unit = this.props.units.filter(cur => cur.value === o)[0];
      const text = unit ? `${unit.value}| ${unit.text}` : o;
      return text;
    },
  }, {
    title: '数量',
    dataIndex: 'qty',
    render: o => (<b>{o}</b>),
    width: 80,
  }, {
    title: '毛重',
    dataIndex: 'gross_wt',
    width: 80,
  }, {
    title: '净重',
    dataIndex: 'net_wt',
    width: 80,
  }, {
    title: '金额',
    dataIndex: 'amount',
    width: 80,
  }, {
    title: '币制',
    dataIndex: 'currency',
    width: 150,
    render: (o) => {
      const currency = this.props.currencies.filter(cur => cur.value === o)[0];
      const text = currency ? `${currency.value}| ${currency.text}` : o;
      return text;
    },
  }, {
    title: '原产国',
    dataIndex: 'country',
    width: 150,
    render: (o) => {
      const country = this.props.tradeCountries.filter(cur => cur.value === o)[0];
      const text = country ? `${country.value}| ${country.text}` : o;
      return text;
    },
  }]
  render() {
    return (
      <div className="pane-content tab-pane">
        <Card bodyStyle={{ padding: 0 }} >
          <Collapse bordered={false} defaultActiveKey={['releaseDetails']}>
            <Panel header="备案明细" key="releaseDetails" >
              <div className="table-panel table-fixed-layout">
                <Table size="middle" columns={this.columns} dataSource={this.state.data} scroll={{ x: 1470 }} />
              </div>
            </Panel>
          </Collapse>
        </Card>
      </div>
    );
  }
}
