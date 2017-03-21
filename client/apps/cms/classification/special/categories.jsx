import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Table, Layout, Icon, Input, Tooltip, message, Popconfirm } from 'antd';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { loadHsCodeCategories, addHsCodeCategory, removeHsCodeCategory, updateHsCodeCategory,
loadCategoryHsCode, addCategoryHsCode, removeCategoryHsCode } from 'common/reducers/cmsHsCode';
import CategoryHscodeList from './categoryHscodeList';
import SearchBar from 'client/components/search-bar';
import '../index.less';

const formatMsg = format(messages);
const { Header, Content, Sider } = Layout;

function fetchData({ state, dispatch }) {
  return dispatch(loadHsCodeCategories(state.account.tenantId));
}
@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    hscodeCategories: state.cmsHsCode.hscodeCategories,
    categoryHscodes: state.cmsHsCode.categoryHscodes,
  }),
  { loadHsCodeCategories, addHsCodeCategory, removeHsCodeCategory, updateHsCodeCategory,
    loadCategoryHsCode, addCategoryHsCode, removeCategoryHsCode }
)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
export default class SpecialCategories extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    hscodeCategories: PropTypes.array.isRequired,
    categoryHscodes: PropTypes.object.isRequired,
    loadHsCodeCategories: PropTypes.func.isRequired,
    addHsCodeCategory: PropTypes.func.isRequired,
    removeHsCodeCategory: PropTypes.func.isRequired,
    updateHsCodeCategory: PropTypes.func.isRequired,
    loadCategoryHsCode: PropTypes.func.isRequired,
    addCategoryHsCode: PropTypes.func.isRequired,
    removeCategoryHsCode: PropTypes.func.isRequired,
  }
  state = {
    collapsed: false,
    hscodeCategory: {},
    hscodeCategories: [],
    editIndex: -1,
  }
  componentWillReceiveProps(nextProps) {
    if (this.state.hscodeCategory.id === undefined) {
      this.setState({ hscodeCategory: nextProps.hscodeCategories[0] || {} });
    }
    this.setState({ hscodeCategories: nextProps.hscodeCategories });
  }
  msg = key => formatMsg(this.props.intl, key)
  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }
  handleRowClick = (record, rowIndex) => {
    if (this.state.editIndex !== rowIndex) {
      this.setState({ hscodeCategory: record });
    }
  }
  handleRemove = (id) => {
    this.props.removeHsCodeCategory(id).then(() => {
      this.setState({ hscodeCategory: this.props.hscodeCategories[0] || {} });
    });
  }
  handleShowAddCategory = () => {
    const hscodeCategories = this.state.hscodeCategories.concat([{ id: -1, name: '' }]);
    this.setState({ hscodeCategories, editIndex: hscodeCategories.length - 1 });
  }
  handleAddCategory = () => {
    const { editIndex, hscodeCategories } = this.state;
    if (hscodeCategories[editIndex].name) {
      this.props.addHsCodeCategory(this.props.tenantId, hscodeCategories[editIndex].name).then((result) => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          this.setState({ editIndex: -1 });
        }
      });
    } else {
      message.error('分类名称不能为空');
    }
  }
  handleEditCategory = (id) => {
    const { hscodeCategories } = this.state;
    const category = hscodeCategories.find(item => item.id === id);
    if (category && category.name) {
      this.props.updateHsCodeCategory(id, category.name).then(() => {
        this.setState({ editIndex: -1 });
      });
    } else {
      message.error('分类名称不能为空');
    }
  }

  handleSearch = (value) => {
    const { categoryHscodes: { categoryId, current, pageSize } } = this.props;
    this.props.loadCategoryHsCode({ categoryId, current, pageSize, searchText: value });
  }
  render() {
    const { hscodeCategory } = this.state;
    const columns = [{
      dataIndex: 'index',
      key: 'index',
      title: '序号',
      className: 'hscode-list-left',
      width: 55,
      render: (col, row, index) => index + 1,
    }, {
      dataIndex: 'name',
      key: 'name',
      title: '分类名称',
      render: (col, row, index) => {
        if (this.state.editIndex === index) {
          return (<Input value={col} onChange={(e) => {
            const { hscodeCategories } = this.state;
            hscodeCategories[index].name = e.target.value;
            this.setState({ hscodeCategories });
          }}
          />);
        } else {
          return col;
        }
      },
    }, {
      dataIndex: 'option',
      key: 'option',
      width: 60,
      render: (col, row, index) => {
        if (this.state.editIndex === index) {
          if (row.id === -1) {
            return (<a onClick={this.handleAddCategory}>保存</a>);
          } else {
            return (<a onClick={() => this.handleEditCategory(row.id)}>保存</a>);
          }
        } else {
          return (
            <span>
              <a onClick={() => {
                this.setState({ editIndex: index });
              }}
              ><Icon type="edit" /></a>
              <span className="ant-divider" />
              <Popconfirm title="确认删除该分类?" onConfirm={() => this.handleRemove(row.id)}>
                <a role="button"><Icon type="delete" /></a>
              </Popconfirm>
            </span>
          );
        }
      },
    }];
    return (
      <Layout className="ant-layout-wrapper">
        <Sider width={280} className="menu-sider" key="sider" trigger={null}
          collapsible
          collapsed={this.state.collapsed}
          collapsedWidth={0}
        >
          <div className="top-bar">
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('classification')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                特殊商品编码分类
              </Breadcrumb.Item>
            </Breadcrumb>
            <div className="pull-right">
              <Tooltip placement="bottom" title="添加特殊商品编码分类">
                <Button type="primary" shape="circle" icon="plus" onClick={() => this.handleShowAddCategory()} />
              </Tooltip>
            </div>
          </div>
          <div className="left-sider-panel" >
            <Table size="middle" dataSource={this.state.hscodeCategories} columns={columns} onRowClick={this.handleRowClick}
              pagination={false} rowKey="id" rowClassName={record => record.name === hscodeCategory.name ? 'table-row-selected' : ''}
            />
          </div>
        </Sider>
        <Layout>
          <Header className="top-bar">

            { this.state.collapsed && <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('classification')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                特殊商品编码分类
              </Breadcrumb.Item>
            </Breadcrumb>
            }
            <Button size="large"
              className={this.state.collapsed ? '' : 'btn-toggle-on'}
              icon={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
              onClick={this.toggle}
            />
          </Header>
          <Content className="main-content" key="main">
            <div className="page-body">
              <div className="toolbar">
                <SearchBar placeholder="编码/名称/描述/申报要素" onInputSearch={this.handleSearch}
                  value={this.props.categoryHscodes.searchText} size="large"
                />
                <span />
              </div>
              <div className="panel-body table-panel">
                <CategoryHscodeList hscodeCategory={hscodeCategory} />
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }
}