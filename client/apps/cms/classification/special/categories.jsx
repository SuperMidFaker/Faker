import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Table, Layout, Icon, Input, message, Popconfirm, Tabs, Popover } from 'antd';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { loadHsCodeCategories, addHsCodeCategory, removeHsCodeCategory, updateHsCodeCategory,
loadCategoryHsCode, addCategoryHsCode, removeCategoryHsCode } from 'common/reducers/cmsHsCode';
import CategoryHscodeList from './categoryHscodeList';
import SearchBar from 'client/components/SearchBar';
import ExcelUploader from 'client/components/ExcelUploader';
import '../index.less';

const formatMsg = format(messages);
const { Header, Content, Sider } = Layout;
const TabPane = Tabs.TabPane;

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
  { loadHsCodeCategories,
    addHsCodeCategory,
    removeHsCodeCategory,
    updateHsCodeCategory,
    loadCategoryHsCode,
    addCategoryHsCode,
    removeCategoryHsCode }
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
    type: 'split',
    currentPage: 1,
  }
  componentWillReceiveProps(nextProps) {
    const hscodeCategories = nextProps.hscodeCategories.filter(ct => ct.type === this.state.type);
    if (this.state.hscodeCategory.id === undefined) {
      this.setState({ hscodeCategory: hscodeCategories[0] || {} });
    }
    this.setState({ hscodeCategories });
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
      this.setState({ hscodeCategory: this.state.hscodeCategories[0] || {} });
    });
  }
  handleShowAddCategory = () => {
    const hscodeCategories = this.state.hscodeCategories.concat([{ id: -1, name: '' }]);
    this.setState({ hscodeCategories, editIndex: hscodeCategories.length - 1 });
  }
  handleAddCategory = () => {
    const { editIndex, hscodeCategories } = this.state;
    if (hscodeCategories[editIndex].name) {
      this.props.addHsCodeCategory(this.props.tenantId, hscodeCategories[editIndex].name, this.state.type).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          this.setState({ editIndex: -1, hscodeCategory: result.data });
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
  handleRadioChange = (ev) => {
    if (ev.target.value === this.state.type) {
      return;
    }
    const type = ev.target.value;
    const hscodeCategories = this.props.hscodeCategories.filter(ct => ct.type === type);
    this.setState({ type, hscodeCategories, hscodeCategory: hscodeCategories[0] || {} });
  }
  handleTabChange = (type) => {
    const hscodeCategories = this.props.hscodeCategories.filter(ct => ct.type === type);
    this.setState({ type, hscodeCategories, hscodeCategory: hscodeCategories[0] || {} });
  }
  handleSearch = (value) => {
    const { categoryHscodes: { categoryId, current, pageSize } } = this.props;
    this.props.loadCategoryHsCode({ categoryId, current, pageSize, searchText: value });
  }
  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  }
  handleNameSearch = (value) => {
    let hscodeCategories = this.props.hscodeCategories.filter(ct => ct.type === this.state.type);
    if (value) {
      hscodeCategories = hscodeCategories.filter((item) => {
        const reg = new RegExp(value);
        return reg.test(item.name);
      });
    }
    this.setState({ hscodeCategories, currentPage: 1 });
  }
  handleUploaded = () => {
    const { categoryHscodes: { categoryId, current, pageSize } } = this.props;
    this.props.loadCategoryHsCode({ categoryId, current, pageSize });
  }
  render() {
    const { hscodeCategory } = this.state;
    const columns = [{
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
                <a role="presentation"><Icon type="delete" /></a>
              </Popconfirm>
            </span>
          );
        }
      },
    }];
    const tabTable = (
      <Table size="middle" dataSource={this.state.hscodeCategories} columns={columns} onRowClick={this.handleRowClick}
        pagination={{ current: this.state.currentPage, defaultPageSize: 15, onChange: this.handlePageChange }}
        rowKey="id" rowClassName={record => record.name === hscodeCategory.name ? 'table-row-selected' : ''}
        footer={() => <Button type="dashed" icon="plus" onClick={() => this.handleShowAddCategory()} style={{ width: '100%' }}>添加分类</Button>}
      />
    );
    const content = (
      <Table size="small" pagination={false} columns={[{ title: '商品编码', dataIndex: 'hscode' }]} dataSource={[{ hscode: '7318151001' }, { hscode: '7318159090' }, { hscode: '……' }]} />
    );
    return (
      <Layout className="ant-layout-wrapper">
        <Sider width={280} className="menu-sider" key="sider" trigger={null}
          collapsible
          collapsed={this.state.collapsed}
          collapsedWidth={0}
        >
          <div className="page-header">
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('classification')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
              特殊商品编码分类
            </Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div className="left-sider-panel" >
            <Tabs onChange={this.handleTabChange} type="card">
              <TabPane tab={this.msg('specialSplit')} key="split">
                {tabTable}
              </TabPane>
              <TabPane tab={this.msg('specialMerge')} key="merge">
                {tabTable}
              </TabPane>
            </Tabs>
          </div>
        </Sider>
        <Layout>
          <Header className="page-header">
            <Breadcrumb>
              <Breadcrumb.Item>
                {hscodeCategory.name}
              </Breadcrumb.Item>
            </Breadcrumb>
            <div className="page-header-tools">
              <Popover title="导入数据表格式如下" content={content}>
                <Button type="primary" size="large" ghost>
                  <ExcelUploader endpoint={`${API_ROOTS.default}v1/cms/cmsTradeitem/hscode/category/import`}
                    formData={{
                      data: JSON.stringify({
                        categoryId: hscodeCategory.id,
                        tenantId: this.props.tenantId,
                      }),
                    }} onUploaded={this.handleUploaded}
                  >
                    <Icon type="upload" /> 导入
                  </ExcelUploader>
                </Button>
              </Popover>
            </div>
          </Header>
          <Content className="main-content" key="main">
            <div className="page-body">
              <div className="toolbar">
                <SearchBar placeholder="编码/名称/描述/申报要素" onInputSearch={this.handleSearch}
                  value={this.props.categoryHscodes.searchText} size="large"
                />
                <span />
              </div>
              <div className="panel-body table-panel table-fixed-layout">
                <CategoryHscodeList hscodeCategory={hscodeCategory} />
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
