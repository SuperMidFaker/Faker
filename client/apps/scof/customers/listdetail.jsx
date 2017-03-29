import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Card, Form, Input, Row, Col, Tabs, Table, Tooltip, Layout, Popconfirm } from 'antd';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import InfoItem from 'client/components/InfoItem';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import ProfileForm from './forms/profileForm';
import FlowRulesPane from './flowRulesPane';
import CustomerModal from './modals/customerModal';
import { loadCustomers, showCustomerModal, deleteCustomer } from 'common/reducers/crmCustomers';
import { PARTNER_ROLES } from 'common/constants';

const formatMsg = format(messages);
const { Header, Content, Sider } = Layout;
const Search = Input.Search;
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;

function fetchData({ state, dispatch }) {
  return dispatch(loadCustomers({
    tenantId: state.account.tenantId,
  }));
}
@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    customers: state.crmCustomers.customers,
    loaded: state.crmCustomers.loaded,
  }),
  { loadCustomers, deleteCustomer, showCustomerModal }
)
@connectNav({
  depth: 2,
  moduleName: 'scof',
})
@Form.create()
export default class CustomerList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    loaded: PropTypes.bool.isRequired,
    tenantId: PropTypes.number.isRequired,
    customers: PropTypes.array.isRequired,
    loadCustomers: PropTypes.func.isRequired,
    deleteCustomer: PropTypes.func.isRequired,
    showCustomerModal: PropTypes.func.isRequired,
  }
  state = {
    customerModalVisible: false,
    customer: {},
    currentPage: 1,
    collapsed: false,
    unchanged: true,
    customers: [],
  }
  componentWillReceiveProps(nextProps) {
    if (this.state.customer.id) {
      this.setState({
        customer: nextProps.customers.find(item => item.id === this.state.customer.id) || nextProps.customers[0],
        customers: nextProps.customers,
      });
    } else {
      this.setState({ customer: nextProps.customers[0] || {}, customers: nextProps.customers });
    }
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
      customer: record,
      unchanged: true,
    });
  }
  handleTableLoad = () => {
    this.props.loadCustomers({
      tenantId: this.props.tenantId,
    });
  }
  handleDelCustomer = () => {
    this.props.deleteCustomer(this.state.customer.id, PARTNER_ROLES.CUS).then(() => {
      this.handleTableLoad();
    });
  }
  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  }
  handleSearch = (value) => {
    const customers = this.props.customers.filter((item) => {
      if (value) {
        const reg = new RegExp(value);
        return reg.test(item.name);
      } else {
        return true;
      }
    });
    this.setState({ customers, currentPage: 1 });
  }
  render() {
    const { customer } = this.state;
    const { form: { getFieldDecorator } } = this.props;
    const columns = [{
      dataIndex: 'name',
      key: 'name',
      render: o => (<span>{o}</span>),
    }];
    return (
      <Layout>
        <Sider width={320} className="menu-sider" key="sider" trigger={null}
          collapsible
          collapsed={this.state.collapsed}
          collapsedWidth={0}
        >
          <div className="left-sider-panel">
            <div className="top-bar">
              <Breadcrumb>
                <Breadcrumb.Item>
                  {this.msg('customer')}
                </Breadcrumb.Item>
              </Breadcrumb>
              <div className="pull-right">
                <Tooltip placement="bottom" title="新增客户">
                  <Button type="primary" shape="circle" icon="plus" onClick={() => this.props.showCustomerModal('add')} />
                </Tooltip>
              </div>
            </div>
            <div className="left-sider-panel">
              <div className="toolbar">
                <Search
                  placeholder={this.msg('searchPlaceholder')}
                  onSearch={this.handleSearch} size="large"
                />
              </div>
              <Table size="middle" dataSource={this.state.customers} columns={columns} showHeader={false} onRowClick={this.handleRowClick}
                pagination={{ current: this.state.currentPage, defaultPageSize: 15, onChange: this.handlePageChange }}
                rowClassName={record => record.id === customer.id ? 'table-row-selected' : ''} rowKey="id"
              />
              <CustomerModal onOk={this.handleTableLoad} />
            </div>
          </div>
        </Sider>
        <Layout>
          <Header className="top-bar">
            { this.state.collapsed && <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('customer')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {customer.name}
              </Breadcrumb.Item>
            </Breadcrumb>}
            <Button size="large"
              className={this.state.collapsed ? '' : 'btn-toggle-on'}
              icon={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
              onClick={this.toggle}
            />
            <div className="top-bar-tools">
              <Button.Group size="large">
                <Button icon="left" />
                <Button icon="right" />
              </Button.Group>
              <Button size="large" type="primary" icon="save" disabled={this.state.unchanged} onClick={this.handleSaveBtnClick}>
                {this.msg('save')}
              </Button>
            </div>
          </Header>
          <Content className="main-content layout-fixed-width layout-fixed-width-large">
            <Row gutter={16}>
              <Col sm={24} md={16}>
                <Card>
                  <Row gutter={16}>
                    <Col sm={24} lg={24}>
                      <InfoItem
                        label={this.msg('customerName')}
                        field={customer.name}
                      />
                    </Col>
                    <Col sm={24} lg={12}>
                      <FormItem label={this.msg('displayName')} >
                        {getFieldDecorator('display_name', {
                          initialValue: customer.display_name,
                        })(<Input onChange={this.handleInputChanged} />)}
                      </FormItem>
                    </Col>
                    <Col sm={24} lg={12}>
                      <FormItem label={this.msg('englishName')} >
                        {getFieldDecorator('en_name', {
                          initialValue: customer.en_name,
                        })(<Input onChange={this.handleInputChanged} />)}
                      </FormItem>
                    </Col>
                  </Row>
                </Card>
                <Card bodyStyle={{ padding: 0 }}>
                  <Tabs defaultActiveKey="flowRules">
                    <TabPane tab={<span><i className="icon icon-fontello-flow-tree" />流程规则</span>} key="flowRules" >
                      <FlowRulesPane customer={customer} />
                    </TabPane>
                    <TabPane tab={<span><i className="icon icon-fontello-book" />价格协议</span>} key="tariff" />
                    <TabPane tab={<span><i className="icon icon-fontello-doc-text" />收发货信息</span>} key="consignInfo" />
                  </Tabs>
                </Card>
              </Col>
              <Col sm={24} md={8}>
                <ProfileForm customer={customer} />
              </Col>
            </Row>
            <Row type="flex" className="bottom-bar">
              <Col className="col-flex-primary" />
              <Col className="col-flex-secondary">
                <Popconfirm title={this.msg('deleteConfirm')} onConfirm={() => this.handleDelCustomer()}>
                  <Button type="danger" size="large" icon="delete" ghost>删除</Button>
                </Popconfirm>
              </Col>
            </Row>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
