import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Card, Col, Layout, Row, Tabs, Table } from 'antd';
import QueueAnim from 'rc-queue-anim';
import SearchBar from 'client/components/SearchBar';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
const TabPane = Tabs.TabPane;
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
  moduleName: 'scv',
})
export default class AnalyticsCostList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);

  handleRadioChange = (ev) => {
    if (ev.target.value === this.props.listFilter.status) {

    }
  }
  render() {
    const dataSource = [{
      key: '1',
      month: 'Jan',
      ontimeShipments: 32,
      ttlShipments: 237,
      ontimeShipmentsRate: '93.5%',
      ontimeOrders: 32,
      ttlOrders: 237,
      ontimeOrdersRate: '93.5%',
    }, {
      key: '2',
      month: 'Feb',
      ontimeShipments: 42,
      ttlShipments: 126,
      ontimeShipmentsRate: '93.5%',
      ontimeOrders: 32,
      ttlOrders: 237,
      ontimeOrdersRate: '93.5%',
    }, {
      key: '3',
      month: 'Mar',
      ontimeShipments: 42,
      ttlShipments: 126,
      ontimeShipmentsRate: '93.5%',
      ontimeOrders: 32,
      ttlOrders: 237,
      ontimeOrdersRate: '93.5%',
    }, {
      key: '4',
      month: 'Apr',
      ontimeShipments: 42,
      ttlShipments: 126,
      ontimeShipmentsRate: '93.5%',
      ontimeOrders: 32,
      ttlOrders: 237,
      ontimeOrdersRate: '93.5%',
    }, {
      key: '5',
      month: 'May',
      ontimeShipments: 42,
      ttlShipments: 126,
      ontimeShipmentsRate: '93.5%',
      ontimeOrders: 32,
      ttlOrders: 237,
      ontimeOrdersRate: '93.5%',
    }, {
      key: '6',
      month: 'Jun',
      ontimeShipments: 42,
      ttlShipments: 126,
      ontimeShipmentsRate: '93.5%',
      ontimeOrders: 32,
      ttlOrders: 237,
      ontimeOrdersRate: '93.5%',
    }, {
      key: '7',
      month: 'Jul',
      ontimeShipments: 42,
      ttlShipments: 126,
      ontimeShipmentsRate: '93.5%',
      ontimeOrders: 32,
      ttlOrders: 237,
      ontimeOrdersRate: '93.5%',
    }, {
      key: '8',
      month: 'Aug',
      ontimeShipments: 42,
      ttlShipments: 126,
      ontimeShipmentsRate: '93.5%',
      ontimeOrders: 32,
      ttlOrders: 237,
      ontimeOrdersRate: '93.5%',
    }, {
      key: '9',
      month: 'Sep',
      ontimeShipments: 42,
      ttlShipments: 126,
      ontimeShipmentsRate: '93.5%',
      ontimeOrders: 32,
      ttlOrders: 237,
      ontimeOrdersRate: '93.5%',
    }, {
      key: '10',
      month: 'Oct',
      ontimeShipments: 42,
      ttlShipments: 126,
      ontimeShipmentsRate: '93.5%',
      ontimeOrders: 32,
      ttlOrders: 237,
      ontimeOrdersRate: '93.5%',
    }];

    const columns = [{
      title: 'Month',
      dataIndex: 'month',
      key: 'month',
    }, {
      title: 'Ontime Shipments',
      dataIndex: 'ontimeShipments',
      key: 'ontimeShipments',
    }, {
      title: 'TTL Shipments',
      dataIndex: 'ttlShipments',
      key: 'ttlShipments',
    }, {
      title: 'Ontime % Shipments',
      dataIndex: 'ontimeShipmentsRate',
      key: 'ontimeShipmentsRate',
    }, {
      title: 'Ontime Orders',
      dataIndex: 'ontimeOrders',
      key: 'ontimeOrders',
    }, {
      title: 'TTL Orders',
      dataIndex: 'ttlOrders',
      key: 'ttlOrders',
    }, {
      title: 'Ontime % Orders',
      dataIndex: 'ontimeOrdersRate',
      key: 'ontimeOrdersRate',
    }];
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="page-header">
          <div className="toolbar-right">
            <SearchBar placeholder={this.msg('searchPlaceholder')} onInputSearch={this.handleSearch} />
          </div>
          <span>{this.msg('analyticsCost')}</span>
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body card-wrapper">
            <Row gutter={16}>
              <Col span={5}>
                <Card title={this.msg('totalLandedCost')}>
                  <ul className="statistics-columns">
                    <li className="col-6">
                      <div className="statistics-cell">
                        <p className="data-num">￥12,578.95</p>
                      </div>
                    </li>
                  </ul>
                </Card>
              </Col>
              <Col span={9}>
                <Card title={this.msg('expenses')}>
                  <ul className="statistics-columns">
                    <li className="col-8">
                      <div className="statistics-cell">
                        <h6>{this.msg('freight')}</h6>
                        <p className="data-num">￥12,578.95</p>
                      </div>
                    </li>
                    <li className="col-8">
                      <div className="statistics-cell">
                        <h6>{this.msg('clearance')}</h6>
                        <p className="data-num">￥67,231.53</p>
                      </div>
                    </li>
                    <li className="col-8">
                      <div className="statistics-cell">
                        <h6>{this.msg('inland')}</h6>
                        <p className="data-num">￥32,345.06</p>
                      </div>
                    </li>
                  </ul>
                </Card>
              </Col>
              <Col span={10}>
                <Card title={this.msg('taxes')}>
                  <ul className="statistics-columns">
                    <li className="col-6">
                      <div className="statistics-cell">
                        <h6>{this.msg('duties')}</h6>
                        <p className="data-num">￥12,578.95</p>
                      </div>
                    </li>
                    <li className="col-6">
                      <div className="statistics-cell">
                        <h6>{this.msg('vat')}</h6>
                        <p className="data-num">￥67,231.53</p>
                      </div>
                    </li>
                    <li className="col-6">
                      <div className="statistics-cell">
                        <h6>{this.msg('comsuption')}</h6>
                        <p className="data-num">￥32,345.06</p>
                      </div>
                    </li>
                    <li className="col-6">
                      <div className="statistics-cell">
                        <h6>{this.msg('otherTaxes')}</h6>
                        <p className="data-num">￥32,345.06</p>
                      </div>
                    </li>
                  </ul>
                </Card>
              </Col>
            </Row>
          </div>
          <div className="page-body">
            <Tabs defaultActiveKey="allocByOrder">
              <TabPane tab={this.msg('allocByOrder')} key="allocByOrder">
                <Table dataSource={dataSource} columns={columns} size="middle" />
              </TabPane>
              <TabPane tab={this.msg('allocBySku')} key="allocBySku">
                <Table dataSource={dataSource} columns={columns} size="middle" />
              </TabPane>
            </Tabs>
          </div>
        </Content>
      </QueueAnim>
    );
  }
}
