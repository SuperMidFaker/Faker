import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Breadcrumb, Button, Layout, Radio, Select, Dropdown, Icon, Menu } from 'antd';
import Table from 'client/components/remoteAntTable';
import QueueAnim from 'rc-queue-anim';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import { loadCustomers } from 'common/reducers/crmCustomers';
import { loadOwners, openAddModal, selectedRepoId } from 'common/reducers/cmsTradeitem';
import AddTradeRepoModal from './modals/addTradeRepo';
import ExtraPanel from './tabpanes/ExtraPane';
import ExcelUpload from 'client/components/excelUploader';

const formatMsg = format(messages);
const { Header, Content, Sider } = Layout;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const Option = Select.Option;

function fetchData({ state, dispatch }) {
  return dispatch(loadOwners({
    tenantId: state.account.tenantId,
  }));
}
@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    repoOwners: state.cmsTradeitem.repoOwners,
    visibleAddModal: state.cmsTradeitem.visibleAddModal,
  }),
  { loadCustomers, openAddModal, selectedRepoId }
)

export default class TradeItemList extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    repoOwners: PropTypes.array.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
    visibleAddModal: PropTypes.bool,
  }
  state = {
    visibleSet: false,
    collapsed: true,
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: this.msg('copProductNo'),
    dataIndex: 'cop_product_no',
    width: 120,
  }, {
    title: this.msg('hscode'),
    dataIndex: 'hscode',
    width: 120,
  }, {
    title: this.msg('gName'),
    dataIndex: 'g_name',
    width: 120,
  }, {
    title: this.msg('gModel'),
    dataIndex: 'g_model',
    width: 120,
  }, {
    title: this.msg('element'),
    dataIndex: 'element',
    width: 120,
  }, {
    title: this.msg('gUnitFtz'),
    dataIndex: 'g_unit_ftz',
    width: 120,
  }, {
    title: this.msg('gUnit'),
    dataIndex: 'g_unit',
    width: 120,
  }, {
    title: this.msg('unit1'),
    dataIndex: 'unit_1',
    width: 120,
  }, {
    title: this.msg('unit2'),
    dataIndex: 'unit_2',
    width: 120,
  }, {
    title: this.msg('fixedQty'),
    dataIndex: 'fixed_qty',
    width: 120,
  }, {
    title: this.msg('fixedUnit'),
    dataIndex: 'fixed_unit',
    width: 120,
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
    width: 120,
  }, {
    title: this.msg('preClassifyEndDate'),
    dataIndex: 'pre_classify_end_date ',
    width: 120,
  }, {
    title: this.msg('remark'),
    dataIndex: 'remark',
    width: 120,
  }]
  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }
  handleSelectChange = (value) => {
    if (value) {
      this.setState({ visibleSet: true });
      const owner = this.props.repoOwners.filter(own => own.id === value)[0];
      this.props.selectedRepoId(owner.repo_id);
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
    } else if (e.key === 'export') {
    }
  }
  menu = (
    <Menu onClick={this.handleMenuClick}>
      <Menu.Item key="importData">
        <ExcelUpload endpoint={`${API_ROOTS.default}v1/cms/cmsTradeitem/tradeitems/import`}
          formData={{
            data: JSON.stringify({
              bill_seq_no: this.props.billSeqNo,
              tenant_id: this.props.tenantId,
              creater_login_id: this.props.loginId,
            }),
          }} onUploaded={this.handleUploaded}
        >
          <Icon type="file-excel" /> {this.msg('importItems')}
        </ExcelUpload>
      </Menu.Item>
      <Menu.Item key="create"><Icon type="plus" /> 新建物料表</Menu.Item>
      <Menu.Item key="export"><Icon type="export" /> 导出物料表</Menu.Item>
    </Menu>);
  render() {
    const { repoOwners } = this.props;
    const { visibleSet } = this.state;
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Layout>
          <Layout>
            <Header className="top-bar" key="header">
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
            </Header>
            <Content className="main-content" key="main">
              <div className="page-body">
                <div className="toolbar">
                  <div className="toolbar-right">
                    <Select
                      showSearch
                      style={{ width: 300 }}
                      placeholder="选择客户"
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
                    {visibleSet &&
                      <div className="toolbar-right">
                        <Button size="large"
                          className={this.state.collapsed ? '' : 'btn-toggle-on'}
                          icon={this.state.collapsed ? 'menu-fold' : 'menu-unfold'}
                          onClick={this.toggle}
                        />
                        <Dropdown overlay={this.menu} type="primary">
                          <Button type="primary" onClick={this.handleButtonClick}>
                            {this.msg('addMore')} <Icon type="down" />
                          </Button>
                        </Dropdown>
                      </div>
                    }
                  </div>
                  <Button type="primary" icon="plus" onClick={this.handleAddOwener}>
                    新增物料管理企业
                  </Button>
                </div>
                <div className="panel-body table-panel">
                  <Table columns={this.columns} dataSource={this.dataSource} scroll={{ x: 1480, y: 2300 }} />
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
