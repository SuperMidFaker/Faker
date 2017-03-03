import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Card, Table, Layout, Input, Row, Col, message, Popconfirm } from 'antd';
import connectFetch from 'client/common/decorators/connect-fetch';
import QueueAnim from 'rc-queue-anim';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import { loadHsCodeCategories, addHsCodeCategory, removeHsCodeCategory, updateHsCodeCategory,
loadCategoryHsCode, addCategoryHsCode, removeCategoryHsCode } from 'common/reducers/cmsHsCode';
import CategoryHscodeList from './categoryHscodeList';
import SearchBar from 'client/components/search-bar';
import './index.less';

const formatMsg = format(messages);
const { Header, Content } = Layout;

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
export default class HscodeCategory extends React.Component {
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
      width: 80,
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
              <Popconfirm title="确认删除该分类?" onConfirm={() => this.handleRemove(row.id)}>
                <a role="button">删除</a>
              </Popconfirm>
              <span className="ant-divider" />
              <a onClick={() => {
                this.setState({ editIndex: index });
              }}
              >修改</a>
            </span>
          );
        }
      },
    }];
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              商品归类
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              特殊商品编码分类
            </Breadcrumb.Item>
          </Breadcrumb>
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body" style={{ paddingLeft: 5, paddingRight: 5 }}>
            <Row>
              <Col span={4}>
                <div className="tool" style={{ padding: 8 }}>
                  <Button size="large" icon="plus-circle-o" onClick={() => this.handleShowAddCategory()}>
                    添加
                  </Button>
                </div>
              </Col>
              <Col span={20}>
                <div className="toolbar-right" style={{ padding: 8 }}>
                  <SearchBar placeholder="编码/名称/描述/申报要素" onInputSearch={this.handleSearch}
                    value={this.props.categoryHscodes.searchText} size="large"
                  />
                </div>
              </Col>
            </Row>
            <Row>
              <Col span={4} style={{ paddingLeft: 8, paddingRight: 8 }}>
                <Card bodyStyle={{ padding: 0 }}>
                  <Table size="middle" dataSource={this.state.hscodeCategories} columns={columns} onRowClick={this.handleRowClick}
                    pagination={false} rowKey="id" rowClassName={record => record.name === hscodeCategory.name ? 'table-row-selected' : ''}
                  />
                </Card>
              </Col>
              <Col span={20} style={{ paddingLeft: 8, paddingRight: 8 }}>
                <Card bodyStyle={{ padding: 0 }}>
                  <CategoryHscodeList hscodeCategory={hscodeCategory} />
                </Card>
              </Col>
            </Row>
          </div>
        </Content>
      </QueueAnim>
    );
  }
}
