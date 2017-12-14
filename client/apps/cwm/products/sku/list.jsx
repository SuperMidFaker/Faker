import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Collapse, Input, Layout, Select, message, Table } from 'antd';
import DataTable from 'client/components/DataTable';
import SearchBar from 'client/components/SearchBar';
import ButtonToggle from 'client/components/ButtonToggle';
import RowAction from 'client/components/RowAction';
import connectNav from 'client/common/decorators/connect-nav';
import { setCurrentOwner, syncTradeItemSkus, loadOwnerSkus, delSku, openApplyPackingRuleModal } from 'common/reducers/cwmSku';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import PackingRulePane from './panes/packingRulePane';
import ApplyPackingRuleModal from './modal/applyPackingRuleModal';
import PageHeader from 'client/components/PageHeader';
import ImportDataPanel from 'client/components/ImportDataPanel';
import { formatMsg } from '../message.i18n';
import moment from 'moment';

const { Content, Sider } = Layout;
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
    importPanelVisible: false,
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
    title: this.msg('descCN'),
    dataIndex: 'desc_cn',
  }, {
    title: this.msg('skuPack'),
    dataIndex: 'sku_pack_unit_name',
  }, {
    title: this.msg('perSKUQty'),
    dataIndex: 'sku_pack_qty',
  }, {
    title: this.msg('lastModifiedDate'),
    dataIndex: 'last_updated_date',
    width: 120,
    render: col => col && moment(col).format('MM.DD HH:mm'),
  }, {
    title: this.msg('createdDate'),
    dataIndex: 'created_date',
    width: 120,
    render: col => col && moment(col).format('MM.DD HH:mm'),
  }, {
    title: this.msg('opColumn'),
    dataIndex: 'OPS_COL',
    width: 100,
    fixed: 'right',
    render: (_, row) => (
      <span>
        <RowAction onClick={this.handleEditSku} icon="edit" label="修改" row={row} />
        <RowAction danger confirm="确定要删除吗?" onConfirm={() => this.handleRemove(row.id)} icon="delete" row={row} />
      </span>),
  }]
  dataSource = new DataTable.DataSource({
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
  handleEditSku = (sku) => {
    const link = `/cwm/products/sku/edit/${sku.id}`;
    this.context.router.push(link);
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
    this.props.syncTradeItemSkus(this.props.owner.id, this.props.loginId)
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
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  skuUploaded = () => {
    this.props.loadOwnerSkus({
      owner_partner_id: this.props.owner.id,
      filter: JSON.stringify(this.props.listFilter),
      sorter: JSON.stringify(this.props.sortFilter),
      pageSize: this.props.skulist.pageSize,
      current: 1,
    });
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
    const toolbarActions = (<span>
      <SearchBar placeholder={this.msg('productSearchPlaceholder')} onInputSearch={this.handleSearch} value={listFilter.sku} />
    </span>);
    const bulkActions = (<span>
      <Button onClick={this.handleApplyPackingRule}>采用包装规则</Button>
    </span>);
    return (
      <Layout>
        <Sider width={320} className="menu-sider" key="sider">
          <div className="page-header">
            <Breadcrumb>
              <Breadcrumb.Item>
                <Select value={whse.code} placeholder="选择仓库" style={{ width: 160 }} onChange={this.handleWhseChange}>
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
              <Search placeholder={this.msg('ownerSearch')} onSearch={this.handleOwnerSearch} />
            </div>
            <div className="list-body">
              <Table size="middle" columns={this.ownerColumns} showHeader={false} dataSource={this.state.tableOwners} rowKey="id"
                rowClassName={row => row.id === this.props.owner.id ? 'table-row-selected' : ''}
                onRow={record => ({
                  onClick: () => { this.handleOwnerSelect(record); },
                })}
              />
            </div>
          </div>
        </Sider>
        <Layout>
          <PageHeader>
            {owner.id &&
            <PageHeader.Title>
              <Breadcrumb>
                <Breadcrumb.Item>
                  货主
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                  {owner.name}
                </Breadcrumb.Item>
              </Breadcrumb>
            </PageHeader.Title>}
            {owner.id &&
            <PageHeader.Actions>
              <Button icon="sync" onClick={this.handleTradeItemsSync} loading={syncing}>
                {this.msg('syncTradeItems')}
              </Button>
              <Button icon="upload" disabled={syncing} onClick={() => { this.setState({ importPanelVisible: true }); }}>
                {this.msg('productImport')}
              </Button>
              <Button type="primary" icon="plus" onClick={this.handleCreateBtnClick} disabled={syncing}>
                {this.msg('createSKU')}
              </Button>
              <ButtonToggle iconOn="setting" iconOff="setting" onClick={this.toggleRightSider} />
            </PageHeader.Actions>}
          </PageHeader>
          <Content className="page-content" key="main">
            <DataTable columns={this.columns} dataSource={this.dataSource} rowSelection={rowSelection} rowKey="id"
              scroll={{ x: 1400 }} loading={loading} toolbarActions={toolbarActions} bulkActions={bulkActions}
              selectedRowKeys={this.state.selectedRowKeys} handleDeselectRows={this.handleDeselectRows}
            />
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
        <ImportDataPanel
          visible={this.state.importPanelVisible}
          endpoint={`${API_ROOTS.default}v1/cwm/sku/import`}
          formData={{
            ownerId: owner.id,
            ownerTenantId: owner.partner_tenant_id,
            name: owner.name,
            loginId: this.props.loginId,
          }}
          onClose={() => { this.setState({ importPanelVisible: false }); }}
          onUploaded={this.skuUploaded}
          template={`${XLSX_CDN}/sku导入模板.xlsx`}
        />
        <ApplyPackingRuleModal />
      </Layout>
    );
  }
}
