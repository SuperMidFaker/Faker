import React from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { format } from 'client/common/i18n/helpers';
import { Card } from 'antd';
import QueueAnim from 'rc-queue-anim';
import messages from '../message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
  }))
@connectNav({
  depth: 2,
  moduleName: 'corp',
})
@withPrivilege({ module: 'corp', feature: 'overview' })
export default class Overview extends React.Component {

  msg = descriptor => formatMsg(this.props.intl, descriptor)

  render() {
    return (
      <QueueAnim type={['bottom', 'up']}>
        <header className="top-bar" key="header">
          <span>{this.msg('corpOverview')}</span>
        </header>
        <div className="main-content" key="main">
          <div className="page-body" style={{ padding: 16 }} delay={500}>
            <Card></Card>
          </div>
        </div>
      </QueueAnim>
    );
  }
}
