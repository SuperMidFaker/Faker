import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Card, Menu, Icon, Table } from 'antd';
import QueueAnim from 'rc-queue-anim';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
const SubMenu = Menu.SubMenu;
const formatMsg = format(messages);

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
export default class AnalyticsKpiList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  componentDidMount() {
    $('<div style="position: absolute;width: 100px;top: 160px;left: 100px;text-align: center;color: #444;"><p>Ontime Shipments</p><p style="font-size:18px;font-weight:bold;">90.2%</p>').appendTo('#c1');
    $('<div style="position: absolute;width: 100px;top: 160px;left: 400px;text-align: center;color: #444;"><p>Ontime Orders</p><p style="font-size:18px;font-weight:bold;">87.9%</p>').appendTo('#c1');

    const data = [
        { year: 2007, area: 'Ontime', profit: 7860 * 0.902 },
        { year: 2007, area: 'Delay 1 Day', profit: 7860 * 0.042 },
        { year: 2007, area: 'Delay 2 Days', profit: 7860 * 0.025 },
        { year: 2007, area: 'Delay 3 Days', profit: 7860 * 0.022 },
        { year: 2007, area: 'Delay 4 Days', profit: 7860 * 0.004 },
        { year: 2007, area: 'Delay 5+Days', profit: 7860 * 0.005 },

        { year: 2011, area: 'Ontime', profit: 7620 * 0.879 },
        { year: 2011, area: 'Delay 1 Day', profit: 7620 * 0.025 },
        { year: 2011, area: 'Delay 2 Days', profit: 7620 * 0.055 },
        { year: 2011, area: 'Delay 3 Days', profit: 7620 * 0.024 },
        { year: 2011, area: 'Delay 4 Days', profit: 7620 * 0.013 },
        { year: 2011, area: 'Delay 5+Days', profit: 7620 * 0.004 },
    ];
    const Stat = G2.Stat;
    const chart = new G2.Chart({
      id: 'c1',
      width: 600,
      height: 225,
      plotCfg: {
        margin: [40, 0, 0, 0],
      },
    });
    chart.source(data);
      // 以 year 为维度划分分面
    chart.facet(['year'], {
      margin: 50,
      facetTitle: {
        colDimTitle: {
          title: null,
        },
        colTitle: {
          title: null,
        },
      },
    });
    chart.legend('bottom');
    chart.coord('theta', {
      radius: 1,
      inner: 0.6,
    });
    chart.tooltip({
      title: null,
    });
    chart.intervalStack().position(Stat.summary.percent('profit'))
        .color('area')
        .label('..percent')
        .style({
          lineWidth: 1,
        });
    chart.render();
  }
  msg = key => formatMsg(this.props.intl, key);

  handleRadioChange = (ev) => {
    if (ev.target.value === this.props.listFilter.status) {
      return;
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
        <header className="top-bar" key="header">
          <div className="tools">
          </div>
          <span>{this.msg('analyticsKpi')}</span>
        </header>
        <aside className="side-bar" key="aside">
          <Menu
            defaultOpenKeys={['sub1', 'sub2']}
            mode="inline"
          >
            <SubMenu key="sub1" title={<span><Icon type="bar-chart" /><span>{this.msg('sectionServiceProvider')}</span></span>}>
              <Menu.Item key="1">{this.msg('ontimeDelivery')}</Menu.Item>
              <Menu.Item key="2">{this.msg('brokerHandling')}</Menu.Item>
            </SubMenu>
            <SubMenu key="sub2" title={<span><Icon type="pie-chart" /><span>{this.msg('sectionInspection')}</span></span>}>
              <Menu.Item key="9">{this.msg('customsInspection')}</Menu.Item>
              <Menu.Item key="10">{this.msg('ciqInspection')}</Menu.Item>
            </SubMenu>
          </Menu>
        </aside>
        <div className="main-content with-side-bar">
          <div className="page-body card-wrapper">
            <Card title={this.msg('ontimeDelivery')}>
              <div id="c1"></div>
            </Card>
          </div>
          <div className="page-body">
            <div className="panel-body table-panel">
            <Table dataSource={dataSource} columns={columns} pagination={false} size="middle" />
            </div>
          </div>
        </div>
      </QueueAnim>
    );
  }
}
