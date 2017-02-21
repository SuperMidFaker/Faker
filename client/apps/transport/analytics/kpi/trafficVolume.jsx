import React, { PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { Card, Col, Row, Spin } from 'antd';
import echarts from 'echarts';
import { getSelectedModesObject } from 'common/reducers/transportKpi';

@injectIntl
export default class TrafficVolume extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    kpi: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    loaded: PropTypes.bool.isRequired,
    onModesChange: PropTypes.func.isRequired,
    modes: PropTypes.array.isRequired,
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
    const { transitModes, range, shipmentCounts } = props.kpi;
    const barOption = {
      title: { text: '票数', textStyle: { fontSize: 14 } },
      tooltip: {
        trigger: 'axis',
        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
          type: 'shadow',        // 默认为直线，可选为：'line' | 'shadow'
        },
      },
      legend: {
        bottom: 0,
        data: transitModes.map(item => item.mode_name),
        selected: getSelectedModesObject(transitModes, props.modes),
      },
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
      title: { text: '票数占比', textStyle: { fontSize: 14 } },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)',
      },
      legend: {
        x: 'center',
        bottom: 0,
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
          dataView: { readOnly: false },
          saveAsImage: {},
        },
      },
      series: [{
        name: '运输模式',
        type: 'pie',
        radius: '55%',
        center: ['50%', '50%'],
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
      barChart.on('legendselectchanged', (legend) => {
        const currentModes = [];
        transitModes.forEach((item) => {
          if (legend.selected[item.mode_name]) {
            currentModes.push(item);
          }
        });
        this.props.onModesChange({ volume: currentModes });
      });
      const pieChart = echarts.init(window.document.getElementById('pie-chart-traffic-volume'));
      pieChart.setOption(pieOption);
    }
  }

  render() {
    return (
      <Row gutter={24}>
        <Col sm={24} md={13}>
          <Spin spinning={this.props.loading}>
            <Card>
              <div id="bar-chart-traffic-volume" style={{ width: '100%', height: '480px' }} />
            </Card>
          </Spin>
        </Col>
        <Col sm={24} md={11}>
          <Spin spinning={this.props.loading}>
            <Card>
              <div id="pie-chart-traffic-volume" style={{ width: '100%', height: '480px' }} />
            </Card>
          </Spin>
        </Col>
      </Row>
    );
  }
}
