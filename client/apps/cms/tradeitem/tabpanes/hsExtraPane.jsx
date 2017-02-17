import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Tabs } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { setPaneTabkey } from 'common/reducers/cmsTradeitem';
import DeclUnitPane from './declUnitPane';

const TabPane = Tabs.TabPane;

@injectIntl
@connect(
  state => ({
    tabKey: state.cmsTradeitem.hstabKey,
  }),
  { setPaneTabkey }
)
export default class HsExtraPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tabKey: PropTypes.string,
  }
  handleTabChange = (tabKey) => {
    this.props.setPaneTabkey(tabKey);
  }
  render() {
    return (
      <Tabs activeKey={this.props.tabKey} onChange={this.handleTabChange} >
        <TabPane tab="申报单位管理" key="declunit" >
          <DeclUnitPane />
        </TabPane>
      </Tabs>
    );
  }
}