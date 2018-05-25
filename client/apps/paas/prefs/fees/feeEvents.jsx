import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { List, Icon } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { CMS_EVENTS } from 'common/constants';
import connectNav from 'client/common/decorators/connect-nav';
import { toggleEventsModal } from 'common/reducers/cmsPrefEvents';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { formatMsg } from '../message.i18n';


@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
  }),
  { toggleEventsModal }
)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
@withPrivilege({ module: 'clearance', feature: 'setting', action: 'edit' })
export default class Events extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  componentWillMount() {
  }
  handleClick = (key) => {
    this.props.toggleEventsModal(true, key);
  }
  msg = formatMsg(this.props.intl)
  render() {
    return (
      <List
        dataSource={CMS_EVENTS}
        renderItem={event => (
          <List.Item
            key={event.key}
            actions={[<Icon onClick={() => this.handleClick(event.key)} type="pay-circle-o" />]}
          >
            <List.Item.Meta
              title={event.text}
              description={event.desc}
            />
          </List.Item>
                  )}
      />
    );
  }
}
