import React, { PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { Layout, Select, DatePicker, Button, Tabs } from 'antd';
import { loadKpi } from 'common/reducers/transportKpi';
import { loadFormRequire } from 'common/reducers/shipment';
import TrafficVolume from './trafficVolume';
import Punctual from './punctual';

const { Header, Content } = Layout;
const Option = Select.Option;
const { RangePicker } = DatePicker;
const TabPane = Tabs.TabPane;

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
  handleCustomerChange = (partnerId) => {
    const { tenantId, query } = this.props;
    this.props.loadKpi(tenantId, query.beginDate, query.endDate, partnerId || -1);
  }
  handleDateChange = (dates) => {
    const { tenantId, query } = this.props;
    this.props.loadKpi(tenantId, dates[0], dates[1], query.partnerId);
  }
  render() {
    const { query, clients, kpi } = this.props;
    return (
      <div>
        <Header className="top-bar">
          <span>KPI</span>
        </Header>
        <Content className="main-content">
          <div className="page-body">
            <div className="toolbar">
              <Button>导出</Button>
              <RangePicker format="YYYY-MM" value={[moment(query.beginDate), moment(query.endDate)]} onChange={this.handleDateChange} />
              <Select
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
            </div>
            <Tabs defaultActiveKey="2" tabPosition="left">
              <TabPane tab="准时交付率" key="1"><Punctual kpi={kpi} /></TabPane>
              <TabPane tab="运输量统计" key="2"><TrafficVolume kpi={kpi} /></TabPane>
              <TabPane tab="运输费统计" key="3">运输费统计</TabPane>
            </Tabs>

          </div>
        </Content>
      </div>
    );
  }
}
