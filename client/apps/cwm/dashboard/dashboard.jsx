import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Alert, Breadcrumb, Card, Row, Select, Col, Layout } from 'antd';
import QueueAnim from 'rc-queue-anim';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
  }),
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
  render() {
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              <Select
                size="large"
                defaultValue="0960"
                placeholder="选择仓库"
                style={{ width: 160 }}
              >
                <Option value="0960">物流大道仓库</Option>
                <Option value="0961">希雅路仓库</Option>
                <Option value="0962">富特路仓库</Option>
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
                      <h6>{this.msg('totalASN')}</h6>
                      <p className="data-num">29</p>
                    </div>
                  </li>
                  <li className="col-8">
                    <div className="statistics-cell">
                      <h6>{this.msg('toReceive')}</h6>
                      <p className="data-num">6</p>
                    </div>
                  </li>
                  <li className="col-8">
                    <div className="statistics-cell">
                      <h6>{this.msg('putawayCompleted')}</h6>
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
                      <h6>{this.msg('totalSO')}</h6>
                      <p className="data-num">48</p>
                    </div>
                  </li>
                  <li className="col-8">
                    <div className="statistics-cell">
                      <h6>{this.msg('toAllocate')}</h6>
                      <p className="data-num">6</p>
                    </div>
                  </li>
                  <li className="col-8">
                    <div className="statistics-cell">
                      <h6>{this.msg('pickingCompleted')}</h6>
                      <p className="data-num">12</p>
                    </div>
                  </li>
                  <li className="col-8">
                    <div className="statistics-cell">
                      <h6>{this.msg('packingVerified')}</h6>
                      <p className="data-num">23</p>
                    </div>
                  </li>
                </ul>
              </Card>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col sm={24} md={16}>
              <Row gutter={16}>
                <Col sm={24} md={12}>
                  <Card loading title={this.msg('inventoryByCategories')} />
                </Col>
                <Col sm={24} md={12}>
                  <Card loading title={this.msg('inventoryByCustomers')} />
                </Col>
              </Row>
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
