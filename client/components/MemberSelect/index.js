import React from 'react';
import PropTypes from 'prop-types';
import { Popover, Input, Tabs, Menu, Avatar, Tree } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import InfoItem from 'client/components/InfoItem';
import { loadTeamUserIds } from 'common/reducers/sofCustomers';
import { loadDepartments, loadDepartmentMembers } from 'common/reducers/personnel';

const TabPane = Tabs.TabPane;
const Search = Input.Search;
const TreeNode = Tree.TreeNode;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    userMembers: state.account.userMembers,
  }),
  { loadDepartments, loadTeamUserIds, loadDepartmentMembers }
)
export default class MemberSelect extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    preparerName: PropTypes.string,
    editable: PropTypes.bool.isRequired,
    partnerId: PropTypes.number.isRequired,
    onSelect: PropTypes.func.isRequired,
  }
  state = {
    visible: false,
    searchText: '',
    teamUserIds: [],
    departments: [],
    allUsers: [],
  }
  componentWillMount() {
    this.props.loadTeamUserIds(this.props.partnerId).then((result) => {
      if (!result.error) {
        this.setState({
          teamUserIds: result.data,
        });
      }
    });
    this.props.loadDepartments(this.props.tenantId).then((result) => {
      if (!result.error) {
        this.setState({
          departments: result.data,
        });
      }
    });
    const userMembers = [...this.props.userMembers];
    this.setState({
      allUsers: userMembers.splice(0, 5),
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.partnerId !== this.props.partnerId) {
      this.props.loadTeamUserIds(nextProps.partnerId).then((result) => {
        if (!result.error) {
          this.setState({
            teamUserIds: result.data,
          });
        }
      });
    }
  }
  onLoadData = (treeNode) => {
    const { userMembers } = this.props;
    const teamId = treeNode.props.dataRef.id;
    this.props.loadDepartmentMembers(teamId).then((result) => {
      if (!result.error) {
        const departmentMember = userMembers.filter(member => result.data.find(data => data.user_id === member.user_id)).map(user => ({
          ...user,
          isLeaf: true,
        }));
        const departments = [...this.state.departments];
        departments.find(de => de.id === teamId).children = departmentMember;
        this.setState({
          departments,
        });
      }
    });
  }
  handleSelect = (data) => {
    const key = Array.isArray(data) ? data[0] : data.key;
    this.props.onSelect(key);
    this.setState({
      visible: false,
    });
  }
  handleVisibleChange = (visible) => {
    this.setState({ visible });
  }
  handleChange = (e) => {
    if (!e.target.value) {
      const userMembers = [...this.props.userMembers];
      this.setState({
        searchText: '',
        allUsers: userMembers.splice(0, 5),
      });
    } else {
      const { userMembers } = this.props;
      const reg = new RegExp(e.target.value);
      const filterUsers = userMembers.filter(item => reg.test(item.name));
      this.setState({
        allUsers: filterUsers,
        searchText: e.target.value,
      });
    }
  }
  renderTreeNodes = data => data.map((item) => {
    if (item.children) {
      return (
        <TreeNode title={item.name} key={item.user_id} dataRef={item}>
          {this.renderTreeNodes(item.children)}
        </TreeNode>
      );
    }
    return <TreeNode title={item.name} key={item.login_id} isLeaf={item.isLeaf} dataRef={item} />;
  })
  render() {
    const { teamUserIds, departments, allUsers } = this.state;
    const { preparerName, editable, userMembers } = this.props;
    const teamMembers = teamUserIds.map(userId => userMembers.find(member => Number(member.user_id) === Number(userId.user_id)));
    const content = (
      <div>
        <Tabs defaultActiveKey="1" >
          <TabPane tab="团队" key="1">
            <Menu
              style={{ width: 252 }}
              mode="vertical"
              onClick={this.handleSelect}
            >
              {teamMembers.map(member =>
                <Menu.Item key={member.login_id} >{member.name}</Menu.Item>)}
            </Menu>
          </TabPane>
          <TabPane tab="部门" key="2">
            <Tree loadData={this.onLoadData} onSelect={this.handleSelect}>
              {this.renderTreeNodes(departments)}
            </Tree>
          </TabPane>
          <TabPane tab="全部" key="3">
            <Search style={{ width: 252 }} value={this.state.searchText} onChange={this.handleChange} />
            <Menu
              style={{ width: 253 }}
              mode="inline"
              onClick={this.handleSelect}
            >
              {allUsers.map(user =>
                <Menu.Item key={user.login_id} >{user.name}</Menu.Item>)}
            </Menu>
          </TabPane>
        </Tabs>
      </div>
    );
    return (
      <Popover content={content} trigger="click" placement="bottom" visible={this.state.visible} onVisibleChange={this.handleVisibleChange} overlayStyle={{ width: 284 }}>
        <div>
          <InfoItem
            type="dropdown"
            label="操作人员"
            addonBefore={<Avatar size="small">{preparerName}</Avatar>}
            field={preparerName}
            placeholder="分配操作人员"
            editable={editable}
            overlay={<span>{preparerName}</span>}
          />
        </div>
      </Popover>
    );
  }
}
