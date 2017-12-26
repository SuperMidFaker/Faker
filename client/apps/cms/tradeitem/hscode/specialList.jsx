import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Input, message } from 'antd';
import DataTable from 'client/components/DataTable';
import SearchBar from 'client/components/SearchBar';
import RowAction from 'client/components/RowAction';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
import { loadCategoryHsCode, removeCategoryHsCode, addCategoryHsCode } from 'common/reducers/cmsHsCode';
import { hscodeColumns } from './hscodeColumns';

const formatMsg = format(messages);
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    categoryHscodes: state.cmsHsCode.categoryHscodes,
    loading: state.cmsHsCode.categoryHscodesLoading,
  }),
  { loadCategoryHsCode, removeCategoryHsCode, addCategoryHsCode }
)

export default class HSCodeSpecialList extends React.Component {
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
    hscode: '',
  }
  componentDidMount() {
    this.handleTableLoad();
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.hscodeCategory.id !== nextProps.hscodeCategory.id) {
      this.handleTableLoad(nextProps);
    }
  }
  msg = key => formatMsg(this.props.intl, key)
  handleHscodeChange = (e) => {
    this.setState({ hscode: e.target.value });
  }
  handleAdd = () => {
    const { hscode } = this.state;
    const { hscodeCategory, tenantId } = this.props;
    if (hscodeCategory.id) {
      this.props.addCategoryHsCode(hscodeCategory.id, tenantId, hscode).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          this.setState({ hscode: '' });
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
  handleRemove = (row) => {
    this.props.removeCategoryHsCode(row.id).then(() => {
      this.handleTableLoad();
    });
  }
  handleSearch = (value) => {
    const { categoryHscodes: { categoryId, current, pageSize } } = this.props;
    this.props.loadCategoryHsCode({
      categoryId, current, pageSize, searchText: value,
    });
  }
  render() {
    const { hscode } = this.state;
    const { hscodeCategory, loading } = this.props;
    const categoryHscodesDataSource = new DataTable.DataSource({
      fetcher: params => this.props.loadCategoryHsCode(params),
      resolve: (result) => {
        if (result.data.length === result.pageSize) return result.data;
        return result.data.concat([{ id: -1 }]);
      },
      getPagination: (result, resolve) => ({
        total: result.totalCount + 1,
        current: resolve(result.totalCount + 1, result.current, result.pageSize),
        showSizeChanger: true,
        showQuickJumper: false,
        pageSize: result.pageSize,
        showTotal: total => `共 ${total} 条`,
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
      width: 60,
      render: (col, row) => {
        if (row.id === -1) {
          return (<RowAction onClick={this.handleAdd} icon="save" />);
        }
        return (<RowAction confirm="确认删除?" onConfirm={this.handleRemove} icon="delete" row={row} />);
      },
    }]);
    columns[0].width = 150;
    columns[0].render = (col, row) => {
      if (row.id === -1) {
        return <Input value={hscode} onChange={this.handleHscodeChange} style={{ width: '90%' }} />;
      }
      return col;
    };
    const toolbarActions = (<SearchBar
      placeholder="编码/名称/描述/申报要素"
      onInputSearch={this.handleSearch}
      value={this.props.categoryHscodes.searchText}
    />);
    return (
      <DataTable toolbarActions={toolbarActions} dataSource={categoryHscodesDataSource} columns={columns} rowKey="id" bordered loading={loading} />
    );
  }
}
