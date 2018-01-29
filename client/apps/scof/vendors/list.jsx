import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Form, Row, Table, Tooltip, Layout } from 'antd';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import ButtonToggle from 'client/components/ButtonToggle';
import { format } from 'client/common/i18n/helpers';
import { loadVendors, showVendorModal, deleteVendor } from 'common/reducers/sofVendors';
import { PARTNER_ROLES } from 'common/constants';
import TrimSpan from 'client/components/trimSpan';
import SearchBox from 'client/components/SearchBox';
import OverviewCard from './cards/overviewCard';
import ResourcesCard from './cards/resourcesCard';
import messages from './message.i18n';
import VendorModal from './modals/vendorModal';

const formatMsg = format(messages);
const { Header, Content, Sider } = Layout;

function fetchData({ state, dispatch }) {
  return dispatch(loadVendors(state.account.tenantId));
}
@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    vendors: state.sofVendors.vendors,
    loading: state.sofVendors.loading,
    loaded: state.sofVendors.loaded,
  }),
  { loadVendors, deleteVendor, showVendorModal }
)
@connectNav({
  depth: 2,
  moduleName: 'scof',
})
@Form.create()
export default class VendorList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    loaded: PropTypes.bool.isRequired,
    tenantId: PropTypes.number.isRequired,
    vendors: PropTypes.array.isRequired,
    loadVendors: PropTypes.func.isRequired,
    deleteVendor: PropTypes.func.isRequired,
    showVendorModal: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
  }
  state = {
    vendorModalVisible: false,
    vendor: {},
    currentPage: 1,
    collapsed: false,
    unchanged: true,
    vendors: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.vendors !== this.props.vendors) {
      this.setState({
        vendor: nextProps.vendors.length === 0 ? {} : nextProps.vendors[0],
      });
    }
    this.setState({ vendors: nextProps.vendors });
    if (!nextProps.loaded) {
      this.handleTableLoad();
    }
  }
  msg = key => formatMsg(this.props.intl, key)

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }
  handleInputChanged = () => {
    this.setState({ unchanged: false });
  }
  handleRowClick = (record) => {
    this.setState({
      vendor: record,
      unchanged: true,
    });
    this.props.form.setFieldsValue(record);
  }
  handleTableLoad = () => {
    this.props.loadVendors(this.props.tenantId);
  }
  handleDelVendor = () => {
    this.props.deleteVendor(this.state.vendor.id, PARTNER_ROLES.CUS).then(() => {
      this.handleTableLoad();
    });
  }
  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  }
  handleSearch = (value) => {
    let vendors = this.props.vendors;
    if (value) {
      vendors = this.props.vendors.filter((item) => {
        const reg = new RegExp(value);
        return reg.test(item.name);
      });
    }
    this.setState({ vendors, currentPage: 1 });
  }
  handleSave = () => {
  }
  render() {
    const { vendor } = this.state;
    const columns = [{
      dataIndex: 'name',
      key: 'name',
      render: o => (<span className="menu-sider-item"><TrimSpan text={o} maxLen={22} /></span>),
    }];
    return (
      <Layout>
        <Sider
          width={320}
          className="menu-sider"
          key="sider"
          trigger={null}
          collapsible
          collapsed={this.state.collapsed}
          collapsedWidth={0}
        >

          <div className="page-header">
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('vendor')}
              </Breadcrumb.Item>
            </Breadcrumb>
            <div className="pull-right">
              <Tooltip placement="bottom" title="新增供应商">
                <Button type="primary" shape="circle" icon="plus" onClick={() => this.props.showVendorModal('add')} />
              </Tooltip>
            </div>
          </div>
          <div className="left-sider-panel">
            <div className="toolbar">
              <SearchBox
                placeholder={this.msg('searchPlaceholder')}
                onSearch={this.handleSearch}
              />
            </div>
            <div className="list-body">
              <Table
                size="middle"
                dataSource={this.state.vendors}
                columns={columns}
                showHeader={false}
                pagination={{ current: this.state.currentPage, defaultPageSize: 50, onChange: this.handlePageChange }}
                rowClassName={record => (record.id === vendor.id ? 'table-row-selected' : '')}
                rowKey="id"
                loading={this.props.loading}
                onRow={record => ({
                  onClick: () => { this.handleRowClick(record); },
                })}
              />
            </div>
            <VendorModal onOk={this.handleTableLoad} />
          </div>
        </Sider>
        <Layout>
          <Header className="page-header">
            { this.state.collapsed && <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('vendor')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {vendor.name}
              </Breadcrumb.Item>
            </Breadcrumb>}
            <ButtonToggle
              iconOn="menu-fold"
              iconOff="menu-unfold"
              onClick={this.toggle}
              toggle
            />
            <div className="page-header-tools">
              <Button type="primary" icon="save" disabled={this.state.unchanged} onClick={this.handleSave}>
                {this.msg('save')}
              </Button>
            </div>
          </Header>
          <Content className="main-content layout-fixed-width layout-fixed-width-lg">
            <Row gutter={16}>
              <OverviewCard vendor={vendor} />
              <ResourcesCard vendor={vendor} />
            </Row>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
