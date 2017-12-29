import React from 'react';
import PropTypes from 'prop-types';
import { Button, Tooltip } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import DockPanel from 'client/components/DockPanel';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);

@injectIntl
export default class PageHint extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    children: PropTypes.node,
  }
  state = {
    visible: false,
  }

  msg = descriptor => formatMsg(this.props.intl, descriptor)
  render() {
    return (
      <span>
        <Tooltip title="操作指引" placement="bottom" mouseEnterDelay={1} mouseLeaveDelay={0}>
          <Button icon="bulb" onClick={() => this.setState({ visible: true })} />
        </Tooltip>
        <DockPanel title="操作指引" size="small" visible={this.state.visible} onClose={() => this.setState({ visible: false })}>
          {this.props.children}
        </DockPanel>
      </span>
    );
  }
}
