import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Link } from 'react-router';
import { Breadcrumb, Button, Collapse, Icon, Popconfirm, Input, Layout, Select, message } from 'antd';
import Table from 'client/components/remoteAntTable';
import SearchBar from 'client/components/search-bar';
import ButtonToggle from 'client/components/ButtonToggle';
import connectNav from 'client/common/decorators/connect-nav';
import { setCurrentOwner, syncTradeItemSkus, loadOwnerSkus, delSku, openApplyPackingRuleModal } from 'common/reducers/cwmSku';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import PackingRulePane from './panes/packingRulePane';
import ApplyPackingRuleModal from './modal/applyPackingRuleModal';
import { formatMsg } from '../message.i18n';

const { Header, Content, Sider } = Layout;
const Search = Input.Search;
const Option = Select.Option;
const Panel = Collapse.Panel;

@injectIntl
@connect(
  state => ({
    whses: state.cwmContext.whses,
    whse: state.cwmContext.defaultWhse,
    owners: state.cwmContext.whseAttrs.owners,
    owner: state.cwmSku.owner,
    loading: state.cwmSku.loading,
    syncing: state.cwmSku.skuSyncing,
    skulist: state.cwmSku.list,
    listFilter: state.cwmSku.listFilter,
    sortFilter: state.cwmSku.sortFilter,
    loginId: state.account.loginId,
    tenantId: state.account.tenantId,
  }),
  { setCurrentOwner, syncTradeItemSkus, loadOwnerSkus, switchDefaultWhse, delSku, openApplyPackingRuleModal }
)
@connectNav({
  depth: 2,
  moduleName: 'cwm',
})
export default class CWMSkuList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    whses: PropTypes.arrayOf(PropTypes.shape({ code: PropTypes.string, name: PropTypes.string })),
    owners: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      partner_code: PropTypes.string,
      name: PropTypes.string,
    })),
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    collapsed: false,
    rightSiderCollapsed: true,
    selectedRowKeys: [],
    tableOwners: [],
  }
  componentWillMount() {
    if (!this.props.owner.id) {
      this.props.setCurrentOwner(this.props.owners[0] || {});
    }
    if (this.props.owner.id) {
      this.props.loadOwnerSkus({
        owner_partner_id: this.props.owner.id,
        filter: JSON.stringify(this.props.listFilter),
        sorter: JSON.stringify(this.props.sortFilter),
        pageSize: this.props.skulist.pageSize,
        current: this.props.skulist.current,
      });
    }
    this.setState({ tableOwners: this.props.owners });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.owners !== this.props.owners) {
      this.props.setCurrentOwner(nextProps.owners[0] || {});
      this.setState({ tableOwners: nextProps.owners });
    }
    if (nextProps.owner.id !== this.props.owner.id) {
      this.props.loadOwnerSkus({
        owner_partner_id: nextProps.owner.id || 0,
        filter: JSON.stringify(nextProps.listFilter),
        sorter: JSON.stringify(nextProps.sortFilter),
        pageSize: nextProps.skulist.pageSize,
        current: 1,
      });
    }
  }
  msg = formatMsg(this.props.intl)
  ownerColumns = [{
    dataIndex: 'name',
    key: 'owner_name',
    render: (name, row) => (<span className="menu-sider-item">{row.partner_code ? `${row.partner_code} | ${row.name}` : row.name}</span>),
  }]
  columns = [{
    title: 'SKU',
    dataIndex: 'sku',
    width: 200,
  }, {
    title: this.msg('productNo'),
    width: 180,
    dataIndex: 'product_no',
  }, {
    title: this.msg('hscode'),
    width: 200,
    dataIndex: 'hscode',
  }, {
    title: this.msg('productCnDesc'),
    dataIndex: 'desc_cn',
  }, {
    title: this.msg('productEnDesc'),
    dataIndex: 'desc_en',
  }, {
    title: this.msg('productType'),
    dataIndex: 'type',
  }, {
    title: this.msg('lastModifiedDate'),
    dataIndex: 'last_modified_date',
    width: 120,
  }, {
    title: this.msg('createdDate'),
    dataIndex: 'created_date',
    width: 120,
  }, {
    title: this.msg('opColumn'),
    width: 100,
    fixed: 'right',
    render: (_, row) => (
      <div>
        <Link to={`/cwm/products/sku/edit/${row.sku}`}><Icon type="edit" /></Link>
        <span className="ant-divider" />
        <Popconfirm title="确定删除?" onConfirm={() => this.handleRemove(row.sku)}>
          <a><Icon type="delete" /></a>
        </Popconfirm>
      </div>),
  }]
  dataSource = new Table.DataSource({
    fetcher: params => this.props.loadOwnerSkus(params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize,
      showTotal: total => `共 ${total} 条`,
    }),
    getParams: (pagination, filters, sorter) => {
      const params = {
        owner_partner_id: this.props.owner.id,
        pageSize: pagination.pageSize,
        current: pagination.current,
        sorter: JSON.stringify({
          field: sorter.field,
          order: sorter.order === 'descend' ? 'DESC' : 'ASC',
        }),
        filter: JSON.stringify(this.props.listFilter),
      };
      return params;
    },
    remotes: this.props.skulist,
  })
  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }
  toggleRightSider = () => {
    this.setState({
      rightSiderCollapsed: !this.state.rightSiderCollapsed,
    });
  }
  handleRemove = (sku) => {
    this.props.delSku(sku).then((result) => {
      if (!result.errors) {
        this.props.loadOwnerSkus({
          owner_partner_id: this.props.owner.id,
          filter: JSON.stringify(this.props.listFilter),
          sorter: JSON.stringify(this.props.sortFilter),
          pageSize: this.props.skulist.pageSize,
          current: this.props.skulist.current,
        });
      }
    });
  }
  handleOwnerSearch = (value) => {
    if (value) {
      const towners = this.state.tableOwners.filter(to => to.partner_code.indexOf(value) > 0 || to.name.indexOf(value) > 0);
      this.setState({ tableOwners: towners });
      if (towners.length === 0) {
        this.props.setCurrentOwner({});
      } else if (towners[0].id !== this.props.owner.id) {
        this.props.setCurrentOwner(towners[0]);
      }
    } else {
      this.setState({ tableOwners: this.props.owners });
      this.props.setCurrentOwner(this.props.owners[0] || {});
    }
  }
  handleSearch = (value) => {
    const filter = { ...this.props.listFilter, sku: value };
    this.props.loadOwnerSkus({
      owner_partner_id: this.props.owner.id,
      filter: JSON.stringify(filter),
      sorter: JSON.stringify(this.props.sortFilter),
      pageSize: this.props.skulist.pageSize,
      current: 1,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
  }
  handleTradeItemsSync = () => {
    this.props.syncTradeItemSkus(this.props.tenantId, this.props.owner.id, this.props.loginId)
      .then((result) => {
        if (result.error) {
          if (result.error.message === 'NO_OWNER_REPO') {
            message.error('该客户暂无企业物料库');
          }
        } else {
          this.props.loadOwnerSkus({
            owner_partner_id: this.props.owner.id,
            filter: JSON.stringify(this.props.listFilter),
            sorter: JSON.stringify(this.props.sortFilter),
            pageSize: this.props.skulist.pageSize,
            current: 1,
          });
        }
      });
  }
  handleCreateBtnClick = () => {
    this.context.router.push('/cwm/products/sku/create');
  }
  handleWhseChange = (value) => {
    this.props.switchDefaultWhse(value);
    message.info('当前仓库已切换');
  }
  handleOwnerSelect = (row) => {
    this.props.setCurrentOwner(row);
  }
  handleApplyPackingRule = () => {
    this.props.openApplyPackingRuleModal();
  }
  render() {
    const { skulist, owner, whse, whses, loading, syncing, listFilter } = this.props;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    this.dataSource.remotes = skulist;
    return (
      <Layout>
        <Sider width={320} className="menu-sider" key="sider">
          <div className="page-header">
            <Breadcrumb>
              <Breadcrumb.Item>
                <Select size="large" value={whse.code} placeholder="选择仓库" style={{ width: 160 }} onChange={this.handleWhseChange}>
                  {whses.map(wh => <Option value={wh.code} key={wh.code}>{wh.name}</Option>)}
                </Select>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.msg('productsSku')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div className="left-sider-panel">
            <div className="toolbar">
              <Search placeholder={this.msg('ownerSearch')} size="large" onSearch={this.handleOwnerSearch} />
            </div>
            <div className="list-body">
              <Table size="middle" columns={this.ownerColumns} showHeader={false} dataSource={this.state.tableOwners} rowKey="id"
                rowClassName={row => row.id === this.props.owner.id ? 'table-row-selected' : ''} onRowClick={this.handleOwnerSelect}
              />
            </div>
          </div>
        </Sider>
        <Layout style={{ width: 0 }}>
          <Header className="page-header">
            {owner.id &&
            <Breadcrumb>
              <Breadcrumb.Item>
                货主
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {owner.name}
              </Breadcrumb.Item>
            </Breadcrumb>}
            {owner.id &&
            <div className="page-header-tools">
              <Button size="large" icon="sync" onClick={this.handleTradeItemsSync} loading={syncing}>
                {this.msg('syncTradeItems')}
              </Button>
              <Button size="large" icon="upload" disabled={syncing}>
                {this.msg('productImport')}
              </Button>
              <Button type="primary" size="large" icon="plus" onClick={this.handleCreateBtnClick} disabled={syncing}>
                {this.msg('createSKU')}
              </Button>
              <ButtonToggle size="large" iconOn="setting" iconOff="setting" onClick={this.toggleRightSider} />
            </div>}
          </Header>
          <Content className="main-content" key="main">
            <div className="page-body">
              <div className="toolbar">
                <SearchBar size="large" placeholder={this.msg('productSearchPlaceholder')} onInputSearch={this.handleSearch} value={listFilter.sku} />
                <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
                  <h3>已选中{this.state.selectedRowKeys.length}项</h3>
                  <Button onClick={this.handleApplyPackingRule}>采用包装规则</Button>
                </div>
              </div>
              <div className="panel-body table-panel table-fixed-layout">
                <Table columns={this.columns} dataSource={this.dataSource} rowSelection={rowSelection} rowKey="id"
                  scroll={{ x: 1400 }} loading={loading}
                />
              </div>
            </div>
          </Content>
        </Layout>
        <Sider
          trigger={null}
          defaultCollapsed
          collapsible
          collapsed={this.state.rightSiderCollapsed}
          width={480}
          collapsedWidth={0}
          className="right-sider"
        >
          <div className="right-sider-panel">
            <div className="panel-header">
              <h3>规则设置</h3>
            </div>
            <Collapse accordion defaultActiveKey="packing">
              <Panel header="包装规则" key="packing">
                <PackingRulePane />
              </Panel>
              <Panel header="条码规则" key="tag" />
            </Collapse>
          </div>
        </Sider>
        <ApplyPackingRuleModal />
      </Layout>
    );
  }
}
