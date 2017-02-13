import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { Breadcrumb, Button, Layout, Radio, Select, Dropdown, Icon, Menu, Popconfirm, message } from 'antd';
import Table from 'client/components/remoteAntTable';
import NavLink from 'client/components/nav-link';
import QueueAnim from 'rc-queue-anim';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import { loadCustomers } from 'common/reducers/crmCustomers';
import { loadOwners, openAddModal, selectedRepoId, loadTradeItems, deleteItem } from 'common/reducers/cmsTradeitem';
import AddTradeRepoModal from './modals/addTradeRepo';
import ExtraPanel from './tabpanes/ExtraPane';
import ExcelUpload from 'client/components/excelUploader';
import { createFilename } from 'client/util/dataTransform';

const formatMsg = format(messages);
const { Header, Content, Sider } = Layout;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const Option = Select.Option;

function fetchData({ state, dispatch }) {
  const promises = [];
  promises.push(dispatch(loadTradeItems({
    repoId: state.cmsTradeitem.repoId,
    pageSize: state.cmsTradeitem.tradeItemlist.pageSize,
    currentPage: state.cmsTradeitem.tradeItemlist.current,
  })));
  promises.push(dispatch(loadOwners({
    tenantId: state.account.tenantId,
  })));
  return Promise.all(promises);
}
@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    repoOwners: state.cmsTradeitem.repoOwners,
    repoId: state.cmsTradeitem.repoId,
    tradeItemlist: state.cmsTradeitem.tradeItemlist,
    visibleAddModal: state.cmsTradeitem.visibleAddModal,
  }),
  { loadCustomers, openAddModal, selectedRepoId, loadTradeItems, deleteItem }
)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
export default class TradeItemList extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    repoOwners: PropTypes.array.isRequired,
    tradeItemlist: PropTypes.object.isRequired,
    repoId: PropTypes.number,
    visibleAddModal: PropTypes.bool,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    collapsed: true,
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: this.msg('copProductNo'),
    dataIndex: 'cop_product_no',
    width: 180,
  }, {
    title: this.msg('hscode'),
    dataIndex: 'hscode',
    width: 200,
  }, {
    title: this.msg('gName'),
    dataIndex: 'g_name',
    width: 120,
  }, {
    title: this.msg('gModel'),
    dataIndex: 'g_model',
    width: 300,
  }, {
    title: this.msg('element'),
    dataIndex: 'element',
    width: 400,
  }, {
    title: this.msg('gUnitFtz'),
    dataIndex: 'g_unit_ftz',
    width: 80,
  }, {
    title: this.msg('gUnit'),
    dataIndex: 'g_unit',
    width: 80,
  }, {
    title: this.msg('unit1'),
    dataIndex: 'unit_1',
    width: 80,
  }, {
    title: this.msg('unit2'),
    dataIndex: 'unit_2',
    width: 80,
  }, {
    title: this.msg('fixedQty'),
    dataIndex: 'fixed_qty',
    width: 120,
  }, {
    title: this.msg('fixedUnit'),
    dataIndex: 'fixed_unit',
    width: 80,
  }, {
    title: this.msg('origCountry'),
    dataIndex: 'origin_country',
    width: 120,
  }, {
    title: this.msg('unitNetWt'),
    dataIndex: 'unit_net_wt',
    width: 120,
  }, {
    title: this.msg('customsControl'),
    dataIndex: 'customs_control',
    width: 120,
  }, {
    title: this.msg('inspQuarantine'),
    dataIndex: 'inspection_quarantine',
    width: 120,
  }, {
    title: this.msg('unitPrice'),
    dataIndex: 'unit_price',
    width: 120,
  }, {
    title: this.msg('currency'),
    dataIndex: 'currency',
    width: 120,
  }, {
    title: this.msg('preClassifyNo'),
    dataIndex: 'pre_classify_no',
    width: 120,
  }, {
    title: this.msg('preClassifyStartDate'),
    dataIndex: 'pre_classify_start_date ',
    width: 180,
    render: (o, record) => {
      if (record.pre_classify_start_date) {
        return moment(record.pre_classify_start_date).format('YYYY-MM-DD');
      } else {
        return '--';
      }
    },
  }, {
    title: this.msg('preClassifyEndDate'),
    dataIndex: 'pre_classify_end_date ',
    width: 180,
    render: (o, record) => {
      if (record.pre_classify_end_date) {
        return moment(record.pre_classify_end_date).format('YYYY-MM-DD');
      } else {
        return '--';
      }
    },
  }, {
    title: this.msg('remark'),
    dataIndex: 'remark',
    width: 200,
  }]
  dataSource = new Table.DataSource({
    fetcher: params => this.props.loadTradeItems(params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize,
    }),
    getParams: (pagination, filters, sorter) => {
      const params = {
        repoId: this.props.repoId,
        pageSize: pagination.pageSize,
        currentPage: pagination.current,
      };
      const filter = { ...this.props.listFilter, sortField: sorter.field, sortOrder: sorter.order };
      params.filter = JSON.stringify(filter);
      return params;
    },
    remotes: this.props.tradeItemlist,
  })
  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }
  handleItemListLoad = (repoid, currentPage, filter) => {
    const { repoId, listFilter, tradeItemlist: { pageSize, current } } = this.props;
    this.setState({ expandedKeys: [] });
    this.props.loadTradeItems({
      repoId: repoid || repoId,
      filter: JSON.stringify(filter || listFilter),
      pageSize,
      currentPage: currentPage || current,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      }
    });
  }
  handleItemDel = (id) => {
    this.props.deleteItem(id).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        this.props.loadTradeItems(this.props.repoId);
      }
    });
  }
  handleSelectChange = (value) => {
    if (value) {
      const owner = this.props.repoOwners.filter(own => own.id === value)[0];
      this.props.selectedRepoId(owner.repo_id);
      this.handleItemListLoad(owner.repo_id);
    }
  }
  handleAddOwener = () => {
    this.props.loadCustomers({
      tenantId: this.props.tenantId,
    });
    this.props.openAddModal();
  }
  handleButtonClick = (ev) => {
    ev.stopPropagation();
  }
  handleMenuClick = (e) => {
    if (e.key === 'create') {
      this.context.router.push('/clearance/products/tradeitem/create');
    } else if (e.key === 'export') {
      window.open(`${API_ROOTS.default}v1/cms/cmsTradeitem/tradeitems/export/${createFilename('itemsExport')}.xlsx?repoId=${this.props.repoId}`);
    } else if (e.key === 'model') {
      window.open(`${API_ROOTS.default}v1/cms/cmsTradeitem/tradeitems/model/download/${createFilename('tradeItemModel')}.xlsx`);
    }
  }
  handleUploaded = () => {
    this.handleItemListLoad();
  }
  render() {
    const { repoOwners, tradeItemlist, repoId } = this.props;
    this.dataSource.remotes = tradeItemlist;
    let columns = [];
    columns = [...this.columns];
    columns.push({
      title: this.msg('opColumn'),
      width: 80,
      fixed: 'right',
      render: (o, record) => (
        <span>
          <NavLink to={`/clearance/products/tradeitem/edit/${record.id}`}>
            {this.msg('modify')}
          </NavLink>
          <span className="ant-divider" />
          <Popconfirm title={this.msg('deleteConfirm')} onConfirm={() => this.handleItemDel(record.id)}>
            <a role="button">{this.msg('delete')}</a>
          </Popconfirm>
        </span>
        ),
    });
    const menu = (
      <Menu onClick={this.handleMenuClick}>
        <Menu.Item key="importData">
          <ExcelUpload endpoint={`${API_ROOTS.default}v1/cms/cmsTradeitem/tradeitems/import`}
            formData={{
              data: JSON.stringify({
                repo_id: this.props.repoId,
                tenant_id: this.props.tenantId,
                created_login_id: this.props.loginId,
                created_login_name: this.props.loginName,
              }),
            }} onUploaded={this.handleUploaded}
          >
            <Icon type="file-excel" /> {this.msg('importItems')}
          </ExcelUpload>
        </Menu.Item>
        <Menu.Item key="create"><Icon type="plus" /> 新增物料</Menu.Item>
        <Menu.Item key="export"><Icon type="export" /> 导出物料表</Menu.Item>
        <Menu.Item key="model"><Icon type="download" /> 下载模板</Menu.Item>
      </Menu>);
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Layout>
          <Layout>
            <Header className="top-bar top-bar-fixed" key="header">
              <Breadcrumb>
                <Breadcrumb.Item>
                  {this.msg('tradeItemManagement')}
                </Breadcrumb.Item>
              </Breadcrumb>
              <RadioGroup onChange={this.handleRadioChange} size="large">
                <RadioButton value="unclassified">{this.msg('filterUnclassified')}</RadioButton>
                <RadioButton value="pending">{this.msg('filterPending')}</RadioButton>
                <RadioButton value="classified">{this.msg('filterClassified')}</RadioButton>
              </RadioGroup>
              <div className="top-bar-tools">
                <Select
                  showSearch
                  style={{ width: 300 }}
                  placeholder="选择客户物料库"
                  optionFilterProp="children"
                  size="large"
                  onChange={this.handleSelectChange}
                >
                  {
                    repoOwners.map(data => (<Option key={data.id} value={data.id}
                      search={`${data.partner_code}${data.name}`}
                    >{data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}</Option>)
                    )}
                </Select>
                <Button type="primary" size="large" icon="plus" onClick={this.handleAddOwener}>
                  新增物料库
                </Button>
                {repoId && <Button size="large"
                  className={this.state.collapsed ? '' : 'btn-toggle-on'}
                  icon={this.state.collapsed ? 'menu-fold' : 'menu-unfold'}
                  onClick={this.toggle}
                />}
              </div>
            </Header>
            <Content className="main-content top-bar-fixed" key="main">
              <div className="page-body">
                <div className="toolbar">
                  {repoId &&
                    <Dropdown overlay={menu} type="primary">
                      <Button type="primary" size="large" onClick={this.handleButtonClick}>
                        {this.msg('addMore')} <Icon type="down" />
                      </Button>
                    </Dropdown>
                  }
                </div>
                <div className="panel-body table-panel">
                  <Table columns={columns} dataSource={this.dataSource} scroll={{ x: 2400, y: 2300 }} />
                </div>
                <AddTradeRepoModal />
              </div>
            </Content>
          </Layout>
          <Sider
            trigger={null}
            defaultCollapsed
            collapsible
            collapsed={this.state.collapsed}
            width={320}
            collapsedWidth={0}
            className="right-sider"
          >
            <div className="right-sider-panel">
              <ExtraPanel />
            </div>
          </Sider>
        </Layout>
      </QueueAnim>
    );
  }
}
