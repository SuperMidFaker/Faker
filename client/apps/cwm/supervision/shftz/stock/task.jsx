import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Badge, Breadcrumb, Layout, Tabs, Row, Col, Card } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import PageHeader from 'client/components/PageHeader';
import InfoItem from 'client/components/InfoItem';
import FTZStockPane from './tabpane/ftzStockPane';
import ComaprisonPane from './tabpane/comparisonPane';
import DiscrepancyPane from './tabpane/discrepancyPane';
import { loadStockCompareTask, loadParams } from 'common/reducers/cwmShFtz';
import { formatMsg } from './message.i18n';

const { Content } = Layout;
const TabPane = Tabs.TabPane;

function fetchData({ dispatch, params }) {
  const promises = [];
  promises.push(dispatch(loadStockCompareTask(params.taskId)));
  promises.push(dispatch(loadParams()));
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    whse: state.cwmContext.defaultWhse,
    task: state.cwmShFtz.compareTask.task,
  }),
  { }
)
@connectNav({
  depth: 3,
  moduleName: 'cwm',
})
export default class SHFTZStockTask extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }

  msg = formatMsg(this.props.intl)

  render() {
    const { whse, task } = this.props;
    return (
      <div>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
              上海自贸区监管
            </Breadcrumb.Item>
              <Breadcrumb.Item>
                {whse.name}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                对比任务
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.props.params.taskId}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
        </PageHeader>
        <Content className="page-content" key="main">
          <Card noHovering bodyStyle={{ paddingBottom: 8 }}>
            <Row gutter={16} className="info-group-underline">
              <Col sm={12} lg={8}>
                <InfoItem label="货主单位" field={`${task.owner_cus_code} | ${task.owner_name}`} />
              </Col>
              <Col sm={12} lg={4}>
                <InfoItem label="海关入库单" field={task.ftz_ent_no} />
              </Col>
            </Row>
          </Card>
          <Card noHovering bodyStyle={{ padding: 0 }}>
            <Tabs defaultActiveKey="comparison">
              <TabPane tab="对比视图" key="comparison">
                <ComaprisonPane />
              </TabPane>
              <TabPane tab={<Badge count={task.diff_count}>差异视图</Badge>} key="discrepancy">
                <DiscrepancyPane />
              </TabPane>
              <TabPane tab="海关库存数据" key="ftz">
                <FTZStockPane taskId={this.props.params.taskId} />
              </TabPane>
            </Tabs>
          </Card>
        </Content>
      </div>
    );
  }
}
