import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Table, Layout, Icon, Input, message, Popconfirm, Tabs, Popover } from 'antd';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';

import PageHeader from 'client/components/PageHeader';
import NavLink from 'client/components/NavLink';
import ExcelUploader from 'client/components/ExcelUploader';
import { createFilename } from 'client/util/dataTransform';
import { loadHsCodeCategories, addHsCodeCategory, removeHsCodeCategory, updateHsCodeCategory,
  loadCategoryHsCode, addCategoryHsCode, removeCategoryHsCode } from 'common/reducers/cmsHsCode';
import HSCodeSpecialList from './specialList';

import { formatMsg } from '../message.i18n';


const { Content, Sider } = Layout;
const { TabPane } = Tabs;

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
  {
    loadHsCodeCategories,
    addHsCodeCategory,
    removeHsCodeCategory,
    updateHsCodeCategory,
    loadCategoryHsCode,
    addCategoryHsCode,
    removeCategoryHsCode,
  }
)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
export default class HSCodeSpecial extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    hscodeCategories: PropTypes.array.isRequired, // eslint-disable-line
    categoryHscodes: PropTypes.object.isRequired, // eslint-disable-line
    addHsCodeCategory: PropTypes.func.isRequired,
    removeHsCodeCategory: PropTypes.func.isRequired,
    updateHsCodeCategory: PropTypes.func.isRequired,
    loadCategoryHsCode: PropTypes.func.isRequired,
  }
  state = {
    collapsed: false,
    hscodeCategory: {},
    hscodeCategories: [],
    editIndex: -1,
    type: 'split',
    currentPage: 1,
    disabled: false,
  }
  componentWillReceiveProps(nextProps) {
    const hscodeCategories = nextProps.hscodeCategories.filter(ct => ct.type === this.state.type);
    if (this.state.hscodeCategory.id === undefined) {
      this.setState({ hscodeCategory: hscodeCategories[0] || {} });
    }
    this.setState({ hscodeCategories });
  }
  msg = formatMsg(this.props.intl)
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
    this.setState({ hscodeCategories, editIndex: hscodeCategories.length - 1, disabled: true });
  }
  handleAddCategory = () => {
    const { editIndex, hscodeCategories } = this.state;
    if (hscodeCategories[editIndex].name) {
      this.props.addHsCodeCategory(
        this.props.tenantId,
        hscodeCategories[editIndex].name,
        this.state.type
      ).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          this.setState({ editIndex: -1, hscodeCategory: result.data, disabled: false });
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
  handleCancel = (row, index) => {
    const categories = [...this.state.hscodeCategories];
    categories.splice(index, 1);
    this.setState({
      hscodeCategories: categories,
      disabled: false,
    });
  }
  handleExportExcel = () => {
    const { categoryHscodes: { categoryId } } = this.props;
    window.open(`${API_ROOTS.default}v1/cmsTradeitem/category/${createFilename('hscode')}.xlsx?categoryId=${categoryId}`);
  }
  render() {
    const { hscodeCategory } = this.state;
    const columns = [{
      dataIndex: 'name',
      key: 'name',
      title: '分类名称',
      render: (col, row, index) => {
        if (this.state.editIndex === index) {
          return (<Input
            value={col}
            onChange={(e) => {
            const { hscodeCategories } = this.state;
            hscodeCategories[index].name = e.target.value;
            this.setState({ hscodeCategories });
          }}
          />);
        }
        return col;
      },
    }, {
      dataIndex: 'option',
      key: 'option',
      width: 80,
      render: (col, row, index) => {
        if (this.state.editIndex === index) {
          if (row.id === -1) {
            return (<span>
              <a onClick={this.handleAddCategory}><Icon type="save" /></a>
              <span className="ant-divider" />
              <a onClick={() => this.handleCancel(row, index)}><Icon type="close" /></a>
            </span>);
          }
          return (<a onClick={() => this.handleEditCategory(row.id)}><Icon type="save" /></a>);
        }
        return (
          <span>
            <a onClick={() => {
                this.setState({ editIndex: index });
              }}
            ><Icon type="edit" />
            </a>
            <span className="ant-divider" />
            <Popconfirm title="确认删除该分类?" onConfirm={() => this.handleRemove(row.id)}>
              <a role="presentation"><Icon type="delete" /></a>
            </Popconfirm>
          </span>
        );
      },
    }];
    const tabTable = (
      <Table
        size="middle"
        dataSource={this.state.hscodeCategories}
        columns={columns}
        pagination={{
          current: this.state.currentPage,
          defaultPageSize: 15,
          onChange: this.handlePageChange,
        }}
        rowKey="id"
        rowClassName={record => (record.name === hscodeCategory.name ? 'table-row-selected' : '')}
        onRow={(record, index) => ({
                onClick: () => { this.handleRowClick(record, index); },
              })}
        footer={() => <Button type="dashed" icon="plus" onClick={() => this.handleShowAddCategory()} disabled={this.state.disabled} style={{ width: '100%' }}>添加分类</Button>}
      />
    );
    const content = (
      <Table size="small" pagination={false} columns={[{ title: '商品编码', dataIndex: 'hscode' }]} dataSource={[{ hscode: '7318151001' }, { hscode: '7318159090' }, { hscode: '……' }]} />
    );
    return (
      <Layout className="ant-layout-wrapper">
        <Sider
          width={200}
          className="menu-sider"
          key="sider"
          trigger={null}
          collapsible
          collapsed={this.state.collapsed}
          collapsedWidth={0}
        >
          <div className="page-header">
            <Breadcrumb>
              <Breadcrumb.Item>
                <NavLink to="/clearance/tradeitem">
                  <Icon type="left-circle-o" />
                </NavLink>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.msg('hscodeSpecial')}
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
          <PageHeader title={hscodeCategory.name}>
            <PageHeader.Actions>
              <Button icon="file-excel" onClick={this.handleExportExcel}>
                {this.msg('导出')}
              </Button>
              <Popover title="导入数据表格式如下" content={content}>
                <ExcelUploader
                  endpoint={`${API_ROOTS.default}v1/cms/cmsTradeitem/hscode/category/import`}
                  formData={{
                    data: JSON.stringify({
                      categoryId: hscodeCategory.id,
                      tenantId: this.props.tenantId,
                    }),
                  }}
                  onUploaded={this.handleUploaded}
                >
                  <Button type="primary" ghost><Icon type="upload" /> 导入</Button>
                </ExcelUploader>
              </Popover>
            </PageHeader.Actions>
          </PageHeader>
          <Content className="page-content" key="main">
            <HSCodeSpecialList hscodeCategory={hscodeCategory} />
          </Content>
        </Layout>
      </Layout>
    );
  }
}
