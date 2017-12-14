import React from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import connectNav from 'client/common/decorators/connect-nav';
import { Breadcrumb, Layout, Select, DatePicker, Button, Menu, Dropdown, Icon, Table, Input } from 'antd';
import { loadKpi, changeModes } from 'common/reducers/transportKpi';
import { loadPartners } from 'common/reducers/shipment';
import ButtonToggle from 'client/components/ButtonToggle';
import TrafficVolume from './trafficVolume';
import Punctual from './punctual';
import OverTime from './overTime';
import Fees from './fees';
import Exceptional from './exceptional';
import { createFilename } from 'client/util/dataTransform';
import { PARTNER_ROLES, PARTNER_BUSINESSE_TYPES } from 'common/constants';

const { Header, Content, Sider } = Layout;
const Option = Select.Option;
const { MonthPicker } = DatePicker;
const SubMenu = Menu.SubMenu;
const Search = Input.Search;

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
    loading: state.transportKpi.loading,
    loaded: state.transportKpi.loaded,
    modes: state.transportKpi.modes,
  }),
  { loadKpi, changeModes, loadPartners }
)
export default class Kpi extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loadKpi: PropTypes.func.isRequired,
    kpi: PropTypes.object.isRequired,
    query: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    loaded: PropTypes.bool.isRequired,
    changeModes: PropTypes.func.isRequired,
    modes: PropTypes.object.isRequired,
    loadPartners: PropTypes.func.isRequired,
  }
  state = {
    selectedKey: '1',
    customer: {},
    currentPage: 1,
    collapsed: false,
    customers: [],
    carriers: [],
    clients: [],
    loaded: false,
    sourceType: 'sp',
  }
  componentWillMount() {
    this.props.loadPartners(this.props.tenantId, [PARTNER_ROLES.CUS, PARTNER_ROLES.DCUS], [PARTNER_BUSINESSE_TYPES.transport]).then((result) => {
      this.setState({ customers: result.data, clients: result.data }, () => {
        this.handleTableLoad(this.props);
      });
    });
    this.props.loadPartners(this.props.tenantId, [PARTNER_ROLES.SUP], [PARTNER_BUSINESSE_TYPES.transport]).then((result) => {
      this.setState({ carriers: result.data });
    });
  }
  componentWillReceiveProps(nextProps) {
    if (this.state.clients.length > 0) {
      this.setState({ loaded: nextProps.loaded });
    }
    if (!nextProps.loaded && this.state.clients.length !== this.state.clients.length) {
      this.handleTableLoad(nextProps);
    }
    if (this.state.clients.length > 0 && !this.state.customer.partner_id) {
      this.setState({ customer: this.state.clients[0] });
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
  handleTableLoad = (props) => {
    const beginDate = new Date();
    beginDate.setMonth(beginDate.getMonth() - 5);
    const endDate = new Date();
    const { tenantId, query } = props;
    this.props.loadKpi(
      tenantId,
      beginDate,
      endDate,
      this.state.clients[0] ? this.state.clients[0].partner_id : -1,
      this.state.clients[0] ? this.state.clients[0].tid : -1,
      query.separationDate,
      this.state.sourceType
    );
  }
  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
      loaded: false,
    }, () => {
      window.setTimeout(() => {
        this.setState({ loaded: true });
      }, 200);
    });
  }
  handleRowClick = (record) => {
    this.setState({
      customer: record,
    });
    const { tenantId, query } = this.props;
    this.props.loadKpi(tenantId, query.beginDate, query.endDate, record.partner_id, record.tid, query.separationDate, this.state.sourceType);
  }
  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  }
  handleSearch = (value) => {
    let sourceClients = [];
    if (this.state.sourceType === 'sp') {
      sourceClients = this.state.customers;
    } else if (this.state.sourceType === 'sr') {
      sourceClients = this.state.carriers;
    }
    const clients = sourceClients.filter((item) => {
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
    this.props.loadKpi(tenantId, date, query.endDate, query.partnerId, query.partnerTenantId, query.separationDate, this.state.sourceType);
  }
  handleEndDateChange = (date) => {
    const { tenantId, query } = this.props;
    this.props.loadKpi(tenantId, query.beginDate, date, query.partnerId, query.partnerTenantId, query.separationDate, this.state.sourceType);
  }
  handleMonth = (month) => {
    const { tenantId, query } = this.props;
    const end = new Date();
    const begin = new Date();
    begin.setMonth(begin.getMonth() - month);
    this.props.loadKpi(tenantId, begin, end, query.partnerId, query.partnerTenantId, query.separationDate, this.state.sourceType);
  }
  handleSeparationDateChange = (value) => {
    const { tenantId, query } = this.props;
    this.props.loadKpi(tenantId, query.beginDate, query.endDate, query.partnerId, query.partnerTenantId, value, this.state.sourceType);
  }
  toggleSourceType = () => {
    let sourceType = this.state.sourceType;
    let clients = [...this.state.clients];
    if (this.state.sourceType === 'sp') {
      sourceType = 'sr';
      clients = [...this.state.carriers];
    } else if (this.state.sourceType === 'sr') {
      sourceType = 'sp';
      clients = [...this.state.customers];
    }
    this.setState({ sourceType, clients, customer: clients[0] });
    const { tenantId, query } = this.props;
    this.props.loadKpi(
      tenantId,
      query.beginDate,
      query.endDate,
      clients.length > 0 ? clients[0].partner_id : -1,
      clients.length > 0 ? clients[0].tid : -1,
      query.separationDate,
      sourceType);
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
    const { query, kpi, loading, modes } = this.props;
    const { selectedKey, customer, collapsed, loaded, sourceType } = this.state;
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
      render: o => (<span style={{ paddingLeft: 15 }}>{o}</span>),
    }];
    let clientStr = '';
    let swap = '';
    if (sourceType === 'sp') {
      clientStr = '客户';
      swap = '承运商';
    } else if (sourceType === 'sr') {
      clientStr = '承运商';
      swap = '客户';
    }
    return (
      <Layout>
        <Sider width={320} className="menu-sider" key="sider" trigger={null}
          collapsible
          collapsed={collapsed}
          collapsedWidth={0}
        >
          <div className="page-header">
            <Breadcrumb>
              <Breadcrumb.Item>
                {clientStr}
              </Breadcrumb.Item>
            </Breadcrumb>
            <div style={{ float: 'right' }}><Button onClick={this.toggleSourceType} icon="swap">{swap}</Button></div>
          </div>
          <div className="left-sider-panel">
            <div className="toolbar">
              <Search
                placeholder="搜索"
                onSearch={this.handleSearch}
              />
            </div>
            <div className="list-body">
              <Table size="middle" dataSource={this.state.clients} columns={columns} showHeader={false}
                pagination={{ current: this.state.currentPage, defaultPageSize: 15, onChange: this.handlePageChange }} rowKey="partner_id"
                rowClassName={record => record.partner_id === customer.partner_id ? 'table-row-selected' : ''}
                onRow={record => ({
                  onClick: () => { this.handleRowClick(record); },
                })}
              />
            </div>
          </div>
        </Sider>
        <Layout>
          <Header className="page-header">
            { this.state.collapsed && <Breadcrumb>
              <Breadcrumb.Item>
                报表中心
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                KPI分析
              </Breadcrumb.Item>
            </Breadcrumb>}
            <ButtonToggle
              iconOn="menu-fold" iconOff="menu-unfold"
              onClick={this.toggle}
              toggle
            />
            <div className="page-header-tools">
              <Dropdown overlay={menu}>
                <Button style={{ marginLeft: 8 }}>
                  导出 <Icon type="down" />
                </Button>
              </Dropdown>
            </div>
          </Header>
          <Content className="main-content" id="transport-kpi-main-content">
            <div className="page-body">
              <div className="toolbar">
                <h3>{this.state.collapsed ? customer.name : ''}</h3>
                <div className="toolbar-right">
                  <a onClick={() => this.handleMonth(2)}>近3月</a>
                  <a onClick={() => this.handleMonth(5)} style={{ marginLeft: 20 }}>近6月</a>
                  <a onClick={() => this.handleMonth(11)} style={{ marginLeft: 20 }}>近一年</a>
                  <MonthPicker allowClear={false} value={moment(query.beginDate)} onChange={this.handleBeginDateChange} />
                  <span>~</span>
                  <MonthPicker allowClear={false} value={moment(query.endDate)} onChange={this.handleEndDateChange} />
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
