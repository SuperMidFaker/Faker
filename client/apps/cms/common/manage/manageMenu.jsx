import React, { Component, PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { Menu } from 'ant-ui';

const MenuItem = Menu.Item;
@injectIntl
export default class ManageMenu extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
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
      this.setState({ currentKey: [ paths[3] ] });
    }
  }
  handleMenuChange = (ev) => {
    const key = ev.key;
    if (key === 'compRelation') {
      this.context.router.push('/import/manage/compRelation');
    }
    this.setState({ currentKey: [key] });
  }
  render() {
    return (
        <div>
          <Menu mode="horizontal" selectedKeys={this.state.currentKey}
          onClick={this.handleMenuChange}
          >
            <MenuItem key="compRelation">关联单位</MenuItem>
          </Menu>
          {this.props.children}
        </div>
    );
  }
}
