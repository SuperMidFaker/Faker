import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Tabs } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { setPaneTabkey } from 'common/reducers/cmsManifest';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import CertMarkPane from '../tabpanes/certMarkPane';
import DocuMarkPane from '../tabpanes/docuMarkPane';
import ContainersPane from '../tabpanes/containersPane';

const formatMsg = format(messages);
const TabPane = Tabs.TabPane;

@injectIntl
@connect(
  state => ({
    formRequire: state.cmsManifest.params,
    tabKey: state.cmsManifest.tabKey,
  }),
  { setPaneTabkey }
)
export default class SheetExtraPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ietype: PropTypes.string,
    tabKey: PropTypes.string,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  handleTabChange = (tabKey) => {
    this.props.setPaneTabkey(tabKey);
  }
  render() {
    const path = this.context.router.location.pathname.indexOf('/clearance/import/customs');
    return (
      <Tabs tabPosition="left" activeKey={this.props.tabKey} onChange={this.handleTabChange} >
        <TabPane tab="集装箱" key="container">
          <ContainersPane />
        </TabPane>
        { (path !== -1) &&
          <TabPane tab="随附单据" key="document" >
            <DocuMarkPane />
          </TabPane>}
        { (path !== -1) &&
          <TabPane tab="随附单证" key="certificate">
            <CertMarkPane />
          </TabPane>}
        { (path !== -1) &&
          <TabPane tab="关联信息" key="related" />
        }
      </Tabs>
    );
  }
}
