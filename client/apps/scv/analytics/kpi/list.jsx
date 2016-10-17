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
    window.$('<div style="position: absolute;width: 100px;top: 160px;left: 100px;text-align: center;color: #444;"><p>Ontime Shipments</p><p style="font-size:18px;font-weight:bold;">90.2%</p>').appendTo('#c1');
    window.$('<div style="position: absolute;width: 100px;top: 160px;left: 400px;text-align: center;color: #444;"><p>Ontime Orders</p><p style="font-size:18px;font-weight:bold;">87.9%</p>').appendTo('#c1');

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
    const Stat = window.G2.Stat;
    const chart = new window.G2.Chart({
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
      ontimeShipments: 112,
      ttlShipments: 124,
      ontimeShipmentsRate: '90.32%',
      ontimeOrders: 112,
      ttlOrders: 124,
      ontimeOrdersRate: '90.32%',
    }, {
      key: '2',
      month: 'Feb',
      ontimeShipments: 101,
      ttlShipments: 109,
      ontimeShipmentsRate: '92.66%',
      ontimeOrders: 101,
      ttlOrders: 109,
      ontimeOrdersRate: '92.66%',
    }, {
      key: '3',
      month: 'Mar',
      ontimeShipments: 148,
      ttlShipments: 160,
      ontimeShipmentsRate: '92.5%',
      ontimeOrders: 148,
      ttlOrders: 160,
      ontimeOrdersRate: '92.5%',
    }, {
      key: '4',
      month: 'Apr',
      ontimeShipments: 160,
      ttlShipments: 174,
      ontimeShipmentsRate: '91.95%',
      ontimeOrders: 160,
      ttlOrders: 174,
      ontimeOrdersRate: '91.95%',
    }, {
      key: '5',
      month: 'May',
      ontimeShipments: 129,
      ttlShipments: 140,
      ontimeShipmentsRate: '92.14%',
      ontimeOrders: 129,
      ttlOrders: 140,
      ontimeOrdersRate: '92.14%',
    }, {
      key: '6',
      month: 'Jun',
      ontimeShipments: 146,
      ttlShipments: 158,
      ontimeShipmentsRate: '92.41%',
      ontimeOrders: 146,
      ttlOrders: 158,
      ontimeOrdersRate: '92.41%',
    }, {
      key: '7',
      month: 'Jul',
      ontimeShipments: 145,
      ttlShipments: 157,
      ontimeShipmentsRate: '92.36%',
      ontimeOrders: 145,
      ttlOrders: 157,
      ontimeOrdersRate: '92.36%',
    }, {
      key: '8',
      month: 'Aug',
      ontimeShipments: 132,
      ttlShipments: 142,
      ontimeShipmentsRate: '92.31%',
      ontimeOrders: 132,
      ttlOrders: 142,
      ontimeOrdersRate: '92.31%',
    }, {
      key: '9',
      month: 'Sep',
      ontimeShipments: 161,
      ttlShipments: 173,
      ontimeShipmentsRate: '93.06%',
      ontimeOrders: 161,
      ttlOrders: 173,
      ontimeOrdersRate: '93.06%',
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
          <div className="tools" />
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
              <div id="c1" />
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
