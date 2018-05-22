import React from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Layout } from 'antd';
import QueueAnim from 'rc-queue-anim';
import PageHeader from 'client/components/PageHeader';
import connectNav from 'client/common/decorators/connect-nav';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import { formatMsg, formatGlobalMsg } from './message.i18n';

const { Content } = Layout;

@injectIntl
@connect(
  state => ({
    whses: state.cwmContext.whses,
    defaultWhse: state.cwmContext.defaultWhse,
  }),
  { switchDefaultWhse }
)
@connectNav({
  depth: 2,
  moduleName: 'bss',
})
export default class BSSDashboard extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  render() {
    return (
      <QueueAnim type={['bottom', 'up']}>
        <PageHeader title={this.msg('dashboard')} />
        <Content className="page-content" key="main" />
      </QueueAnim>
    );
  }
}
