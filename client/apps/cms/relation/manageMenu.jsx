import React, { Component, PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { Menu } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);

const MenuItem = Menu.Item;
@injectIntl
export default class ManageMenu extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    type: PropTypes.oneOf(['import', 'export']),
    location: PropTypes.object.isRequired,
    children: PropTypes.object.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    currentKey: ['compRelation'],
  }
  componentWillMount() {
    if (this.props.location && this.props.location.pathname) {
      const paths = this.props.location.pathname.split('/');
      this.setState({ currentKey: [paths[3]] });
    }
  }
  handleMenuChange = (ev) => {
    const key = ev.key;
    if (key === 'compRelation') {
      this.context.router.push(`/${this.props.type}/manage/compRelation`);
    }
    this.setState({ currentKey: [key] });
  }
  render() {
    return (
      <div>
        <Menu mode="horizontal" selectedKeys={this.state.currentKey}
          onClick={this.handleMenuChange}
        >
          <MenuItem key="compRelation">{formatMsg(this.props.intl, 'relation')}</MenuItem>
        </Menu>
        {this.props.children}
      </div>
    );
  }
}
