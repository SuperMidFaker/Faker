import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Alert, Card, Row, Col, Layout } from 'antd';
import QueueAnim from 'rc-queue-anim';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);
const { Header, Content } = Layout;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
  }),
)
@connectNav({
  depth: 2,
  moduleName: 'wcm',
})
export default class WMSDashboard extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }

  componentDidMount() {
    const data = [
        { name: 'Jan', Import: 12814, Export: 3054 },
        { name: 'Feb', Import: 13012, Export: 5067 },
        { name: 'Mar', Import: 11624, Export: 4004 },
        { name: 'Apr', Import: 8814, Export: 7054 },
        { name: 'May', Import: 12998, Export: 2043 },
        { name: 'Jun', Import: 12321, Export: 6507 },
        { name: 'Jul', Import: 10342, Export: 3019 },
        { name: 'Aug', Import: 22998, Export: 5243 },
        { name: 'Sep', Import: 11261, Export: 4419 },
        { name: 'Oct', Import: 2651, Export: 199 },
        { name: 'Nov', Import: 0, Export: 0 },
        { name: 'Dec', Import: 0, Export: 0 },
    ];
    const Frame = window.G2.Frame;
    let frame = new Frame(data);
    frame = Frame.combinColumns(frame, ['Import', 'Export'], 'Revenue', 'I/E', 'name');
    const chart = new window.G2.Chart({
      id: 'c1',
      width: 1000,
      height: 300,
    });
    chart.source(frame, {
      Revenue: {
        alias: '进出口总额（美元）',
        formatter(val) {
          return `${parseInt(val / 1000, 10)}k`;
        },
      },
      name: {
        alias: '2016年',
      },
    });
    chart.areaStack().position('name*Revenue').color('I/E');
    chart.render();
  }
  handleRadioChange = (ev) => {
    if (ev.target.value === this.props.listFilter.status) {

    }
  }
  msg = key => formatMsg(this.props.intl, key);
  render() {
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="top-bar" key="header">
          <div className="toolbar-right" />
          <span>{this.msg('dashboardTitle')}</span>
        </Header>
        <Content className="main-content">
          <div className="page-body card-wrapper">
            <Row gutter={16}>
              <Col span={16}>
                <Card title={this.msg('orders')} style={{ display: 'none' }}>
                  <ul className="statistics-columns">
                    <li className="col-4">
                      <div className="statistics-cell">
                        <h6>{this.msg('accepted')}</h6>
                        <p className="data-num">12</p>
                      </div>
                    </li>
                    <li className="col-4">
                      <div className="statistics-cell">
                        <h6>{this.msg('sent')}</h6>
                        <p className="data-num">6</p>
                      </div>
                    </li>
                    <li className="col-4">
                      <div className="statistics-cell">
                        <h6>{this.msg('pickedup')}</h6>
                        <p className="data-num">23</p>
                      </div>
                    </li>
                    <li className="col-4">
                      <div className="statistics-cell">
                        <h6>{this.msg('delivered')}</h6>
                        <p className="data-num" />
                      </div>
                    </li>
                    <li className="col-4">
                      <div className="statistics-cell">
                        <h6>{this.msg('completed')}</h6>
                        <p className="data-num">32</p>
                      </div>
                    </li>
                  </ul>
                </Card>
                <Card title={this.msg('shipments')}>
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
                <Card title={this.msg('payments')}>
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
                <Card title={this.msg('statistics')}>
                  <div id="c1" />
                </Card>
              </Col>
              <Col span={8}>
                <Card title={this.msg('alerts')} >
                  <Alert message="报关单221020161109715501 海关查验" type="warning" showIcon />
                  <Alert message="1067172 送货延迟：收货人外地出差，18号以后送货" type="warning" showIcon />
                </Card>
              </Col>
            </Row>
          </div>
        </Content>
      </QueueAnim>
    );
  }
}
