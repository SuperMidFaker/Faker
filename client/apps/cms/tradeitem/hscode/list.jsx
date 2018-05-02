import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { Breadcrumb, Layout, Button, Menu, Dropdown, Icon } from 'antd';
import { loadHscodes } from 'common/reducers/cmsHsCode';
import ExcelUploader from 'client/components/ExcelUploader';
import PageHeader from 'client/components/PageHeader';
import DataTable from 'client/components/DataTable';
import SearchBox from 'client/components/SearchBox';
import { createFilename } from 'client/util/dataTransform';
import { hscodeColumns } from './hscodeColumns';
import ModuleMenu from '../menu';
import { formatMsg } from '../message.i18n';

const { Sider, Content } = Layout;

function fetchData({ state, dispatch }) {
  const promises = [];
  promises.push(dispatch(loadHscodes({
    tenantId: state.account.tenantId,
    pageSize: state.cmsHsCode.hscodes.pageSize,
    current: state.cmsHsCode.hscodes.current,
    searchText: state.cmsHsCode.hscodes.searchText,
  })));
  return Promise.all(promises);
}
@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    hscodes: state.cmsHsCode.hscodes,
  }),
  { loadHscodes }
)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
export default class HSCodeList extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loadHscodes: PropTypes.func.isRequired,
    hscodes: PropTypes.shape({
      pageSize: PropTypes.number.isRequired,
      current: PropTypes.number.isRequired,
      searchText: PropTypes.string,
    }).isRequired,
  }
  state = {
    collapsed: true,
  }
  msg = formatMsg(this.props.intl)
  dataSource = new DataTable.DataSource({
    fetcher: params => this.props.loadHscodes(params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize,
      showTotal: total => `共 ${total} 条`,
    }),
    getParams: (pagination) => {
      const params = {
        tenantId: this.props.tenantId,
        pageSize: pagination.pageSize,
        current: pagination.current,
        searchText: this.props.hscodes.searchText,
      };
      return params;
    },
    remotes: this.props.hscodes,
  });
  columns = hscodeColumns().concat([{
    title: '能效',
    dataIndex: 'efficiency',
    width: 80,
  }, {
    title: '合并',
    dataIndex: 'g_merge',
    width: 80,
    className: 'hscode-list-right',
  }, {
    title: '申报单位一',
    dataIndex: 'g_unit_1',
    width: 100,
  }, {
    title: '申报单位二',
    dataIndex: 'g_unit_2',
    width: 100,
  }, {
    title: '申报单位三',
    dataIndex: 'g_unit_3',
    width: 100,
  }]);
  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }
  handleSearch = (value) => {
    const { hscodes } = this.props;
    this.props.loadHscodes({
      tenantId: this.props.tenantId,
      pageSize: hscodes.pageSize,
      current: 1,
      searchText: value,
    });
  }
  handleMenuClick = (e) => {
    if (e.key === 'model') {
      window.open(`${API_ROOTS.default}v1/cms/cmsTradeitem/hscode/model/download/${createFilename('hsUnitModel')}.xlsx`);
    }
  }
  handleUploaded = () => {
    const params = {
      tenantId: this.props.tenantId,
      pageSize: this.props.hscodes.pageSize,
      current: this.props.hscodes.current,
      searchText: this.props.hscodes.searchText,
    };
    this.props.loadHscodes(params);
  }

  render() {
    const { hscodes } = this.props;
    this.dataSource.remotes = hscodes;
    const menu = (
      <Menu onClick={this.handleMenuClick}>
        <Menu.Item key="importData">
          <ExcelUploader
            endpoint={`${API_ROOTS.default}v1/cms/cmsTradeitem/hscode/import/gunit`}
            formData={{
              data: JSON.stringify({
                tenant_id: this.props.tenantId,
              }),
            }}
            onUploaded={this.handleUploaded}
          >
            <Icon type="file-excel" /> {this.msg('importHsunit')}
          </ExcelUploader>
        </Menu.Item>
        <Menu.Item key="model"><Icon type="download" /> 下载模板(申报单位)</Menu.Item>
      </Menu>
    );
    const toolbarActions = (<SearchBox placeholder="编码/名称/描述/申报要素" onSearch={this.handleSearch} width={400} />);
    return (
      <Layout>
        <Sider width={200} className="menu-sider" key="sider">
          <div className="page-header">
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('tradeitem')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div className="left-sider-panel">
            <ModuleMenu currentKey="hscodeQuery" />
          </div>
        </Sider>
        <Layout>
          <PageHeader title={this.msg('hscodeQuery')}>
            <PageHeader.Actions>
              <Dropdown overlay={menu} type="primary">
                <Button >
                  {this.msg('importHscodeItems')} <Icon type="down" />
                </Button>
              </Dropdown>
            </PageHeader.Actions>
          </PageHeader>
          <Content className="page-content" key="main">
            <DataTable toolbarActions={toolbarActions} columns={this.columns} dataSource={this.dataSource} rowKey="id" bordered />
          </Content>
        </Layout>
      </Layout>
    );
  }
}
