/* eslint no-undef: 0 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Steps, Card, Collapse, Timeline, Row, Col } from 'antd';
import { loadPubShipmtDetail } from 'common/reducers/shipment';
import connectFetch from 'client/common/decorators/connect-fetch';
import { renderConsignLoc, renderLoc } from '../../../transport/common/consignLocation';
import moment from 'moment';
const Step = Steps.Step;
const Panel = Collapse.Panel;
import '../index.less';

function fetchData({ dispatch, params }) {
  return dispatch(loadPubShipmtDetail(params.shipmtNo, params.key));
}

@connectFetch()(fetchData)
@connect(
  state => ({
    shipmtDetail: state.shipment.shipmtDetail,
  }),
  { }
)
export default class TrackingDetail extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    stepsDirection: 'horizontal',
  };
  componentDidMount() {
    this.resize();
    $(window).resize(() => {
      this.resize();
    });
    const { shipmt, tracking } = this.props.shipmtDetail;
    const points = [];
    tracking.points = tracking.points.reverse();
    tracking.points.forEach((item) => {
      points.push({
        ...item,
        lat: item.latitude,
        lng: item.longitude,
        label: `${moment(item.location_time).format('YYYY-MM-DD HH:mm')} ${renderLoc(item, 'province', 'city', 'district')} ${item.address || ''}`,
      });
    });
    const originPointAddr = `${renderConsignLoc(shipmt, 'consigner')}${shipmt.consigner_addr}`;
    const destPointAddr = `${renderConsignLoc(shipmt, 'consignee')}${shipmt.consignee_addr}`;
    const bdPoints = [];
    const viewPoints = [];
    // 百度地图API功能
    const map = new BMap.Map('map');          // 创建地图实例
    const myGeo = new BMap.Geocoder(); // 创建地址解析器实例
    // const point = new BMap.Point(120.073694,30.269552);  // 创建点坐标
    // map.centerAndZoom(point, 16);                 // 初始化地图，设置中心点坐标和地图级别
    map.enableScrollWheelZoom();
    map.addControl(new BMap.NavigationControl());  // 添加默认缩放平移控件
    const topLeftControl = new BMap.ScaleControl({ anchor: BMAP_ANCHOR_TOP_LEFT });// 左上角，添加比例
    map.addControl(topLeftControl);
    function addressToPoint(addr, cb, city) {
      // 将地址解析结果显示在地图上,并调整地图视野
      myGeo.getPoint(addr, cb, city);
    }
    // map.addEventListener("dragend", draw);
    // map.addEventListener("zoomend", draw);
    function checkPoint(item) {
      return new Promise((resolve) => {
        addressToPoint(`${item.province}${renderLoc(item, 'province', 'city', 'district')}${item.address}`, (point) => {
          let result = { ...item };
          if (point) {
            result = {
              ...item,
              ...point,
            };
          }
          resolve(result);
        }, `${item.city}`);
      });
    }
    // 创建标注
    function addMarker(pt, label, index, cur, pts) {
      if (pt && pt.lat !== 0 && pt.lng !== 0) {
        const iconSize = [25, 82];
        let iconurl = 'https://welogix-web-cdn.b0.upaiyun.com/assets/img/marker_way.png';
        if (index === 0) {
          iconurl = 'https://welogix-web-cdn.b0.upaiyun.com/assets/img/marker_origin.png';
        } else if (index === pts.length - 1) {
          iconurl = 'https://welogix-web-cdn.b0.upaiyun.com/assets/img/marker_dest.png';
        }
        const icon = new BMap.Icon(iconurl, new BMap.Size(...iconSize));
        const marker = new BMap.Marker(pt, { icon });
        map.addOverlay(marker);
        if (index === cur) {
          marker.setAnimation(BMAP_ANIMATION_BOUNCE);
        }
        const lab = new BMap.Label(label, { offset: new BMap.Size(30, -10) });
        marker.setLabel(lab);
      }
    }
    function draw(pts, cur) {
      const promises = [];
      for (let i = 0; i < pts.length; i++) {
        const p = checkPoint(pts[i]);
        promises.push(p);
      }
      const result = Promise.all(promises);
      result.then((arr) => {
        map.clearOverlays();
        for (let i = 0; i < arr.length; i++) {
          addMarker(arr[i], arr[i].label, i, cur, pts);
          const BDPoint = new BMap.Point(arr[i].lng, arr[i].lat);
          if (BDPoint.lng !== 0 && BDPoint.lat !== 0) {
            bdPoints.push(BDPoint);
            viewPoints.push(BDPoint);
          }
        }
        if (cur !== pts.length - 1) {
          bdPoints.pop();
        }
        const curve = new BMapLib.CurveLine(bdPoints, { strokeColor: '#0096da', strokeWeight: 3, strokeOpacity: 0.5 }); // 创建弧线对象
        map.addOverlay(curve); // 添加到地图中
        map.setViewport(viewPoints);
      });
    }
    addressToPoint(originPointAddr, (point) => {
      let result = {
        lat: 0,
        lng: 0,
      };
      if (point !== null) {
        result = point;
      }
      const originPoint = {
        ...result,
        label: `${shipmt.pickup_act_date || shipmt.pickup_est_date ?
          moment(shipmt.pickup_act_date || shipmt.pickup_est_date).format('YYYY-MM-DD HH:mm') : ''} ${originPointAddr}`,
      };
      addressToPoint(destPointAddr, (point2) => {
        if (point2 !== null) {
          result = point2;
        }
        const destPoint = {
          ...result,
          label: `${shipmt.deliver_act_date || shipmt.deliver_est_date ?
            moment(shipmt.deliver_act_date || shipmt.deliver_est_date).format('YYYY-MM-DD HH:mm') : ''} ${destPointAddr}`,
        };
        points.unshift(originPoint);
        points.push(destPoint);
        let current = 0;
        if (shipmt.status < 4) {
          current = 0;
        } else if (shipmt.status === 4) {
          current = points.length - 2;
        } else if (shipmt.status > 4) {
          current = points.length - 1;
        }
        draw(points, current);
      }, shipmt.consignee_city);
    }, shipmt.consigner_city);
  }
  resize() {
    if ($(window).width() <= 950) {
      this.setState({ stepsDirection: 'vertical' });
    } else {
      this.setState({ stepsDirection: 'horizontal' });
    }
    $('#map').height($(window).height() - 50);
  }
  render() {
    const { shipmt, tracking } = this.props.shipmtDetail;
    const points = [];
    tracking.points.forEach((item) => {
      points.push({
        title: `${renderLoc(item, 'province', 'city', 'district') || ''} ${item.address || ''}`,
        description: `${moment(item.location_time || item.created_date).format('YYYY-MM-DD HH:mm')}`,
      });
    });
    let latestPoint = {
      id: 15,
      from: 0,
      driver_id: 0,
      vehicle_id: '',
      province: '',
      city: '',
      district: '',
      street: '',
      address: '',
      longitude: 0,
      latitude: 0,
      speed: 0,
      accuracy: 0,
      direction: 0,
      sat: 0,
      altitude: 0,
      location_time: null,
      created_date: null,
    };
    if (tracking.points.length > 0) {
      latestPoint = tracking.points[0];
    }
    let statusDes = [];
    let statusPos = 0;
    if (shipmt.status < 4) {
      statusDes = [{
        status: 'wait',
        title: '未提货',
        description: `始发地: ${renderConsignLoc(shipmt, 'consigner')} 预计时间:${
          shipmt.pickup_est_date ? moment(shipmt.pickup_est_date).format('YYYY-MM-DD') : ''}`,
      }, {
        status: 'wait',
        title: '待运输',
        description: '',
      }, {
        status: 'wait',
        title: '未交货',
        description: `目的地: ${renderConsignLoc(shipmt, 'consignee')} 预计时间:${
          shipmt.deliver_est_date ? moment(shipmt.deliver_est_date).format('YYYY-MM-DD') : ''}`,
      }];
      statusPos = 0;
    } else if (shipmt.status === 4) {
      statusDes = [{
        status: 'finish',
        title: '已提货',
        description: `始发地: ${renderConsignLoc(shipmt, 'consigner')} 实际时间:${
          shipmt.pickup_act_date ? moment(shipmt.pickup_act_date).format('YYYY-MM-DD') : ''}`,
      }, {
        status: 'process',
        title: '运输中',
        description: `最新位置: ${renderLoc(latestPoint, 'province', 'city', 'district') || ''} ${latestPoint.address || ''} ${
          latestPoint.location_time || latestPoint.created_date ?
          moment(latestPoint.location_time || latestPoint.created_date).format('YYYY-MM-DD HH:mm') : ''}`,
      }, {
        status: 'wait',
        title: '未交货',
        description: `目的地: ${renderConsignLoc(shipmt, 'consignee')} 预计时间:${
          shipmt.deliver_est_date ? moment(shipmt.deliver_est_date).format('YYYY-MM-DD') : ''}`,
      }];
      statusPos = 1;
    } else if (shipmt.status > 4) {
      statusDes = [{
        status: 'finish',
        title: '已提货',
        description: `始发地: ${renderConsignLoc(shipmt, 'consigner')} 实际时间:${
          shipmt.pickup_act_date ? moment(shipmt.pickup_act_date).format('YYYY-MM-DD') : ''}`,
      }, {
        status: 'finish',
        title: '运输完成',
        description: `最新位置: ${renderLoc(latestPoint, 'province', 'city', 'district') || ''} ${latestPoint.address || ''} ${
          latestPoint.location_time || latestPoint.created_date ?
          moment(latestPoint.location_time || latestPoint.created_date).format('YYYY-MM-DD HH:mm') : ''}`,
      }, {
        status: 'finish',
        title: '已交货',
        description: `目的地: ${renderConsignLoc(shipmt, 'consignee')} 实际时间:${
          shipmt.deliver_act_date ? moment(shipmt.deliver_act_date).format('YYYY-MM-DD') : ''}`,
      }];
      statusPos = 2;
    }
    const steps = statusDes.map((s, i) => <Step key={i} status={s.status} title={s.title} description={s.description} />);
    const trackingSteps = points.map((s, i) => {
      if (i === 0) {
        return (<Timeline.Item color="green">{s.title} {s.description}</Timeline.Item>);
      } else {
        return (<Timeline.Item>{s.title} {s.description}</Timeline.Item>);
      }
    });
    return (
      <div className="panel-body">
        <nav className="detail-nav"><strong>运单号: {shipmt.shipmt_no}</strong></nav>
          <Row>
            <Col lg={15} sm={24}>
              <div className="main-content">
                <Card title="运输进度" extra={<a href="#"></a>} style={{ width: '100%' }}>
                  <Steps direction={this.state.stepsDirection} current={statusPos}>{steps}</Steps>
                </Card>
                <Row>
                  <Col lg={12} sm={24}>
                    <Card bodyStyle={{ padding: 0 }}>
                      <Collapse defaultActiveKey={['1', '2', '3']}>
                        <Panel header="发货方" key="1">
                          <p><strong>{shipmt.consigner_name || ''}</strong></p>
                          <p>{`${renderConsignLoc(shipmt, 'consigner')} ${shipmt.consigner_addr || ''}`}</p>
                          <p>{`${shipmt.consigner_contact || ''} ${shipmt.consigner_mobile || ''}`}</p>
                        </Panel>
                        <Panel header="收货方" key="2">
                          <p><strong>{shipmt.consignee_name}</strong></p>
                          <p>{`${renderConsignLoc(shipmt, 'consignee')} ${shipmt.consignee_addr || ''}`}</p>
                          <p>{`${shipmt.consignee_contact || ''} ${shipmt.consignee_mobile || ''}`}</p>
                        </Panel>
                        <Panel header="运输货物" key="3">
                          <p>运输方式：<span style={{ marginLeft: 30 }}>{shipmt.transport_mode}</span></p>
                          <p>总件数：<span style={{ marginLeft: 45 }}>{shipmt.total_count}</span></p>
                          <p>总重量：<span style={{ marginLeft: 45 }}>{shipmt.total_weight}公斤</span></p>
                        </Panel>
                      </Collapse>
                    </Card>
                  </Col>
                  <Col lg={12} sm={24}>
                    <Card id="tracing-timeline" title="追踪详情" extra={<a href="#"></a>}>
                      <Timeline>{trackingSteps}</Timeline>
                    </Card>
                  </Col>
                </Row>
              </div>
            </Col>
            <Col lg={9} sm={24}>
              <div id="map"></div>
            </Col>
          </Row>
          <script type="text/javascript" src="https://sapi.map.baidu.com/api?v=2.0&ak=A4749739227af1618f7b0d1b588c0e85&s=1"></script>
          <script type="text/javascript" src="https://sapi.map.baidu.com/library/TextIconOverlay/1.2/src/TextIconOverlay_min.js"></script>
          <script type="text/javascript" src="https://sapi.map.baidu.com/library/MarkerClusterer/1.2/src/MarkerClusterer_min.js"></script>
          <script type="text/javascript" src="https://sapi.map.baidu.com/library/CurveLine/1.5/src/CurveLine.min.js"></script>
      </div>
    );
  }
}
