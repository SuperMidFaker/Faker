import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Card, Layout, Table } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { MiniArea, MiniBar, Pie } from 'client/components/Charts';
import PageHeader from 'client/components/PageHeader';
import { formatMsg } from './message.i18n';

const { Content } = Layout;

function Chart(props) {
  const {
    item,
  } = props;

  if (item.chartType === 'pie') {
    return (<Pie
      data={item.chartData}
      height={240}
    />);
  } else if (item.chartType === 'bar') {
    return (<MiniBar
      height={120}
      data={item.chartData}
    />);
  } else if (item.chartType === 'area') {
    return (<MiniArea
      line
      color="#cceafe"
      height={45}
      data={item.chartData}
    />);
  }
}
Chart.propTypes = {
  item: PropTypes.shape({
    chartType: PropTypes.string,
    chartData: PropTypes.array,
  }).isRequired,
};

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    invTemplates: state.cmsInvoice.invTemplates,
    docuType: state.cmsInvoice.docuType,
  }),
  { }
)
@connectNav({
  depth: 3,
  moduleName: 'clearance',
})
@withPrivilege({ module: 'clearance', feature: 'setting', action: 'edit' })
export default class AnalyticsChart extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
  }
  msg = formatMsg(this.props.intl)
  columns = [{
    title: this.msg('col'),
    dataIndex: 'col',
  }, {
    title: this.msg('value'),
    dataIndex: 'value',
  }]
  render() {
    const visitData = [];
    const beginDay = new Date().getTime();
    for (let i = 0; i < 20; i += 1) {
      visitData.push({
        x: moment(new Date(beginDay + (1000 * 60 * 60 * 24 * i))).format('YYYY-MM-DD'),
        y: Math.floor(Math.random() * 100) + 10,
      });
    }
    const item = {
      title: '按报关类型分布',
      chartType: 'pie',
      chartData: [
        {
          x: '进境备案',
          y: 4544,
        },
        {
          x: '进口报关',
          y: 3321,
        },
        {
          x: '出境备案',
          y: 3113,
        },
        {
          x: '出口报关',
          y: 2341,
        },
      ],
    };
    return (
      <Layout>
        <PageHeader breadcrumb={[this.msg('analytics'), item.title]} />
        <Content className="page-content layout-fixed-width">
          <Card>
            <Chart item={item} />
          </Card>
          <Card bodyStyle={{ padding: 0 }}>
            <Table size="middle" columns={this.columns} pagination={false} />
          </Card>
        </Content>
      </Layout>
    );
  }
}
