/* eslint no-undef: 0 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import connectNav from 'client/common/decorators/connect-nav';
import { Breadcrumb, Layout, Steps, Card, Collapse, Row, Col, Alert } from 'antd';
import { loadPubShipmtDetail } from 'common/reducers/shipment';
import * as Location from 'client/util/location';
import { loadExceptions } from 'common/reducers/trackingLandException';
import TrackingTimeline from '../../transport/common/trackingTimeline';
import moment from 'moment';
import './index.less';

const Step = Steps.Step;
const Panel = Collapse.Panel;
const { Header, Content } = Layout;

@connect(
  state => ({
    shipmtDetail: state.shipment.shipmtDetail,
  }),
  { loadExceptions, loadPubShipmtDetail }
)
@connectNav({
  depth: 3,
  moduleName: 'transport',
})
export default class TrackingDetail extends React.Component {
  static propTypes = {
    shipmtDetail: PropTypes.object.isRequired,
    loadExceptions: PropTypes.func.isRequired,
    loadPubShipmtDetail: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    stepsDirection: 'horizontal',
    exceptions: [],
    scriptLoadedNum: 0,
  }
  componentDidMount() {
    let script;
    if (!document.getElementById('baidumap-1')) {
      window.HOST_TYPE = '2'; window.BMap_loadScriptTime = (new Date()).getTime();
      script = document.createElement('script');
      script.id = 'baidumap-1';
      script.src = 'https://api.map.baidu.com/getscript?v=2.0&ak=A4749739227af1618f7b0d1b588c0e85&services=&t=20170628183224';
      // script.async = true;
      document.body.appendChild(script);
      script.onload = () => {
        this.setState({ scriptLoadedNum: this.state.scriptLoadedNum + 1 }, this.drawBaiduMap);
        if (!document.getElementById('baidumap-2')) {
          script = document.createElement('script');
          script.id = 'baidumap-2';
          script.src = 'https://sapi.map.baidu.com/library/TextIconOverlay/1.2/src/TextIconOverlay_min.js';
          script.async = true;
          document.body.appendChild(script);
          script.onload = () => {
            this.setState({ scriptLoadedNum: this.state.scriptLoadedNum + 1 }, this.drawBaiduMap);
          };
          script.onreadystatechange = script.onload;
        }
        if (!document.getElementById('baidumap-3')) {
          script = document.createElement('script');
          script.id = 'baidumap-3';
          script.src = 'https://sapi.map.baidu.com/library/MarkerClusterer/1.2/src/MarkerClusterer_min.js';
          script.async = true;
          document.body.appendChild(script);
          script.onload = () => {
            this.setState({ scriptLoadedNum: this.state.scriptLoadedNum + 1 }, this.drawBaiduMap);
          };
          script.onreadystatechange = script.onload;
        }
        if (!document.getElementById('baidumap-4')) {
          script = document.createElement('script');
          script.id = 'baidumap-4';
          script.src = 'https://sapi.map.baidu.com/library/CurveLine/1.5/src/CurveLine.min.js';
          script.async = true;
          document.body.appendChild(script);
          script.onload = () => {
            this.setState({ scriptLoadedNum: this.state.scriptLoadedNum + 1 }, this.drawBaiduMap);
          };
          script.onreadystatechange = script.onload;
        }
      };
      script.onreadystatechange = script.onload;
    } else {
      this.drawBaiduMap(4);
    }
    this.loadExceptions();
    this.resize();
    $(window).resize(() => {
      this.resize();
    });
  }
  drawBaiduMap = (scriptLoadedNum = 4) => {
    if (scriptLoadedNum < 4 && this.state.scriptLoadedNum < 4) return;
    const { params } = this.props;
    this.props.loadPubShipmtDetail(params.shipmtNo, params.key).then((result) => {
      const { shipmt, tracking } = result.data;
      const points = [];
      const ps = [...tracking.points];
      ps.reverse();
      ps.forEach((item) => {
        points.push({
          ...item,
          lat: item.latitude,
          lng: item.longitude,
          label: `${moment(item.location_time).format('YYYY-MM-DD HH:mm')} ${Location.renderLoc(item)} ${item.address || ''}`,
        });
      });
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
          addressToPoint(`${Location.renderLocation(item)}${item.address}`, (point) => {
            let res = { ...item };
            if (point) {
              res = {
                ...item,
                ...point,
              };
            }
            resolve(res);
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
        Promise.all(promises).then((arr) => {
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
      if (shipmt.status <= 3) {
        const departPointAddr = `${Location.renderConsignLocation(shipmt, 'consigner')}${shipmt.consigner_addr ? shipmt.consigner_addr : ''}`;
        points.push({
          province: shipmt.consigner_province,
          city: shipmt.consigner_city,
          district: shipmt.consigner_district,
          address: shipmt.consigner_addr,
          label: `${moment(shipmt.pickup_est_date).format('YYYY-MM-DD HH:mm')} ${departPointAddr}`,
        });
      }
      const current = points.length - 1;
      if (shipmt.status <= 4) {
        const destPointAddr = `${Location.renderConsignLocation(shipmt, 'consignee')}${shipmt.consignee_addr ? shipmt.consignee_addr : ''}`;
        points.push({
          province: shipmt.consignee_province,
          city: shipmt.consignee_city,
          district: shipmt.consignee_district,
          address: shipmt.consignee_addr,
          label: `${moment(shipmt.deliver_est_date).format('YYYY-MM-DD HH:mm')} ${destPointAddr}`,
        });
      }
      draw(points, current);
    });
  }
  resize() {
    if ($(window).width() <= 950) {
      this.setState({ stepsDirection: 'vertical' });
    } else {
      this.setState({ stepsDirection: 'horizontal' });
    }
    $('#map').height($(window).height() - 50);
  }
  loadExceptions = () => {
    const { params } = this.props;
    this.props.loadExceptions({
      shipmtNo: params.shipmtNo,
      pageSize: 999999,
      currentPage: 1,
    }).then((result) => {
      this.setState({ exceptions: result.data.data });
    });
  }
  renderSteps() {
    const { shipmt, tracking } = this.props.shipmtDetail;
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
    let statusPos = 0;
    if (tracking.points.length > 0) {
      latestPoint = tracking.points[0];
    }
    if (shipmt.status < 4) {
      statusPos = 0;
      return (<Steps direction={this.state.stepsDirection} current={statusPos}>
        <Step key="1" status="wait" title="未起运"
          description={<span>
            <p>{Location.renderConsignLocation(shipmt, 'consigner')}</p>
            <p>计划:{shipmt.pickup_est_date ? moment(shipmt.pickup_est_date).format('YYYY-MM-DD') : ''}</p>
          </span>}
        />
        <Step key="2" status="wait" title="待运输" description="" />
        <Step key="3" status="wait" title="未到达"
          description={<span>
            <p>{Location.renderConsignLocation(shipmt, 'consignee')}</p>
            <p>预计:{shipmt.deliver_prm_date ? moment(shipmt.deliver_prm_date).format('YYYY-MM-DD') : ''}</p>
          </span>}
        />
      </Steps>);
    } else if (shipmt.status === 4) {
      statusPos = 1;
      return (<Steps direction={this.state.stepsDirection} current={statusPos}>
        <Step key="1" status="finish" title="已起运"
          description={<span>
            <p>{Location.renderConsignLocation(shipmt, 'consigner')}</p>
            <p>计划:{shipmt.pickup_est_date ? moment(shipmt.pickup_est_date).format('YYYY-MM-DD') : ''}</p>
            <p>实际:{shipmt.pickup_act_date ? moment(shipmt.pickup_act_date).format('YYYY-MM-DD') : ''}</p>
          </span>}
        />
        <Step key="2" status="process" title="运输中"
          description={<span>
            <p>最新位置: {Location.renderLoc(latestPoint) || ''} {latestPoint.address || ''}</p>
            <p>{ latestPoint.location_time || latestPoint.created_date ? moment(latestPoint.location_time || latestPoint.created_date).format('YYYY-MM-DD HH:mm') : ''}</p>
          </span>}
        />
        <Step key="3" status="wait" title="未到达"
          description={<span>
            <p>{Location.renderConsignLocation(shipmt, 'consignee')}</p>
            <p>预计:{shipmt.deliver_prm_date ? moment(shipmt.deliver_prm_date).format('YYYY-MM-DD') : ''}</p>
          </span>}
        />
      </Steps>);
    } else if (shipmt.status > 4) {
      statusPos = 2;
      return (<Steps direction={this.state.stepsDirection} current={statusPos}>
        <Step key="1" status="finish" title="已起运"
          description={<span>
            <p>{Location.renderConsignLocation(shipmt, 'consigner')}</p>
            <p>计划:{shipmt.pickup_est_date ? moment(shipmt.pickup_est_date).format('YYYY-MM-DD') : ''}</p>
            <p>实际:{shipmt.pickup_act_date ? moment(shipmt.pickup_act_date).format('YYYY-MM-DD') : ''}</p>
          </span>}
        />
        <Step key="2" status="finish" title="运输完成" description="" />
        <Step key="3" status="finish" title="已到达"
          description={<span>
            <p>{Location.renderConsignLocation(shipmt, 'consignee')}</p>
            <p>预计:{shipmt.deliver_prm_date ? moment(shipmt.deliver_prm_date).format('YYYY-MM-DD') : ''}</p>
            <p>实际:{shipmt.deliver_act_date ? moment(shipmt.deliver_act_date).format('YYYY-MM-DD') : ''}</p>
          </span>}
        />
      </Steps>);
    }
  }
  render() {
    const { shipmt, tracking } = this.props.shipmtDetail;
    let refExternalNo = '';
    if (shipmt.ref_external_no && shipmt.ref_external_no !== '') {
      refExternalNo = `(${shipmt.ref_external_no})`;
    }
    const deliverDelayException = this.state.exceptions.find(item => item.type === 11013);
    return (
      <div className="panel-body">
        <Header className="page-header">
          <Breadcrumb>
            <Breadcrumb.Item>
              运单追踪
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {shipmt.shipmt_no} {refExternalNo}
            </Breadcrumb.Item>
          </Breadcrumb>
        </Header>
        <Row>
          <Col lg={15} sm={24}>
            <Content className="main-content">
              <Card title="运输进度" style={{ width: '100%' }} noHovering>
                {this.renderSteps()}
                {deliverDelayException &&
                  <Alert
                    message={`标准到达时间:${moment(shipmt.deliver_est_date).format('YYYY-MM-DD')} 预计到达时间:${moment(shipmt.deliver_prm_date).format('YYYY-MM-DD')}`}
                    description={`延误原因:${deliverDelayException.solution ? deliverDelayException.solution : '未知，请联系承运商'}`}
                    type="warning"
                    showIcon
                  />}
              </Card>
              <Row>
                <Col lg={12} sm={24}>
                  <Card bodyStyle={{ padding: 0 }} noHovering>
                    <Collapse defaultActiveKey={['1', '2', '3']}>
                      <Panel header="发货方" key="1">
                        <p><strong>{shipmt.consigner_name || ''}</strong></p>
                        <p>{`${Location.renderConsignLocation(shipmt, 'consigner')} ${shipmt.consigner_addr || ''}`}</p>
                        <p>{`${shipmt.consigner_contact || ''} ${shipmt.consigner_mobile || ''}`}</p>
                      </Panel>
                      <Panel header="收货方" key="2">
                        <p><strong>{shipmt.consignee_name}</strong></p>
                        <p>{`${Location.renderConsignLocation(shipmt, 'consignee')} ${shipmt.consignee_addr || ''}`}</p>
                        <p>{`${shipmt.consignee_contact || ''} ${shipmt.consignee_mobile || ''}`}</p>
                      </Panel>
                      <Panel header="运输货物" key="3">
                        <p>运输方式：<span style={{ marginLeft: 30 }}>{shipmt.transport_mode}</span></p>
                        <p>总件数：<span style={{ marginLeft: 45 }}>{shipmt.total_count}</span></p>
                        <p>总重量：<span style={{ marginLeft: 45 }}>{shipmt.total_weight}千克</span></p>
                      </Panel>
                    </Collapse>
                  </Card>
                </Col>
                <Col lg={12} sm={24}>
                  <Card id="tracing-timeline" title="追踪详情" noHovering>
                    <TrackingTimeline points={tracking.points} />
                  </Card>
                </Col>
              </Row>
            </Content>
          </Col>
          <Col lg={9} sm={24}>
            <div id="map" />
          </Col>
        </Row>
        {/* <script type="text/javascript" src="https://sapi.map.baidu.com/api?v=2.0&ak=A4749739227af1618f7b0d1b588c0e85&s=1" />
        <script type="text/javascript" src="https://sapi.map.baidu.com/library/TextIconOverlay/1.2/src/TextIconOverlay_min.js" />
        <script type="text/javascript" src="https://sapi.map.baidu.com/library/MarkerClusterer/1.2/src/MarkerClusterer_min.js" />
        <script type="text/javascript" src="https://sapi.map.baidu.com/library/CurveLine/1.5/src/CurveLine.min.js" />
      */}</div>
    );
  }
}
