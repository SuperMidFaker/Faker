import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { Breadcrumb, Layout, Button, Menu, Dropdown, Icon } from 'antd';
import Table from 'client/components/remoteAntTable';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { loadHscodes } from 'common/reducers/cmsHsCode';
import SearchBar from 'client/components/search-bar';
import '../index.less';
import ExcelUpload from 'client/components/excelUploader';
import { createFilename } from 'client/util/dataTransform';
import { hscodeColumns } from './hscodeColumns';

const formatMsg = format(messages);
const { Header, Content } = Layout;

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
export default class HsCodeList extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loadHscodes: PropTypes.func.isRequired,
    hscodes: PropTypes.object.isRequired,
  }
  state = {
    collapsed: true,
  }
  msg = key => formatMsg(this.props.intl, key)
  dataSource = new Table.DataSource({
    fetcher: params => this.props.loadHscodes(params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize,
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
      current: hscodes.current,
      searchText: value,
    });
  }
  handleMenuClick = (e) => {
    if (e.key === 'model') {
      window.open(`${API_ROOTS.default}v1/cms/cmsTradeitem/hscode/model/download/${createFilename('hsUnitModel')}.xlsx`);
    }
  }
  handleUploaded = () => {

  }

  render() {
    const { hscodes } = this.props;
    this.dataSource.remotes = hscodes;
    const menu = (
      <Menu onClick={this.handleMenuClick}>
        <Menu.Item key="importData">
          <ExcelUpload endpoint={`${API_ROOTS.default}v1/cms/cmsTradeitem/hscode/import/gunit`}
            formData={{
              data: JSON.stringify({
                tenant_id: this.props.tenantId,
              }),
            }} onUploaded={this.handleUploaded}
          >
            <Icon type="file-excel" /> {this.msg('importHsunit')}
          </ExcelUpload>
        </Menu.Item>
        <Menu.Item key="model"><Icon type="download" /> 下载模板(申报单位)</Menu.Item>
      </Menu>
    );
    return (
      <Layout className="ant-layout-wrapper">
        <Layout>
          <Header className="top-bar">
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('classification')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.msg('hscodeInquiry')}
              </Breadcrumb.Item>
            </Breadcrumb>
            <div className="top-bar-tools">
              <Dropdown overlay={menu} type="primary">
                <Button size="large">
                  {this.msg('importItems')} <Icon type="down" />
                </Button>
              </Dropdown>
            </div>
          </Header>
          <Content className="main-content" key="main">
            <div className="page-body">
              <div className="toolbar">
                <SearchBar placeholder="编码/名称/描述/申报要素" onInputSearch={this.handleSearch}
                  value={this.props.hscodes.searchText} size="large"
                />
              </div>
              <div className="panel-body table-panel">
                <Table columns={this.columns} dataSource={this.dataSource} scroll={{ x: 2300 }} rowKey="id" />
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }
}