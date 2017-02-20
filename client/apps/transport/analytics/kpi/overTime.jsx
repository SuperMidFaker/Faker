import React, { PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { Card, Row, Col, Spin } from 'antd';
import echarts from 'echarts';

@injectIntl
export default class OverTime extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    kpi: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    loaded: PropTypes.bool.isRequired,
  }
  componentDidMount() {
    this.initializeCharts(this.props);
    window.$(window).resize(() => {
      this.initializeCharts(this.props);
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.loaded) {
      this.initializeCharts(nextProps);
    }
  }
  componentWillUnmount() {
    window.$(window).unbind('resize');
  }
  initializeCharts = (props) => {
    const { transitModes, range, shipmentCounts, punctualShipmentCounts } = props.kpi;
    const barOption = {
      title: { text: '超时率' },
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
            formatter: '{c} %',
          },
        },
        data: shipmentCounts[index].map((item1, j) => item1 === 0 ? 0 : Number(((item1 - punctualShipmentCounts[index][j]) / item1 * 100).toFixed(2))),
      })),
    };
    const transitModesShipmentCount = shipmentCounts.map(arr => arr.reduce((a, b) => a + b, 0));
    const allShipmentCount = transitModesShipmentCount.reduce((a, b) => a + b, 0);
    const transitModesPunctualShipmentCount = punctualShipmentCounts.map(arr => arr.reduce((a, b) => a + b, 0));
    const punctualShipmentCount = transitModesPunctualShipmentCount.reduce((a, b) => a + b, 0);
    const pieOption = {
      title: { text: '超时占比' },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)',
      },
      legend: {
        x: 'center',
        data: transitModes.map(item => item.mode_name).concat('超时'),
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
        name: '交付率',
        type: 'pie',
        selectedMode: 'single',
        radius: [0, '45%'],

        label: {
          normal: {
            position: 'inner',
          },
        },
        labelLine: {
          normal: {
            show: false,
          },
        },
        data: [
              { value: punctualShipmentCount, name: '准时' },
              { value: allShipmentCount - punctualShipmentCount, name: '超时' },
        ],
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
      }, {
        name: '交付率',
        type: 'pie',
        radius: ['50%', '70%'],
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
        data: [{ value: punctualShipmentCount, name: '准时' }].concat(transitModes.map((item, index) => ({
          name: item.mode_name,
          value: transitModesShipmentCount[index] - transitModesPunctualShipmentCount[index],
        }))),
      }],
    };
    if (window) {
      const barChart = echarts.init(window.document.getElementById('bar-chart-overtime'));
      barChart.setOption(barOption);
      const pieChart = echarts.init(window.document.getElementById('pie-chart-overtime'));
      pieChart.setOption(pieOption);
    }
  }

  render() {
    return (
      <Row gutter={24}>
        <Col sm={24} md={12}>
          <Spin spinning={this.props.loading}>
            <Card>
              <div id="bar-chart-overtime" style={{ width: '100%', height: '450px' }} />
            </Card>
          </Spin>
        </Col>
        <Col sm={24} md={12}>
          <Spin spinning={this.props.loading}>
            <Card>
              <div id="pie-chart-overtime" style={{ width: '100%', height: '450px' }} />
            </Card>
          </Spin>
        </Col>
      </Row>
    );
  }
}
