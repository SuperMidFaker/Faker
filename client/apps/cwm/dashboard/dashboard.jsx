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
              {this.msg('dashboardTitle')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="top-bar-tools">
            <Select
              size="large"
              showSearch
              defaultActiveFirstOption
              placeholder="选择仓库"
              optionFilterProp="children"
              filterOption={(input, option) => option.props.value.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              style={{ width: 240 }}
            >
              <Option value="all">全部仓库</Option>
              <Option value="jack">物流大道仓库</Option>
              <Option value="lucy">希雅路仓库</Option>
              <Option value="tom">富特路仓库</Option>
            </Select>
          </div>
        </Header>
        <Content className="main-content">
          <Row gutter={16}>
            <Col sm={24} md={16}>
              <Card title={this.msg('volumeToday')}>
                <ul className="statistics-columns">
                  <li className="col-6">
                    <div className="statistics-cell">
                      <h6>{this.msg('stockInbound')}</h6>
                      <p className="data-num">12</p>
                    </div>
                  </li>
                  <li className="col-6">
                    <div className="statistics-cell">
                      <h6>{this.msg('stockOutbound')}</h6>
                      <p className="data-num">6</p>
                    </div>
                  </li>
                  <li className="col-6">
                    <div className="statistics-cell">
                      <h6>{this.msg('stockReserved')}</h6>
                      <p className="data-num">23</p>
                    </div>
                  </li>
                  <li className="col-6">
                    <div className="statistics-cell">
                      <h6>{this.msg('stockTaken')}</h6>
                      <p className="data-num">23</p>
                    </div>
                  </li>
                </ul>
              </Card>
              <Row gutter={16}>
                <Col sm={24} md={12}>
                  <Card title={this.msg('inventoryByCategories')} />
                </Col>
                <Col sm={24} md={12}>
                  <Card title={this.msg('inventoryByCustomers')} />
                </Col>
              </Row>
            </Col>
            <Col sm={24} md={8}>
              <Card title={this.msg('inventoryAlerts')} >
                <Alert message="221020161109715501 低于安全库存" type="warning" showIcon />
              </Card>
            </Col>
          </Row>
        </Content>
      </QueueAnim>
    );
  }
}
