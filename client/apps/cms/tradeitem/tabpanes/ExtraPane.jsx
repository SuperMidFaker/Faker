import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Tabs } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { setPaneTabkey } from 'common/reducers/cmsTradeitem';
import CopCodesPane from './copCodesPane';

const TabPane = Tabs.TabPane;

@injectIntl
@connect(
  state => ({
    tabKey: state.cmsTradeitem.tabKey,
  }),
  { setPaneTabkey }
)
export default class ExtraPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ietype: PropTypes.string.isRequired,
    tabKey: PropTypes.string,
  }
  handleTabChange = (tabKey) => {
    this.props.setPaneTabkey(tabKey);
  }
  render() {
    return (
      <Tabs activeKey={this.props.tabKey} onChange={this.handleTabChange} >
        <TabPane tab="共享企业代码管理" key="copCodes">
          <CopCodesPane />
        </TabPane>
        <TabPane tab="客户权限设置" key="authUser" />
      </Tabs>
    );
  }
}
