import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Input, message } from 'antd';
import Table from 'client/components/remoteAntTable';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

import { loadCategoryHsCode, removeCategoryHsCode, addCategoryHsCode } from 'common/reducers/cmsHsCode';
import { hscodeColumns } from './hscodeColumns';

const formatMsg = format(messages);
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    categoryHscodes: state.cmsHsCode.categoryHscodes,
  }),
  { loadCategoryHsCode, removeCategoryHsCode, addCategoryHsCode }
)

export default class CategoryHscodeList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    categoryHscodes: PropTypes.object.isRequired,
    hscodeCategory: PropTypes.object.isRequired,
    loadCategoryHsCode: PropTypes.func.isRequired,
    removeCategoryHsCode: PropTypes.func.isRequired,
    addCategoryHsCode: PropTypes.func.isRequired,
  }
  state = {
    addIndex: 0,
    newHscode: { hscode: '' },
  }
  componentDidMount() {
    this.handleTableLoad();
  }
  componentWillReceiveProps(nextProps) {
    this.setState({ addIndex: nextProps.categoryHscodes.data.length });
    if (this.props.hscodeCategory.id !== nextProps.hscodeCategory.id) {
      this.handleTableLoad(nextProps);
    }
  }
  msg = key => formatMsg(this.props.intl, key)
  handleHscodeChange = (e) => {
    this.setState({ newHscode: { ...this.state.newHscode, hscode: e.target.value } });
  }
  handleAdd = () => {
    const { newHscode } = this.state;
    const { hscodeCategory, tenantId } = this.props;
    if (hscodeCategory.id) {
      this.props.addCategoryHsCode(hscodeCategory.id, tenantId, newHscode.hscode).then((result) => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          this.setState({ newHscode: { ...this.state.newHscode, hscode: '' } });
          this.handleTableLoad();
        }
      });
    } else {
      message.error('未选中分类');
    }
  }
  handleTableLoad = (props) => {
    const { hscodeCategory, categoryHscodes } = props || this.props;
    const params = {
      categoryId: hscodeCategory.id || -1,
      pageSize: categoryHscodes.pageSize,
      current: categoryHscodes.current,
      searchText: categoryHscodes.searchText,
    };
    this.props.loadCategoryHsCode(params);
  }
  handleRemove = (id) => {
    this.props.removeCategoryHsCode(id).then(() => {
      this.handleTableLoad();
    });
  }
  render() {
    const { addIndex, newHscode } = this.state;
    const { hscodeCategory } = this.props;
    const categoryHscodesDataSource = new Table.DataSource({
      fetcher: params => this.props.loadCategoryHsCode(params),
      resolve: result => result.data.concat([newHscode]),
      getPagination: (result, resolve) => ({
        total: result.totalCount,
        current: resolve(result.totalCount, result.current, result.pageSize),
        showSizeChanger: true,
        showQuickJumper: false,
        pageSize: result.pageSize,
      }),
      getParams: (pagination) => {
        const params = {
          categoryId: hscodeCategory.id,
          pageSize: pagination.pageSize,
          current: pagination.current,
          searchText: this.props.categoryHscodes.searchText,
        };
        return params;
      },
      remotes: this.props.categoryHscodes,
    });
    const columns = hscodeColumns().concat([{
      dataIndex: 'option',
      key: 'option',
      title: '操作',
      fixed: 'right',
      width: 80,
      render: (col, row, index) => {
        if (index === addIndex) {
          return (<a onClick={() => this.handleAdd()}>保存</a>);
        }
        return (<a onClick={() => this.handleRemove(row.id)}>删除</a>);
      },
    }]);
    columns[0].width = 150;
    columns[0].render = (col, row, index) => {
      if (index === addIndex) {
        return <Input value={col} onChange={this.handleHscodeChange} style={{ width: '90%' }} />;
      }
      return col;
    };
    return (
      <Table size="middle" dataSource={categoryHscodesDataSource} columns={columns} scroll={{ x: 2200 }} rowKey="id" />
    );
  }
}
