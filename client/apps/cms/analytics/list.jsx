import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Button, Card, Collapse, Layout, List } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { toggleReportSettingDock } from 'common/reducers/cmsAnalytics';
import connectNav from 'client/common/decorators/connect-nav';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { MiniArea, MiniBar, Pie } from 'client/components/Charts';
import PageHeader from 'client/components/PageHeader';
import ReportSettingPanel from './panel/reportSettingPanel';
import { formatMsg } from './message.i18n';

const { Content } = Layout;
const { Panel } = Collapse;

function Chart(props) {
  const {
    item,
  } = props;

  if (item.chartType === 'pie') {
    return (<Pie
      data={item.chartData}
      height={120}
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
  { toggleReportSettingDock }
)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
@withPrivilege({ module: 'clearance', feature: 'setting', action: 'edit' })
export default class AnalyticsList extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
  }
  msg = formatMsg(this.props.intl)
  handleChart = (id) => {
    const link = `/clearance/analytics/report/${id}`;
    this.context.router.push(link);
  }
  showReportSettingDock = () => {
    this.props.toggleReportSettingDock(true);
  }
  render() {
    const visitData = [];
    const beginDay = new Date().getTime();
    for (let i = 0; i < 20; i += 1) {
      visitData.push({
        x: moment(new Date(beginDay + (1000 * 60 * 60 * 24 * i))).format('YYYY-MM-DD'),
        y: Math.floor(Math.random() * 100) + 10,
      });
    }
    const delgAnalytics = [
      {
        id: '5a3098a3366d746064c5cd09',
        title: '按委托单位分布',
        chartType: 'pie',
        chartData: [
          {
            x: '西门子',
            y: 4544,
          },
          {
            x: '罗姆半导体',
            y: 3321,
          },
          {
            x: '马瑞利',
            y: 3113,
          },
        ],
      },
      {
        id: '5a3098a3366d746064c5cd0c',
        title: '按代理单位分布',
        chartType: 'pie',
        chartData: [
          {
            x: '茂鸿国际',
            y: 4544,
          },
          {
            x: '恩诺茂鸿',
            y: 3321,
          },
          {
            x: '经贸虹桥',
            y: 3113,
          },
        ],
      },
      {
        id: '5a3098a3366d746064c5cd0f',
        title: '日变化趋势',
        chartType: 'bar',
        chartData: visitData,
      },
    ];
    const cusDeclAnalytics = [
      {
        id: '5a3098a3366d746064c5qw12',
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
      },
      {
        id: '5a3098a3366d746064c5340p',
        title: '按运输方式分布',
        chartType: 'pie',
        chartData: [
          {
            x: '航空运输',
            y: 4544,
          },
          {
            x: '水路运输',
            y: 3321,
          },
          {
            x: '保税区',
            y: 3113,
          },
          {
            x: '铁路运输',
            y: 2341,
          },
        ],
      },
      {
        id: '5a3098a3366d746064c5c934',
        title: '按进出口岸分布',
        chartType: 'pie',
        chartData: [
          {
            x: '浦东机场',
            y: 4544,
          },
          {
            x: '洋山海关（港区）',
            y: 3321,
          },
          {
            x: '上海快件',
            y: 3113,
          },
          {
            x: '外高桥关',
            y: 2341,
          },
          {
            x: '津机场办',
            y: 1231,
          },
          {
            x: '浦江海关',
            y: 1231,
          },
        ],
      },
      {
        id: '5a3098a3366d746064c5er60',
        title: '按监管方式分布',
        chartType: 'pie',
        chartData: [
          {
            x: '一般贸易',
            y: 4544,
          },
          {
            x: '保税区仓储转口',
            y: 3321,
          },
        ],
      },
    ];
    const customPanelStyle = {
      background: 'transparent',
      border: 0,
    };
    return (
      <Layout>
        <PageHeader title={this.msg('analytics')}>
          <PageHeader.Actions>
            <Button icon="setting" onClick={this.showReportSettingDock}>{this.msg('reportSetting')}</Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content layout-fixed-width layout-fixed-width-lg">
          <Collapse bordered={false} defaultActiveKey={['delgAnalytics', 'cusDeclAnalytics']}>
            <Panel header={this.msg('delgAnalytics')} key="delgAnalytics" style={customPanelStyle}>
              <List
                grid={{ gutter: 16, column: 4 }}
                dataSource={delgAnalytics}
                renderItem={item => (
                  <List.Item>
                    <Card title={item.title} hoverable onClick={() => this.handleChart(item.id)}>
                      <Chart item={item} />
                    </Card>
                  </List.Item>)}
              />
            </Panel>
            <Panel header={this.msg('cusDeclAnalytics')} key="cusDeclAnalytics" style={customPanelStyle}>
              <List
                grid={{ gutter: 16, column: 4 }}
                dataSource={cusDeclAnalytics}
                renderItem={item => (
                  <List.Item>
                    <Card title={item.title} hoverable onClick={() => this.handleChart(item.id)}>
                      <Chart item={item} />
                    </Card>
                  </List.Item>)}
              />
            </Panel>
          </Collapse>
          <ReportSettingPanel />
        </Content>
      </Layout>
    );
  }
}
