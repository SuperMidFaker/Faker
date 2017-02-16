import React, { PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { Layout, Select, DatePicker, Button, Card } from 'antd';
import echarts from 'echarts';
import { loadKpi } from 'common/reducers/transportKpi';
import { loadFormRequire } from 'common/reducers/shipment';

const { Header, Content } = Layout;
const Option = Select.Option;
const { RangePicker } = DatePicker;

function fetchData({ cookie, state, dispatch }) {
  const beginDate = new Date();
  beginDate.setMonth(beginDate.getMonth() - 5);
  const endDate = new Date();
  dispatch(loadFormRequire(cookie, state.account.tenantId));
  return dispatch(loadKpi(
    state.account.tenantId,
    beginDate,
    endDate,
    -1,
  ));
}

@connectFetch()(fetchData)
@injectIntl
@connectNav({
  depth: 2,
  moduleName: 'transport',
})
@connect(
  state => ({
    tenantId: state.account.tenantId,
    kpi: state.transportKpi.kpi,
    query: state.transportKpi.query,
    clients: state.shipment.formRequire.clients,
  }),
  { loadKpi }
)
export default class Kpi extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loadKpi: PropTypes.func.isRequired,
    kpi: PropTypes.object.isRequired,
    query: PropTypes.object.isRequired,
    clients: PropTypes.array.isRequired,
  }
  componentDidMount() {
    this.initializeCharts(this.props);
  }
  componentWillReceiveProps(nextProps) {
    this.initializeCharts(nextProps);
  }
  initializeCharts = (props) => {
    const { transitModes, range, shipmentCounts } = props.kpi;
    const barOption = {
      title: { text: '票数' },
      tooltip: {
        trigger: 'axis',
        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
          type: 'shadow',        // 默认为直线，可选为：'line' | 'shadow'
        },
      },
      legend: {
        data: transitModes.map(item => item.mode_name),
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      toolbox: {
        show: true,
        feature: {
          dataZoom: {},
          dataView: { readOnly: false },
          magicType: { type: ['line', 'bar'] },
          restore: {},
          saveAsImage: {},
        },
      },
      xAxis: [
        {
          type: 'category',
          data: range.map(item => `${item.year}-${item.month}`),
        },
      ],
      yAxis: [
        {
          type: 'value',
        },
      ],
      series: transitModes.map((item, index) => ({
        name: item.mode_name,
        type: 'bar',
        label: {
          normal: {
            show: true,
            position: 'top',
          },
        },
        data: shipmentCounts[index],
      })),
    };
    const transitModesShipmentCount = shipmentCounts.map(arr => arr.reduce((a, b) => a + b), 0);
    const pieOption = {
      title: { text: '票数占比' },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)',
      },
      legend: {
        x: 'center',
        data: transitModes.map(item => item.mode_name),
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      toolbox: {
        show: true,
        feature: {
          dataZoom: {},
          dataView: { readOnly: false },
          restore: {},
          saveAsImage: {},
        },
      },
      series: [{
        name: '运输模式',
        type: 'pie',
        radius: '55%',
        center: ['50%', '60%'],
        data: transitModes.map((item, index) => ({
          name: item.mode_name,
          value: transitModesShipmentCount[index],
        })),
        itemStyle: {
          emphasis: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
          normal: {
            label: {
              show: true,
              formatter: '{b} : {c} ({d}%)',
            },
            labelLine: { show: true },
          },
        },
      }],
    };
    if (window) {
      const barChart = echarts.init(window.document.getElementById('barChart'));
      barChart.setOption(barOption);
      const pieChart = echarts.init(window.document.getElementById('pieChart'));
      pieChart.setOption(pieOption);
    }
  }
  handleCustomerChange = (partnerId) => {
    const { tenantId, query } = this.props;
    this.props.loadKpi(tenantId, query.beginDate, query.endDate, partnerId || -1);
  }
  handleDateChange = (dates) => {
    const { tenantId, query } = this.props;
    this.props.loadKpi(tenantId, dates[0], dates[1], query.partnerId);
  }
  render() {
    const { query, clients } = this.props;
    return (
      <div>
        <Header className="top-bar">
          <span>KPI</span>
        </Header>
        <Content className="main-content">
          <div className="page-body">
            <div className="toolbar">
              <Button>导出</Button>
              <RangePicker format="YYYY-MM" value={[moment(query.beginDate), moment(query.endDate)]} onChange={this.handleDateChange} />
              <Select
                showSearch
                style={{ width: 300 }}
                placeholder="选择一个客户"
                optionFilterProp="children"
                onChange={this.handleCustomerChange}
                allowClear
              >
                {
                  clients.map(pt => (
                    <Option searched={`${pt.partner_code}${pt.name}`}
                      value={pt.partner_id} key={pt.partner_id}
                    >
                      {pt.partner_code ? `${pt.partner_code} | ${pt.name}` : pt.name}
                    </Option>)
                  )
                }
              </Select>
            </div>
            <div className="panel-body table-panel" style={{ padding: 10 }}>
              <Card style={{ width: '49%', display: 'inline-block' }}>
                <div id="barChart" style={{ width: '100%', height: '400px' }} />
              </Card>
              <Card style={{ width: '49%', marginLeft: '1%', display: 'inline-block' }}>
                <div id="pieChart" style={{ width: '100%', height: '400px' }} />
              </Card>
            </div>
          </div>
        </Content>
      </div>
    );
  }
}
