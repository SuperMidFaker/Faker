import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import uid from 'uid';
import { Button, Icon, Menu } from 'antd';
import DockPanel from 'client/components/DockPanel';

export default class NestedNavPanel extends PureComponent {
  static propTypes = {
    visible: PropTypes.bool,
    onClose: PropTypes.func,
    onMenuClick: PropTypes.func,
    stack: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.shape({
      key: PropTypes.string, title: PropTypes.node, icon: PropTypes.string,
    }))),
  }

  state = {
    stack: [[]],
  }
  componentWillReceiveProps(nextProps) {
    const traversalDirection = (() => {
      if (nextProps.stack.length !== this.props.stack.length) {
        return nextProps.stack.length < this.props.stack.length ? 'up' : 'down';
      }
      return this.state.traversalDirection;
    })();
    this.setState({ traversalDirection }, () => {
      this.setState({ stack: nextProps.stack });
    });
  }
  stackPush = (item) => {
    const stack = [...this.state.stack, item];
    this.setState({ stack });
  };

  stackPop = () => {
    if (this.state.stack.length > 1) {
      const stack = this.state.stack.slice(0, this.state.stack.length - 1);
      this.setState({ stack });
    }
  };
  renderBackButton() {
    return <Button key={uid} icon="arrow-left" shape="circle" onClick={this.stackPop} />;
  }

  renderHeader = () => {
    const items = [];
    if (this.state.stack.length > 1) {
      items.push(this.renderBackButton());
    } else {
      items.push(this.props.title);
    }
    return items;
  };

  renderItem = (item) => {
    const onClick = item.children && (() => this.stackPush(item.children));
    const currentStack = this.state.stack[this.state.stack.length - 1];
    const visibleNode = currentStack.find(fl => fl.key === item.key);
    return visibleNode ?
      (<Menu.Item key={item.key}>
        <a onClick={onClick}><Icon type={item.icon} /> {item.title}</a>
      </Menu.Item>) : null;
  };

  renderStack = () =>
    this.state.stack.map(page => page.map(item => this.renderItem(item)));

  render() {
    return (
      <DockPanel
        title={this.renderHeader()}
        mode="inner"
        size="small"
        visible={this.props.visible}
        onClose={this.props.onClose}
      >
        <Menu selectable={false} onClick={this.props.onMenuClick}>
          {this.renderStack()}
        </Menu>
        {this.props.children}
      </DockPanel>
    );
  }
}
