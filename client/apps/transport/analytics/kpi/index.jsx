import React, { PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { Breadcrumb, Layout, Select, DatePicker, Button, Menu, Dropdown, Icon, Table, Input } from 'antd';
import { loadKpi, changeModes } from 'common/reducers/transportKpi';
import { loadFormRequire } from 'common/reducers/shipment';
import TrafficVolume from './trafficVolume';
import Punctual from './punctual';
import OverTime from './overTime';
import Fees from './fees';
import Exceptional from './exceptional';
import { createFilename } from 'client/util/dataTransform';

const { Header, Content, Sider } = Layout;
const Option = Select.Option;
const { MonthPicker } = DatePicker;
const SubMenu = Menu.SubMenu;
const Search = Input.Search;

function fetchData({ cookie, state, dispatch }) {
  return dispatch(loadFormRequire(cookie, state.account.tenantId));
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
    loading: state.transportKpi.loading,
    loaded: state.transportKpi.loaded,
    modes: state.transportKpi.modes,
  }),
  { loadKpi, changeModes }
)
export default class Kpi extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loadKpi: PropTypes.func.isRequired,
    kpi: PropTypes.object.isRequired,
    query: PropTypes.object.isRequired,
    clients: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired,
    loaded: PropTypes.bool.isRequired,
    changeModes: PropTypes.func.isRequired,
    modes: PropTypes.object.isRequired,
  }
  state = {
    selectedKey: '1',
    customer: {},
    currentPage: 1,
    collapsed: false,
    clients: [],
  }
  componentWillReceiveProps(nextProps) {
    this.setState({ clients: nextProps.clients });
    if (!nextProps.loaded && nextProps.clients.length !== this.props.clients.length) {
      this.setState({ customer: nextProps.clients[0] || {} });
      const beginDate = new Date();
      beginDate.setMonth(beginDate.getMonth() - 5);
      const endDate = new Date();
      const { tenantId, query } = nextProps;
      this.props.loadKpi(
        tenantId,
        beginDate,
        endDate,
        nextProps.clients[0].partner_id,
        query.separationDate
      );
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    const np = { ...nextProps };
    const tp = { ...this.props };
    delete np.modes;
    delete tp.modes;
    if (JSON.stringify(np) === JSON.stringify(tp) && JSON.stringify(nextState) === JSON.stringify(this.state)) return false;
    return true;
  }
  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }
  handleRowClick = (record) => {
    this.setState({
      customer: record,
    });
    const { tenantId, query } = this.props;
    this.props.loadKpi(tenantId, query.beginDate, query.endDate, record.partner_id, query.separationDate);
  }
  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  }
  handleSearch = (value) => {
    const clients = this.props.clients.filter((item) => {
      if (value) {
        const reg = new RegExp(value);
        return reg.test(item.name);
      } else {
        return true;
      }
    });
    this.setState({ clients, currentPage: 1 });
  }
  handleBeginDateChange = (date) => {
    const { tenantId, query } = this.props;
    this.props.loadKpi(tenantId, date, query.endDate, query.partnerId, query.separationDate);
  }
  handleEndDateChange = (date) => {
    const { tenantId, query } = this.props;
    this.props.loadKpi(tenantId, query.beginDate, date, query.partnerId, query.separationDate);
  }
  handleMonth = (month) => {
    const { tenantId, query } = this.props;
    const end = new Date();
    const begin = new Date();
    begin.setMonth(begin.getMonth() - month);
    this.props.loadKpi(tenantId, begin, end, query.partnerId, query.separationDate);
  }
  handleSeparationDateChange = (value) => {
    const { tenantId, query } = this.props;
    this.props.loadKpi(tenantId, query.beginDate, query.endDate, query.partnerId, value);
  }
  handleMenuChange = (e) => {
    this.setState({ selectedKey: e.key });
  }
  handleExportExcel = (type) => {
    const { modes } = this.props;
    const { transitModes, range, shipmentCounts, punctualShipmentCounts, shipmentFees, exceptionalShipmentCounts } = this.props.kpi;
    window.open(`${API_ROOTS.default}v1/transport/kpi/exportExcel/${createFilename('KPI')}.xlsx?transitModes=${JSON.stringify(transitModes)}&range=${
      JSON.stringify(range)}&shipmentCounts=${JSON.stringify(shipmentCounts)}&punctualShipmentCounts=${JSON.stringify(punctualShipmentCounts)
      }&shipmentFees=${JSON.stringify(shipmentFees)}&exceptionalShipmentCounts=${JSON.stringify(exceptionalShipmentCounts)}&modes=${JSON.stringify(modes)
      }&type=${type}`);
  }
  handleModesChange = (modes) => {
    this.props.changeModes(modes);
  }
  handleExportClick = (e) => {
    let type = -1;
    if (e.key === '1') type = -1;
    else if (e.key === '2') type = this.state.selectedKey;
    this.handleExportExcel(type);
  }
  renderSeparationDateOption = () => {
    const options = [];
    for (let i = 1; i <= 28; i++) {
      options.push(<Option value={i}>{i}日</Option>);
    }
    return options;
  }
  render() {
    const { query, kpi, loading, loaded, modes } = this.props;
    const { selectedKey, customer } = this.state;
    let content = (<span />);
    if (selectedKey === '1') {
      content = (<Punctual kpi={kpi} loading={loading} loaded={loaded} modes={modes.punctual} onModesChange={this.handleModesChange} />);
    } else if (selectedKey === '2') {
      content = (<OverTime kpi={kpi} loading={loading} loaded={loaded} modes={modes.overTime} onModesChange={this.handleModesChange} />);
    } else if (selectedKey === '3') {
      content = (<TrafficVolume kpi={kpi} loading={loading} loaded={loaded} modes={modes.volume} onModesChange={this.handleModesChange} />);
    } else if (selectedKey === '4') {
      content = (<Fees kpi={kpi} loading={loading} loaded={loaded} modes={modes.fees} onModesChange={this.handleModesChange} />);
    } else if (selectedKey === '5') {
      content = (<Exceptional kpi={kpi} loading={loading} loaded={loaded} modes={modes.exception} onModesChange={this.handleModesChange} />);
    }
    const menu = (
      <Menu onClick={this.handleExportClick}>
        <Menu.Item key="1">导出全部</Menu.Item>
        <Menu.Item key="2">导出当前</Menu.Item>
      </Menu>
    );
    const columns = [{
      dataIndex: 'name',
      key: 'name',
      render: o => (<div style={{ paddingLeft: 15 }}>{o}</div>),
    }];
    return (
      <Layout>
        <Sider width={320} className="menu-sider" key="sider" trigger={null}
          collapsible
          collapsed={this.state.collapsed}
          collapsedWidth={0}
        >
          <div className="left-sider-panel">
            <div className="top-bar">
              <Breadcrumb>
                <Breadcrumb.Item>
                  客户
                </Breadcrumb.Item>
              </Breadcrumb>
            </div>
            <div className="left-sider-panel">
              <div className="toolbar">
                <Search
                  placeholder="搜索客户"
                  onSearch={this.handleSearch} size="large"
                />
              </div>
              <Table size="middle" dataSource={this.state.clients} columns={columns} showHeader={false} onRowClick={this.handleRowClick}
                pagination={{ current: this.state.currentPage, defaultPageSize: 15, onChange: this.handlePageChange }} rowKey="partner_id"
                rowClassName={record => record.partner_id === customer.partner_id ? 'table-row-selected' : ''}
              />
            </div>
          </div>
        </Sider>
        <Layout>
          <Header className="top-bar">
            { this.state.collapsed && <Breadcrumb>
              <Breadcrumb.Item>
                报表中心
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                KPI分析
              </Breadcrumb.Item>
            </Breadcrumb>}
            <Button size="large"
              className={this.state.collapsed ? '' : 'btn-toggle-on'}
              icon={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
              onClick={this.toggle}
            />
            <div className="top-bar-tools">
              <Dropdown overlay={menu}>
                <Button style={{ marginLeft: 8 }}>
                  导出 <Icon type="down" />
                </Button>
              </Dropdown>
            </div>
          </Header>
          <Content className="main-content">
            <div className="page-body">
              <div className="toolbar">
                <div className="toolbar-right">
                  <a onClick={() => this.handleMonth(2)}>近3月</a>
                  <a onClick={() => this.handleMonth(5)} style={{ marginLeft: 20 }}>近6月</a>
                  <a onClick={() => this.handleMonth(11)} style={{ marginLeft: 20 }}>近一年</a>
                  <MonthPicker size="large" allowClear={false} value={moment(query.beginDate)} onChange={this.handleBeginDateChange} />
                  <span>~</span>
                  <MonthPicker size="large" allowClear={false} value={moment(query.endDate)} onChange={this.handleEndDateChange} />
                  <span style={{ marginLeft: 20 }}>结算日:</span>
                  <Select style={{ width: 70, marginLeft: 5 }} value={query.separationDate} onChange={this.handleSeparationDateChange}>
                    {this.renderSeparationDateOption()}
                  </Select>
                </div>
              </div>
              <Layout className="main-wrapper">
                <Sider className="nav-sider" width={150}>
                  <Menu onClick={this.handleMenuChange}
                    style={{ width: 150 }}
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
                    <Menu.Item key="5">异常票数统计</Menu.Item>
                  </Menu>
                </Sider>
                <Content style={{ padding: '0 24px', minHeight: 280 }}>
                  {content}
                </Content>
              </Layout>
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
