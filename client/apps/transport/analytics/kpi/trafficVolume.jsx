import React, { PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { Card } from 'antd';
import echarts from 'echarts';

@injectIntl
export default class TrafficVolume extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    kpi: PropTypes.object.isRequired,
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
    const transitModesShipmentCount = shipmentCounts.map(arr => arr.reduce((a, b) => a + b, 0));
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
      const barChart = echarts.init(window.document.getElementById('bar-chart-traffic-volume'));
      barChart.setOption(barOption);
      const pieChart = echarts.init(window.document.getElementById('pie-chart-traffic-volume'));
      pieChart.setOption(pieOption);
    }
  }

  render() {
    return (
      <div className="panel-body table-panel" style={{ padding: 10 }}>
        <Card style={{ width: '49%', display: 'inline-block' }}>
          <div id="bar-chart-traffic-volume" style={{ width: '100%', height: '450px' }} />
        </Card>
        <Card style={{ width: '49%', marginLeft: '1%', display: 'inline-block' }}>
          <div id="pie-chart-traffic-volume" style={{ width: '100%', height: '450px' }} />
        </Card>
      </div>
    );
  }
}
