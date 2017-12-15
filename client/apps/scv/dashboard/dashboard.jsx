import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Alert, Breadcrumb, Card, Row, Col, Layout } from 'antd';
import QueueAnim from 'rc-queue-anim';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);
const { Header, Content } = Layout;

@injectIntl
@connect(state => ({
  tenantId: state.account.tenantId,
}), )
@connectNav({
  depth: 2,
  moduleName: 'scv',
})
export default class SCVDashboard extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }

  componentDidMount() {
  }
  handleRadioChange = (ev) => {
    if (ev.target.value === this.props.listFilter.status) {

    }
  }
  msg = key => formatMsg(this.props.intl, key);
  render() {
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="page-header">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.msg('dashboardTitle')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="toolbar-right" />
        </Header>
        <Content className="main-content" key="main">
          <Row gutter={16}>
            <Col sm={24} md={16}>
              <Card loading title={this.msg('shipmentsStatus')}>
                <ul className="statistics-columns">
                  <li className="col-4">
                    <div className="statistics-cell">
                      <h6>{this.msg('atOrigin')}</h6>
                      <p className="data-num">12</p>
                    </div>
                  </li>
                  <li className="col-4">
                    <div className="statistics-cell">
                      <h6>{this.msg('inTransit')}</h6>
                      <p className="data-num">6</p>
                    </div>
                  </li>
                  <li className="col-4">
                    <div className="statistics-cell">
                      <h6>{this.msg('arrived')}</h6>
                      <p className="data-num">23</p>
                    </div>
                  </li>
                  <li className="col-4">
                    <div className="statistics-cell">
                      <h6>{this.msg('clearance')}</h6>
                      <p className="data-num">23</p>
                    </div>
                  </li>
                  <li className="col-4">
                    <div className="statistics-cell">
                      <h6>{this.msg('inland')}</h6>
                      <p className="data-num">32</p>
                    </div>
                  </li>
                  <li className="col-4">
                    <div className="statistics-cell">
                      <h6>{this.msg('delivered')}</h6>
                      <p className="data-num">32</p>
                    </div>
                  </li>
                </ul>
              </Card>
              <Card loading title={this.msg('payments')}>
                <ul className="statistics-columns">
                  <li className="col-8">
                    <div className="statistics-cell">
                      <h6>{this.msg('tax')}</h6>
                      <p className="data-num">￥12,578.95</p>
                    </div>
                  </li>
                  <li className="col-8">
                    <div className="statistics-cell">
                      <h6>{this.msg('freightBills')}</h6>
                      <p className="data-num">￥67,231.53</p>
                    </div>
                  </li>
                  <li className="col-8">
                    <div className="statistics-cell">
                      <h6>{this.msg('brokerBills')}</h6>
                      <p className="data-num">￥32,345.06</p>
                    </div>
                  </li>
                </ul>
              </Card>
              <Card loading title={this.msg('statistics')}>
                <div id="c1" />
              </Card>
            </Col>
            <Col sm={24} md={8}>
              <Card loading title={this.msg('alerts')} >
                <Alert message="报关单221020161109715501 海关查验" type="warning" showIcon />
                <Alert message="1067172 送货延迟：收货人外地出差，18号以后送货" type="warning" showIcon />
              </Card>
            </Col>
          </Row>
        </Content>
      </QueueAnim>
    );
  }
}
