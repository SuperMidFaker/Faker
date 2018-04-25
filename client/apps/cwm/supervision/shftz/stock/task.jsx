import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Badge, Layout, Tabs } from 'antd';
import { loadParams } from 'common/reducers/cwmShFtz';
import { loadStockCompareTask } from 'common/reducers/cwmShFtzStock';
import connectNav from 'client/common/decorators/connect-nav';
import PageHeader from 'client/components/PageHeader';
import Drawer from 'client/components/Drawer';
import MagicCard from 'client/components/MagicCard';
import DescriptionList from 'client/components/DescriptionList';
import FTZStockPane from './tabpane/ftzStockPane';
import ComaprisonPane from './tabpane/comparisonPane';
import DiscrepancyPane from './tabpane/discrepancyPane';
import { formatMsg } from './message.i18n';

const { Content } = Layout;
const { TabPane } = Tabs;
const { Description } = DescriptionList;

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
    whse: state.cwmContext.defaultWhse,
    task: state.cwmShFtzStock.compareTask.task,
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
  state = {
    scrollOffset: 368,
  }
  msg = formatMsg(this.props.intl)
  handleCollapseChange = (collapsed) => {
    const scrollOffset = collapsed ? 368 : 280;
    this.setState({ scrollOffset });
  }
  render() {
    const { whse, task } = this.props;
    return (
      <Layout>
        <PageHeader
          breadcrumb={[
            whse.name,
            this.msg('对比任务'),
            this.props.params.taskId,
          ]}
        />
        <Layout>
          <Drawer top onCollapseChange={this.handleCollapseChange}>
            <DescriptionList col={3}>
              <Description term="货主单位">
                {`${task.owner_cus_code} | ${task.owner_name}`}
              </Description>
              <Description term="海关入库单">
                {task.ftz_ent_no}
              </Description>
            </DescriptionList>
          </Drawer>
          <Content className="page-content" key="main">
            <MagicCard bodyStyle={{ padding: 0 }}>
              <Tabs defaultActiveKey="comparison">
                <TabPane tab="对比视图" key="comparison">
                  <ComaprisonPane scrollOffset={this.state.scrollOffset} />
                </TabPane>
                <TabPane tab={<Badge count={task.diff_count}>差异视图</Badge>} key="discrepancy">
                  <DiscrepancyPane scrollOffset={this.state.scrollOffset} />
                </TabPane>
                <TabPane tab="海关库存数据" key="ftz">
                  <FTZStockPane
                    taskId={this.props.params.taskId}
                    scrollOffset={this.state.scrollOffset}
                  />
                </TabPane>
              </Tabs>
            </MagicCard>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
