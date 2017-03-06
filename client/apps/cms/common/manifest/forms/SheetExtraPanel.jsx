import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Collapse } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { setPaneTabkey } from 'common/reducers/cmsManifest';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import CertMarkPane from '../tabpanes/certMarkPane';
import DocuMarkPane from '../tabpanes/docuMarkPane';
import ContainersPane from '../tabpanes/containersPane';

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
export default class SheetExtraPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ietype: PropTypes.string,
    tabKey: PropTypes.string,
    type: PropTypes.oneOf(['bill', 'entry']),
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  handleTabChange = (tabKey) => {
    this.props.setPaneTabkey(tabKey);
  }
  render() {
    const { type } = this.props;
    return (
      <Collapse accordion defaultActiveKey="container">
        <Panel header={'集装箱'} key="container">
          <ContainersPane />
        </Panel>

        {(type === 'entry') && <Panel header={'随附单据'} key="document">
          <DocuMarkPane />
        </Panel>}
        {(type === 'entry') &&
        <Panel header={'随附单证'} key="certificate">
          <CertMarkPane />
        </Panel>}
        {(type === 'entry') &&
        <Panel header={'关联信息'} key="related" />}
      </Collapse>

    );
  }
}
