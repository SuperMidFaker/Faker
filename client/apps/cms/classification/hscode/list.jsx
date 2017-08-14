import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { Breadcrumb, Layout, Button, Menu, Dropdown, Icon, Input } from 'antd';
import Table from 'client/components/remoteAntTable';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { loadHscodes } from 'common/reducers/cmsHsCode';
import '../index.less';
import ExcelUploader from 'client/components/ExcelUploader';
import { createFilename } from 'client/util/dataTransform';
import { hscodeColumns } from './hscodeColumns';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const Search = Input.Search;

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
          <ExcelUploader endpoint={`${API_ROOTS.default}v1/cms/cmsTradeitem/hscode/import/gunit`}
            formData={{
              data: JSON.stringify({
                tenant_id: this.props.tenantId,
              }),
            }} onUploaded={this.handleUploaded}
          >
            <Icon type="file-excel" /> {this.msg('importHsunit')}
          </ExcelUploader>
        </Menu.Item>
        <Menu.Item key="model"><Icon type="download" /> 下载模板(申报单位)</Menu.Item>
      </Menu>
    );
    return (
      <Layout className="ant-layout-wrapper">
        <Layout>
          <Header className="page-header">
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('classification')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.msg('hscodeInquiry')}
              </Breadcrumb.Item>
            </Breadcrumb>
            <div className="page-header-tools">
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
                <Search placeholder="编码/名称/描述/申报要素" onSearch={this.handleSearch} size="large" style={{ width: 400 }} />
              </div>
              <div className="panel-body table-panel table-fixed-layout">
                <Table columns={this.columns} dataSource={this.dataSource} rowKey="id" bordered
                  scroll={{ x: this.columns.reduce((acc, cur) => acc + (cur.width ? cur.width : 200), 0) }}
                />
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
