import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Tabs } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { loadSearchedParam, saveBillHead } from 'common/reducers/cmsManifest';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);
const TabPane = Tabs.TabPane;

@injectIntl
@connect(
  state => ({
    formRequire: state.cmsManifest.params,
  }),
  { loadSearchedParam, saveBillHead }
)
export default class SheetExtraPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ietype: PropTypes.string.isRequired,
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  render() {
    return (
      <Tabs defaultActiveKey="container">
        <TabPane tab="集装箱" key="container" />
        <TabPane tab="随附单证" key="document" />
      </Tabs>
    );
  }
}
