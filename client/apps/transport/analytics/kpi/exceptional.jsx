import React from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import echarts from 'echarts';
import { getSelectedModesObject } from 'common/reducers/transportKpi';
import ChartBody from './chartBody';
import { KPI_CHART_COLORS } from 'common/constants';

@injectIntl
export default class Exceptional extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    kpi: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    loaded: PropTypes.bool.isRequired,
    onModesChange: PropTypes.func.isRequired,
    modes: PropTypes.array.isRequired,
  }
  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.loaded) {
      this.initializeCharts(nextProps);
    }
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }
  handleResize = () => {
    this.initializeCharts(this.props);
  }
  initializeCharts = (props) => {
    const { exceptionTypes, range, exceptionalShipmentCounts } = props.kpi;
    const barOption = {
      title: { text: '票数', textStyle: { fontSize: 14 } },
      tooltip: {
        trigger: 'axis',
        axisPointer: { // 坐标轴指示器，坐标轴触发有效
          type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
        },
      },
      legend: {
        bottom: 0,
        data: exceptionTypes.map(item => item.name),
        selected: getSelectedModesObject(exceptionTypes, props.modes, 'name'),
      },
      color: KPI_CHART_COLORS,
      grid: {
        left: 0,
        right: '3%',
        bottom: '6%',
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
          splitLine: { show: false },
        },
      ],
      series: exceptionTypes.map((item, index) => ({
        name: item.name,
        type: 'bar',
        label: {
          normal: {
            show: true,
            position: 'top',
          },
        },
        data: exceptionalShipmentCounts[index],
      })),
    };
    const transitModesShipmentCount = exceptionalShipmentCounts.map(arr => arr.reduce((a, b) => a + b, 0));
    const pieOption = {
      title: { text: '票数占比', textStyle: { fontSize: 14 } },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)',
      },
      legend: {
        x: 'center',
        bottom: 0,
        data: exceptionTypes.map(item => item.name),
      },
      color: KPI_CHART_COLORS,
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      toolbox: {
        show: true,
        feature: {
          dataView: { readOnly: false },
          saveAsImage: {},
        },
      },
      series: [{
        name: '运输模式',
        type: 'pie',
        radius: '45%',
        center: ['50%', '50%'],
        data: exceptionTypes.map((item, index) => ({
          name: item.name,
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
      barChart.on('legendselectchanged', (legend) => {
        const currentModes = [];
        exceptionTypes.forEach((item) => {
          if (legend.selected[item.name]) {
            currentModes.push(item);
          }
        });
        this.props.onModesChange({ exception: currentModes });
      });
      const pieChart = echarts.init(window.document.getElementById('pie-chart-traffic-volume'));
      pieChart.setOption(pieOption);
    }
  }
  render() {
    return (<ChartBody loading={this.props.loading} barChartId="bar-chart-traffic-volume" pieChartId="pie-chart-traffic-volume" />);
  }
}
