import React, { PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { Breadcrumb, Layout, Select, DatePicker, Button, Menu } from 'antd';
import { loadKpi } from 'common/reducers/transportKpi';
import { loadFormRequire } from 'common/reducers/shipment';
import TrafficVolume from './trafficVolume';
import Punctual from './punctual';
import OverTime from './overTime';
import { createFilename } from 'client/util/dataTransform';

const { Header, Content, Sider } = Layout;
const Option = Select.Option;
const { MonthPicker } = DatePicker;
const SubMenu = Menu.SubMenu;

function fetchData({ cookie, state, dispatch }) {
  const beginDate = new Date();
  beginDate.setMonth(beginDate.getMonth() - 5);
  const endDate = new Date();
  dispatch(loadFormRequire(cookie, state.account.tenantId));
  return dispatch(loadKpi(
    state.account.tenantId,
    beginDate,
    endDate,
    -1,
    state.transportKpi.separationDate
  ));
}

@connectFetch()(fetchData)
@injectIntl
@connectNav({
  depth: 2,
  moduleName: 'transport',
})
@connect(
  state => ({
    tenantId: state.account.tenantId,
    kpi: state.transportKpi.kpi,
    query: state.transportKpi.query,
    clients: state.shipment.formRequire.clients,
  }),
  { loadKpi }
)
export default class Kpi extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loadKpi: PropTypes.func.isRequired,
    kpi: PropTypes.object.isRequired,
    query: PropTypes.object.isRequired,
    clients: PropTypes.array.isRequired,
  }
  state = {
    selectedKey: '1',
  }
  handleCustomerChange = (partnerId) => {
    const { tenantId, query } = this.props;
    this.props.loadKpi(tenantId, query.beginDate, query.endDate, partnerId || -1);
  }
  handleBeginDateChange = (date) => {
    const { tenantId, query } = this.props;
    this.props.loadKpi(tenantId, date, query.endDate, query.partnerId);
  }
  handleEndDateChange = (date) => {
    const { tenantId, query } = this.props;
    this.props.loadKpi(tenantId, query.beginDate, date, query.partnerId);
  }
  handleMonth = (month) => {
    const { tenantId, query } = this.props;
    const end = new Date();
    const begin = new Date();
    begin.setMonth(begin.getMonth() - month);
    this.props.loadKpi(tenantId, begin, end, query.partnerId);
  }
  handleMenuChange = (e) => {
    this.setState({ selectedKey: e.key });
  }
  handleExportExcel = () => {
    const { transitModes, range, shipmentCounts, punctualShipmentCounts } = this.props.kpi;
    window.open(`${API_ROOTS.default}v1/transport/kpi/exportExcel/${createFilename('KPI')}.xlsx?transitModes=${JSON.stringify(transitModes)}&range=${
      JSON.stringify(range)}&shipmentCounts=${JSON.stringify(shipmentCounts)}&punctualShipmentCounts=${JSON.stringify(punctualShipmentCounts)}`);
  }
  render() {
    const { query, clients, kpi } = this.props;
    const { selectedKey } = this.state;
    let content = (<span />);
    if (selectedKey === '1') {
      content = (<Punctual kpi={kpi} />);
    } else if (selectedKey === '2') {
      content = (<OverTime kpi={kpi} />);
    } else if (selectedKey === '3') {
      content = (<TrafficVolume kpi={kpi} />);
    } else if (selectedKey === '4') {
      content = (<span>运输费统计</span>);
    }
    return (
      <div>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              报表中心
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              KPI分析
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="top-bar-tools">
            <Button size="large" type="primary" onClick={this.handleExportExcel}>导出全部</Button>
          </div>
        </Header>
        <Content className="main-content">
          <div className="page-body">
            <div className="toolbar">
              <Select
                size="large"
                showSearch
                style={{ width: 300 }}
                placeholder="选择一个客户"
                optionFilterProp="children"
                onChange={this.handleCustomerChange}
                allowClear
              >
                {
                    clients.map(pt => (
                      <Option searched={`${pt.partner_code}${pt.name}`}
                        value={pt.partner_id} key={pt.partner_id}
                      >
                        {pt.partner_code ? `${pt.partner_code} | ${pt.name}` : pt.name}
                      </Option>)
                    )
                  }
              </Select>
              <div className="toolbar-right">
                <a onClick={() => this.handleMonth(2)}>近3月</a>
                <a onClick={() => this.handleMonth(5)} style={{ marginLeft: 20 }}>近6月</a>
                <a onClick={() => this.handleMonth(11)} style={{ marginLeft: 20 }}>近一年</a>
                <MonthPicker size="large" allowClear={false} value={moment(query.beginDate)} onChange={this.handleBeginDateChange} />
                <span>~</span>
                <MonthPicker size="large" allowClear={false} value={moment(query.endDate)} onChange={this.handleEndDateChange} />
              </div>
            </div>
            <Layout className="main-wrapper">
              <Sider className="nav-sider">
                <Menu onClick={this.handleMenuChange}
                  style={{ width: 'inherit' }}
                  defaultOpenKeys={['sub1']}
                  selectedKeys={[selectedKey]}
                  mode="inline"
                >
                  <SubMenu key="sub1" title="交付率统计">
                    <Menu.Item key="1">准时</Menu.Item>
                    <Menu.Item key="2">超时</Menu.Item>
                  </SubMenu>
                  <Menu.Item key="3">运输量统计</Menu.Item>
                  <Menu.Item key="4">运输费统计</Menu.Item>
                </Menu>
              </Sider>
              <Content style={{ padding: '0 24px', minHeight: 280 }}>
                {content}
              </Content>
            </Layout>
          </div>
        </Content>
      </div>
    );
  }
}
