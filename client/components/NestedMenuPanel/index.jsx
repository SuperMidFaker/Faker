import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Button, Icon, Menu, Table } from 'antd';
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
  constructor(props) {
    super(props);
    const { stack } = this.props;
    this.state = {
      stack,
    };
  }
  state = {
    stack: [[]],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.stack && nextProps.stack.length !== this.props.stack.length) {
      this.setState({ stack: nextProps.stack });
    }
  }
  stackPush = (item) => {
    if (item) {
      const stack = [...this.state.stack, item];
      this.setState({ stack });
    }
  };
  stackPop = () => {
    if (this.state.stack.length > 1) {
      const stack = this.state.stack.slice(0, this.state.stack.length - 1);
      this.setState({ stack });
    }
  };
  renderBackButton(key) {
    return <Button key={key} icon="arrow-left" shape="circle" onClick={this.stackPop} />;
  }
  renderTitle = () => {
    const { stack } = this.state;
    const items = [];
    if (stack && stack.length > 1) {
      items.push(this.renderBackButton(String(stack.length)));
    } else {
      items.push(this.props.title);
    }
    return items;
  };
  renderGroupItem = item => (<Menu.Item key={item.key} disabled={item.disabled}>
    <a onClick={() => this.stackPush(item.children)}>
      {item.icon && <Icon type={item.icon} />} {item.title}
    </a>
    {item.extra && <span>{item.extra}</span>}
  </Menu.Item>);

  renderTable = item => (<Table
    size="middle"
    columns={item.columns}
    dataSource={item.dataSource}
    showHeader={false}
    // rowClassName={record => (record.id === owner.id ? 'table-row-selected' : '')}
    pagination={{ hideOnSinglePage: true }}
    rowKey="id"
    onRow={row => ({
      onClick: () => { item.onRowClick(row); },
    })}
  />)

  renderItem = (item) => {
    const { stack } = this.state;
    const currentStack = stack[stack.length - 1];
    const visibleNode = currentStack.find(fl => fl.key === item.key);
    if (visibleNode) {
      if (item.type === 'group') {
        return (<Menu.ItemGroup key={item.key} title={item.title}>
          {item.children.map(groupItem => this.renderGroupItem(groupItem))}
        </Menu.ItemGroup>);
      } else if (item.type === 'table') {
        return this.renderTable(item);
      }
      return (<Menu.Item key={item.key} disabled={item.disabled}>
        <a onClick={() => this.stackPush(item.children)}><Icon type={item.icon} /> {item.title}</a>
        {item.extra && <span>{item.extra}</span>}
      </Menu.Item>);
    }
    return null;
  };
  renderStack = () =>
    this.state.stack.map(page => page.map(item => this.renderItem(item)));

  render() {
    const {
      visible, children, onClose, onMenuClick,
    } = this.props;
    return (
      <DockPanel
        title={this.renderTitle()}
        mode="inner"
        size="small"
        visible={visible}
        onClose={onClose}
      >
        <Menu selectable={false} onClick={onMenuClick}>
          {this.renderStack()}
        </Menu>
        {children}
      </DockPanel>
    );
  }
}
