import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Alert, Breadcrumb, Card, Row, Select, Col, Layout } from 'antd';
import createG2 from 'g2-react';
import { Stat } from 'g2';
import QueueAnim from 'rc-queue-anim';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import chartData from './chartData.json';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    data: chartData,
    width: 360,
    height: 360,
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
    const PieByCategories = createG2((chart) => {
      chart.coord('theta');
      chart.intervalStack().position(Stat.summary.proportion()).color('category');
      chart.render();
    });
    const PieByCustomers = createG2((chart) => {
      chart.coord('theta');
      chart.intervalStack().position(Stat.summary.proportion()).color('customer');
      chart.render();
    });
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="top-bar" key="header">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.msg('dashboardTitle')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="toolbar-right">
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
          <div className="page-body card-wrapper">
            <Row gutter={16}>
              <Col span={16}>
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
                  <Col span={12}>
                    <Card title={this.msg('inventoryByCategories')}>
                      <PieByCategories
                        data={chartData.slice(0, chartData.length / 2 - 1)}
                        width={360}
                        height={360}
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card title={this.msg('inventoryByCustomers')}>
                      <PieByCustomers
                        data={chartData.slice(0, chartData.length / 2 - 1)}
                        width={360}
                        height={360}
                      />
                    </Card>
                  </Col>
                </Row>
              </Col>
              <Col span={8}>
                <Card title={this.msg('inventoryAlerts')} >
                  <Alert message="221020161109715501 低于安全库存" type="warning" showIcon />
                </Card>
              </Col>
            </Row>
          </div>
        </Content>
      </QueueAnim>
    );
  }
}
