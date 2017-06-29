import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Alert, Breadcrumb, Card, Row, Select, Col, Layout, Progress, message } from 'antd';
import QueueAnim from 'rc-queue-anim';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import messages from './message.i18n';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    whses: state.cwmContext.whses,
    defaultWhse: state.cwmContext.defaultWhse,
  }),
  { switchDefaultWhse }
)
@connectNav({
  depth: 2,
  moduleName: 'cwm',
})
export default class CWMDashboard extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);
  handleWhseChange = (value) => {
    this.props.switchDefaultWhse(value);
    message.info('当前仓库已切换');
  }
  render() {
    const { whses, defaultWhse } = this.props;
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              <Select size="large" value={defaultWhse.code} placeholder="选择仓库" style={{ width: 160 }} onSelect={this.handleWhseChange}>
                {
                  whses.map(warehouse => (<Option key={warehouse.code} value={warehouse.code}>{warehouse.name}</Option>))
                }
              </Select>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('dashboard')}
            </Breadcrumb.Item>
          </Breadcrumb>
        </Header>
        <Content className="main-content" key="main">
          <Row gutter={16}>
            <Col sm={24} md={10}>
              <Card title={this.msg('statsReceiving')}>
                <ul className="statistics-columns">
                  <li className="col-8">
                    <div className="statistics-cell">
                      <h4>{this.msg('totalASN')}</h4>
                      <p className="data-num">29</p>
                    </div>
                  </li>
                  <li className="col-8">
                    <div className="statistics-cell">
                      <h4>{this.msg('toReceive')}</h4>
                      <p className="data-num">6</p>
                    </div>
                  </li>
                  <li className="col-8">
                    <div className="statistics-cell">
                      <h4>{this.msg('putawayCompleted')}</h4>
                      <p className="data-num">23</p>
                    </div>
                  </li>
                </ul>
              </Card>
            </Col>
            <Col sm={24} md={14}>
              <Card title={this.msg('statsShipping')}>
                <ul className="statistics-columns">
                  <li className="col-8">
                    <div className="statistics-cell">
                      <h4>{this.msg('totalSO')}</h4>
                      <p className="data-num">48</p>
                    </div>
                  </li>
                  <li className="col-8">
                    <div className="statistics-cell">
                      <h4>{this.msg('toAllocate')}</h4>
                      <p className="data-num">6</p>
                    </div>
                  </li>
                  <li className="col-8">
                    <div className="statistics-cell">
                      <h4>{this.msg('pickingCompleted')}</h4>
                      <p className="data-num">12</p>
                    </div>
                  </li>
                  <li className="col-8">
                    <div className="statistics-cell">
                      <h4>{this.msg('packingVerified')}</h4>
                      <p className="data-num">23</p>
                    </div>
                  </li>
                </ul>
              </Card>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col sm={24} md={16}>
              <Card title={this.msg('statsTasks')}>
                <ul className="statistics-columns">
                  <li className="col-8">
                    <div className="statistics-cell">
                      <h4>{this.msg('receipts')}</h4>
                      <Progress type="dashboard" percent={75} width={80} />
                      <p>Total: 561 Items</p>
                      <p>Completed: 165 Items</p>
                    </div>
                  </li>
                  <li className="col-8">
                    <div className="statistics-cell">
                      <h4>{this.msg('putaways')}</h4>
                      <Progress type="dashboard" percent={75} width={80} />
                      <p>Total: 561 Items</p>
                      <p>Completed: 165 Items</p>
                    </div>
                  </li>
                  <li className="col-8">
                    <div className="statistics-cell">
                      <h4>{this.msg('shipments')}</h4>
                      <Progress type="dashboard" percent={75} width={80} />
                      <p>Total: 561 Items</p>
                      <p>Completed: 165 Items</p>
                    </div>
                  </li>
                  <li className="col-8">
                    <div className="statistics-cell">
                      <h4>{this.msg('replenishments')}</h4>
                      <Progress type="dashboard" percent={75} width={80} />
                      <p>Total: 561 Items</p>
                      <p>Completed: 165 Items</p>
                    </div>
                  </li>
                </ul>
              </Card>
            </Col>
            <Col sm={24} md={8}>
              <Card loading title={this.msg('inventoryAlerts')} >
                <Alert message="221020161109715501 低于安全库存" type="warning" showIcon />
              </Card>
            </Col>
          </Row>
        </Content>
      </QueueAnim>
    );
  }
}
