import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Card, Layout } from 'antd';
import QueueAnim from 'rc-queue-anim';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);
const { Header, Content } = Layout;

@injectIntl
@connect(state => ({
  tenantId: state.account.tenantId,
}), )
@connectNav({
  depth: 2,
  moduleName: 'scof',
})
export default class SCOFDashboard extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);

  handleRadioChange = (ev) => {
    if (ev.target.value === this.props.listFilter.status) {

    }
  }
  render() {
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="page-header">
          <div className="toolbar-right" />
          <span>{this.msg('dashboardTitle')}</span>
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body card-wrapper">
            <Card>
              hello
            </Card>
          </div>
        </Content>
      </QueueAnim>
    );
  }
}
