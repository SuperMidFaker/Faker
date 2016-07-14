import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Card, DatePicker, Row, Col, Table } from 'antd';
import { loadShipmentStatistics } from 'common/reducers/shipment';
import './index.less';
import echarts from 'echarts';
import chinaJson from './china.json';
import { renderCity } from './common/consignLocation';
import moment from 'moment';
const RangePicker = DatePicker.RangePicker;


function fetchData({ state, dispatch, cookie }) {
  const { startDate, endDate } = state.shipment.statistics;
  return dispatch(loadShipmentStatistics(cookie, state.account.tenantId, startDate, endDate));
}
@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    statistics: state.shipment.statistics,
  }),
  { loadShipmentStatistics })

export default class Dashboard extends React.Component {
  static propTypes = {
    children: PropTypes.object,
  }
  componentWillReceiveProps(nextProps) {
    this.createEcharts(nextProps.statistics);
  }
  onDateChange = (e) => {
    this.props.loadShipmentStatistics(null, this.props.tenantId, e[0], e[1]);
  }
  createEcharts(statistics) {
    const { points } = statistics;
    const geoCoordMap = {};
    const SHData = [];
    for (let i = 0; i < points.length; i ++) {
      const consignerCity = renderCity(points[i], 'consigner');
      const consigneeCity = renderCity(points[i], 'consignee');
      SHData.push([{ name: consignerCity }, { name: consigneeCity, value: points[i].value * 10 }]);
      if (geoCoordMap[consignerCity] === undefined) {
        geoCoordMap[consignerCity] = [0, 0];
      }
      if (geoCoordMap[consigneeCity] === undefined) {
        geoCoordMap[consigneeCity] = [0, 0];
      }
    }
    function queryGeoLocation(item) {
      return new Promise((resolve) => {
        window.$.ajax({
          type: 'get',
          url: 'https://api.map.baidu.com/geocoder/v2/',
          data: {
            output: 'json',
            ak: 'A4749739227af1618f7b0d1b588c0e85',
            address: item,
          },
          dataType: 'jsonp',
          success: (data) => {
            resolve(data);
          },
        });
      });
    }
    const promises = [];
    for (const i in geoCoordMap) {
      const p = queryGeoLocation(i);
      promises.push(p);
    }
    const result = Promise.all(promises);
    result.then((arr) => {
      let j = 0;
      for (const i in geoCoordMap) {
        geoCoordMap[i][0] = arr[j].result.location.lng;
        geoCoordMap[i][1] = arr[j].result.location.lat;
        j++;
      }

      const convertData = (data) => {
        const res = [];
        for (let i = 0; i < data.length; i++) {
          const dataItem = data[i];
          const fromCoord = geoCoordMap[dataItem[0].name];
          const toCoord = geoCoordMap[dataItem[1].name];
          if (fromCoord && toCoord) {
            res.push({
              fromName: dataItem[0].name,
              toName: dataItem[1].name,
              coords: [fromCoord, toCoord],
            });
          }
        }
        return res;
      };
      const color = '#ffa022';
      const series = [];
      [['', SHData]].forEach((item) => {
        series.push({
          name: '',
          type: 'lines',
          zlevel: 1,
          effect: {
            show: true,
            period: 6,
            trailLength: 0.7,
            color: '#fff',
            symbolSize: 3,
          },
          lineStyle: {
            normal: {
              color,
              width: 0,
              curveness: 0.2,
            },
          },
          data: convertData(item[1]),
        }, {
          name: '',
          type: 'lines',
          zlevel: 2,
          effect: {
            show: true,
            period: 6,
            trailLength: 0,
          },
          lineStyle: {
            normal: {
              color,
              width: 1,
              opacity: 0.4,
              curveness: 0.2,
            },
          },
          data: convertData(item[1]),
        }, {
          name: '',
          type: 'effectScatter',
          coordinateSystem: 'geo',
          zlevel: 2,
          rippleEffect: {
            brushType: 'stroke',
          },
          label: {
            normal: {
              show: true,
              position: 'right',
              formatter: '{b}',
            },
          },
          symbolSize: (val) => {
            return val[2] / 8;
          },
          itemStyle: {
            normal: {
              color,
            },
          },
          data: item[1].map((dataItem) => {
            return {
              name: dataItem[1].name,
              value: geoCoordMap[dataItem[1].name].concat([dataItem[1].value]),
            };
          }),
        });
      });

      const option = {
        backgroundColor: '#f0f0f0',
        title: {
          text: '',
          subtext: '',
          left: 'center',
          textStyle: {
            color: '#fff',
          },
        },
        tooltip: {
          trigger: 'item',
        },
        legend: {
          orient: 'vertical',
          top: 'bottom',
          left: 'left',
          data: [],
          textStyle: {
            color: '#fff',
          },
          selectedMode: 'single',
        },
        geo: {
          map: 'china',
          label: {
            emphasis: {
              show: false,
            },
          },
          roam: true,
          itemStyle: {
            normal: {
              areaColor: '#323c48',
              borderColor: '#404a59',
            },
            emphasis: {
              areaColor: '#2a333d',
            },
          },
        },
        series,
      };
      if (document) {
        echarts.registerMap('china', chinaJson);
        const chart = echarts.init(document.getElementById('chart'));
        chart.setOption(option);
      }
    });
  }
  render() {
    const { count, startDate, endDate } = this.props.statistics;
    const datePicker = (
      <div>
        <RangePicker style={{ width: 200 }} defaultValue={[moment(startDate).format('YYYY-MM-DD HH:mm:ss'), moment(endDate).format('YYYY-MM-DD HH:mm:ss')]}
          format="yyyy-MM-dd HH:mm:ss" onChange={this.onDateChange}
        />
      </div>);
    const iconStyle = {
      fontSize: '46px',
      fontWeight: 'bolder',
      borderRadius: '50%',
      color: '#fff',
      padding: '13px 18px',
      width: '70px',
      height: '70px',
    };
    const right = {
      display: 'inline-block',
      paddingLeft: '10px',
    };
    const rightTop = {
      height: '80%',
      fontSize: '36px',
      color: '#000',
      lineHeight: 1,
    };
    const rightBottom = {
      height: '20%',
      fontSize: '14px',
      color: '#999999',
      marginTop: '5px',
    };

    const columns = [{
      title: '操作',
      dataIndex: 'name',
      width: '20%',
      render(text) {
        return text;
      },
    }, {
      title: '详情',
      dataIndex: 'operation',
      width: '80%',
      render: (value) => {
        return value;
      },
    }];
    const data = [{
      key: '1',
      name: '待接单',
      operation: '',
    }, {
      key: '2',
      name: '待分配',
      operation: '',
    }, {
      key: '3',
      name: '待更新提货',
      operation: '',
    }, {
      key: '4',
      name: '待更新位置',
      operation: '',
    }, {
      key: '5',
      name: '待更新交货',
      operation: '',
    }, {
      key: '6',
      name: '待上传回单',
      operation: '',
    }, {
      key: '7',
      name: '待审核回单',
      operation: '',
    }];

    return (
      <div className="main-content">
        <div className="page-body" style={{ padding: '24px' }}>
          <Card title="运单统计" extra={datePicker}>
            <Row type="flex" justify="space-around" align="middle">
              <Col span={4} className="stats-data">
                  <i className="zmdi zmdi-file-plus" style={{ backgroundColor: 'rgba(250, 196, 80, 1)', ...iconStyle }} />
                  <div style={right}>
                    <div style={rightTop}>{count[0]}</div>
                    <div style={rightBottom}>已受理运单</div>
                  </div>
              </Col>
              <Col span={4} className="stats-data">
                  <i className="zmdi zmdi-mail-send" style={{ backgroundColor: 'rgba(1, 179, 202, 1)', ...iconStyle }} />
                  <div style={right}>
                    <div style={rightTop}>
                    {count[1]}
                    </div>
                    <div style={rightBottom}>已调度运单</div>
                  </div>
              </Col>
              <Col span={4} className="stats-data">
                  <i className="zmdi zmdi-forward" style={{ backgroundColor: 'rgba(0, 151, 218, 1)', ...iconStyle }} />
                  <div style={right}>
                    <div style={rightTop}>
                    {count[2]}
                    </div>
                    <div style={rightBottom}>已提货运单</div>
                  </div>
              </Col>
              <Col span={4} className="stats-data">
                  <i className="zmdi zmdi-assignment-check" style={{ backgroundColor: 'rgba(88, 45, 170, 1)', ...iconStyle }} />
                  <div style={right}>
                    <div style={rightTop}>
                    {count[3]}
                    </div>
                    <div style={rightBottom}>已交货运单</div>
                  </div>
              </Col>
              <Col span={4} className="stats-data">
                  <i className="zmdi zmdi-badge-check" style={{ backgroundColor: 'rgba(95, 188, 41, 1)', ...iconStyle }} />
                  <div style={right}>
                    <div style={rightTop}>
                    {count[4]}
                    </div>
                    <div style={rightBottom}>已完成运单</div>
                  </div>
              </Col>
            </Row>
          </Card>
          <Row style={{ marginTop: 24 }}>
            <Col span={9}>
              <Card title="待处理">
                <Table columns={columns} dataSource={data} bordered pagination={false} />
              </Card>
            </Col>
            <Col span={15}>
              <Card title="运输实况" style={{ marginLeft: 24 }}>
                <div id="chart" style={{ width: '110%', height: '480px', margin: '-25px' }}></div>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}
