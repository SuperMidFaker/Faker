import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Collapse } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { setPaneTabkey } from 'common/reducers/cmsManifest';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import ContainersPane from './pane/containersPane';

const formatMsg = format(messages);
const Panel = Collapse.Panel;

@injectIntl
@connect(
  state => ({
    formRequire: state.cmsManifest.params,
    tabKey: state.cmsManifest.tabKey,
  }),
  { setPaneTabkey }
)
export default class ManifestExtraPanel extends React.Component {
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
    return (
      <Collapse accordion defaultActiveKey="container">
        <Panel header={'集装箱'} key="container">
          <ContainersPane />
        </Panel>
      </Collapse>

    );
  }
}
