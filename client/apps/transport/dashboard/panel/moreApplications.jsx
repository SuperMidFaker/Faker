import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { Button, Col, Row, Input, Breadcrumb } from 'antd';
import { formatMsg } from '../message.i18n';

@injectIntl
@connect(
  state => ({
    subdomain: state.account.subdomain,
  }),
  { }
)

export default class MoreApplications extends React.Component {
  static propTypes = {
    subdomain: PropTypes.string.isRequired,
  }
  state = {
    shipmtNo: '',
  }
  msg = formatMsg(this.props.intl)
  handleQuery = () => {
    const subdomain = this.props.subdomain;
    window.open(`${window.location.origin}/pub/tracking?shipmtNo=${this.state.shipmtNo}&subdomain=${subdomain}`);
  }
  render() {
    return (
      <div className="right-sider-panel">
        <div className="page-header">
          <Breadcrumb>
            <Breadcrumb.Item>
              更多应用
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div style={{ textAlign: 'center', padding: '0 20px' }}>
          <br />
          <Row className="mdc-text-grey"><h3 style={{ fontWeight: 'normal' }}>运单查询</h3></Row>
          <br />
          <Row><Input value={this.state.shipmtNo} onChange={e => this.setState({ shipmtNo: e.target.value })} placeholder="输入运单号或客户单号查询" /></Row>
          <br />
          <Row>
            <Col span={12}><Button type="primary" onClick={this.handleQuery}>查询</Button></Col>
            <Col span={12}><Button style={{ marginLeft: 20 }}>共享</Button></Col>
          </Row>
          <br />
          <Row style={{ borderTop: 'solid 1px #e9e9e9' }} />
          <br />
          <Row className="mdc-text-grey"><h3 style={{ fontWeight: 'normal' }}>APP-司机版</h3></Row>
          <br />
          <Row className="mdc-text-grey">
            <Col span={12}>
              <img style={{ width: 50, height: 'auto', marginBottom: 20 }} alt="apple" src={`${__CDN__}/assets/img/apple.png`} />
              <br />
              <Button onClick={() => window.open('https://fir.im/welogixios')}>直接下载</Button>
            </Col>
            <Col span={12}>
              <img style={{ width: 50, height: 'auto', marginBottom: 20 }} alt="android" src={`${__CDN__}/assets/img/android.png`} />
              <br />
              <Button onClick={() => window.open('https://fir.im/welogixApp')}>直接下载</Button>
            </Col>
          </Row>
          <br />
          <Row />
          <br />
          <Row style={{ borderTop: 'solid 1px #e9e9e9' }} />
          <br />
          <Row className="mdc-text-grey"><h3 style={{ fontWeight: 'normal' }}>微信服务号</h3></Row>
          <br />
          <Row className="mdc-text-grey"><img style={{ width: 180, height: 'auto' }} alt="qrcode" src={`${__CDN__}/assets/img/qrcode_for_gh_4460c1f1985e_258.jpg`} /></Row>
          <br />
          <Row className="mdc-text-grey"><h5 style={{ fontWeight: 'normal' }}>直接扫描二维码</h5></Row>
          <br />
          <Row className="mdc-text-grey"><h5 style={{ fontWeight: 'normal' }}>在微信上开启应用</h5></Row>
        </div>
      </div>
    );
  }
}
