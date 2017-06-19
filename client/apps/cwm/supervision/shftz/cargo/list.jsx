import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Form, Icon, Layout, Radio, Select, message, Table, Tag } from 'antd';
import { loadProductCargo, loadParams, updateCargoRule, syncProdSKUS } from 'common/reducers/cwmShFtz';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import RemoteTable from 'client/components/remoteAntTable';
import SearchBar from 'client/components/search-bar';
import ButtonToggle from 'client/components/ButtonToggle';
import NavLink from 'client/components/nav-link';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const { Header, Content, Sider } = Layout;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const FormItem = Form.Item;

function fetchData({ dispatch }) {
  return dispatch(loadParams());
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loading: state.cwmShFtz.loading,
    cargolist: state.cwmShFtz.cargolist,
    cargoRule: state.cwmShFtz.cargoRule,
    listFilter: state.cwmShFtz.listFilter,
    whses: state.cwmContext.whses,
    whse: state.cwmContext.defaultWhse,
    owners: state.cwmContext.whseAttrs.owners,
    units: state.cwmShFtz.params.units.map(un => ({
      value: un.unit_code,
      text: un.unit_name,
    })),
    currencies: state.cwmShFtz.params.currencies.map(cr => ({
      value: cr.curr_code,
      text: cr.curr_name,
    })),
    tradeCountries: state.cwmShFtz.params.tradeCountries.map(tc => ({
      value: tc.cntry_co,
      text: tc.cntry_name_cn,
    })),
  }),
  { loadProductCargo, switchDefaultWhse, updateCargoRule, syncProdSKUS }
)
@connectNav({
  depth: 2,
  moduleName: 'cwm',
})
export default class SHFTZCargoList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    whses: PropTypes.arrayOf(PropTypes.shape({ code: PropTypes.string, name: PropTypes.string })),
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    collapsed: false,
    rightSiderCollapsed: true,
    selectedRowKeys: [],
    currentPage: 1,
    owners: this.props.owners,
    owner: this.props.owners.length === 0 ? {} : this.props.owners[0],
    rule: null,
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.owners !== this.props.owners) {
      this.setState({
        owners: nextProps.owners,
        owner: nextProps.owners.length === 0 ? {} : nextProps.owners[0],
      });
      this.handleCargoLoad(1, this.props.listFilter, nextProps.owners[0]);
    }
    if (nextProps.cargoRule !== this.props.cargoRule) {
      this.setState({ rule: nextProps.cargoRule.type });
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: this.msg('productNo'),
    width: 120,
    dataIndex: 'product_no',
  }, {
    title: this.msg('productSku'),
    dataIndex: 'product_sku',
    width: 100,
  }, {
    title: this.msg('ftzCargoNo'),
    dataIndex: 'ftz_cargo_no',
    width: 160,
  }, {
    title: this.msg('hscode'),
    width: 120,
    dataIndex: 'hscode',
  }, {
    title: this.msg('gname'),
    width: 120,
    dataIndex: 'name',
  }, {
    title: this.msg('unit'),
    width: 200,
    dataIndex: 'unit',
    render: (o) => {
      const unit = this.props.units.filter(cur => cur.value === o)[0];
      const text = unit ? `${unit.value}| ${unit.text}` : o;
      return text;
    },
  }, {
    title: this.msg('country'),
    width: 100,
    dataIndex: 'country',
    render: (o) => {
      const country = this.props.tradeCountries.filter(cur => cur.value === o)[0];
      const text = country ? `${country.value}| ${country.text}` : o;
      return text;
    },
  }, {
    title: this.msg('currency'),
    width: 100,
    dataIndex: 'currency',
    render: (o) => {
      const currency = this.props.currencies.filter(cur => cur.value === o)[0];
      const text = currency ? `${currency.value}| ${currency.text}` : o;
      return text;
    },
  }, {
    title: this.msg('cargoType'),
    width: 100,
    dataIndex: 'cargo_type',
    render: (o) => {
      if (o === '13') {
        return (<Tag color="yellow">非分拨货物</Tag>);
      } else if (o === '14') {
        return (<Tag color="green">分拨货物</Tag>);
      }
    },
  }, {
    title: this.msg('opColumn'),
    width: 160,
  }]
  dataSource = new RemoteTable.DataSource({
    fetcher: params => this.props.loadProductCargo(params),
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
        whseCode: this.props.whse.code,
        owner: JSON.stringify(this.state.owner),
        pageSize: pagination.pageSize,
        currentPage: pagination.current,
        filter: JSON.stringify(this.props.listFilter),
      };
      return params;
    },
    remotes: this.props.cargolist,
  })
  toggleRightSider = () => {
    this.setState({
      rightSiderCollapsed: !this.state.rightSiderCollapsed,
    });
  }
  handleCargoLoad = (currentPage, filter, owner) => {
    const { tenantId, whse, listFilter, cargolist: { pageSize, current } } = this.props;
    this.props.loadProductCargo({
      tenantId,
      whseCode: whse.code,
      owner: JSON.stringify(owner || this.state.owner),
      filter: JSON.stringify(filter || listFilter),
      pageSize,
      currentPage: currentPage || current,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
  }
  handleSearch = (value) => {
    const filter = { ...this.props.listFilter, filterNo: value };
    this.handleCargoLoad(1, filter);
  }
  handleStatusChange = (ev) => {
    if (ev.target.value === this.props.listFilter.status) {
      return;
    }
    const filter = { ...this.props.listFilter, status: ev.target.value };
    this.handleCargoLoad(1, filter);
  }
  handleWhseChange = (value) => {
    this.props.switchDefaultWhse(value);
  }
  handleRowClick = (record) => {
    this.setState({ owner: record });
    this.handleCargoLoad(1, this.props.listFilter, record);
  }
  handleSyncProductSKUs = () => {
    const { tenantId, whse } = this.props;
    this.props.syncProdSKUS({ tenantId, owner: this.state.owner, whseCode: whse.code }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.handleCargoLoad();
      }
    });
  }
  handleOwnerSearch = (value) => {
    let owners = this.props.owners;
    if (value) {
      owners = this.props.owners.filter((item) => {
        const reg = new RegExp(value);
        return reg.test(item.name + item.customs_code);
      });
    }
    this.setState({ owners, currentPage: 1 });
  }
  handleRuleChange = (e) => {
    this.setState({ rule: e.target.value });
  }
  handleRuleSave = () => {
    this.props.updateCargoRule({ type: this.state.rule, id: this.props.cargoRule.id });
  }
  render() {
    const { cargolist, listFilter, loading, whses, whse } = this.props;
    const { owners, owner, rule } = this.state;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    this.dataSource.remotes = cargolist;
    const ownerColumns = [{
      dataIndex: 'name',
      key: 'code',
      render: (o, record) => <span className="menu-sider-item">{record.customs_code ? `${record.customs_code} | ${record.name}` : record.name}</span>,
    }];
    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };
    return (
      <Layout>
        <Sider width={320} className="menu-sider" key="sider" >
          <div className="left-sider-panel">
            <div className="top-bar">
              <Breadcrumb>
                <Breadcrumb.Item>
                  <NavLink to="/cwm/supervision/shftz">
                    <Icon type="left" /> 上海自贸区监管
                  </NavLink>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                  {this.msg('ftzCargoReg')}
                </Breadcrumb.Item>
              </Breadcrumb>
            </div>
            <div className="left-sider-panel">
              <div className="toolbar">
                <SearchBar size="large" placeholder={this.msg('ownerSearchPlaceholder')} onInputSearch={this.handleOwnerSearch} />
              </div>
              <Table columns={ownerColumns} dataSource={owners} showHeader={false} onRowClick={this.handleRowClick}
                pagination={{ current: this.state.currentPage, defaultPageSize: 15, onChange: this.handlePageChange }}
                rowClassName={record => record.id === owner.id ? 'table-row-selected' : ''} rowKey="id"
              />
            </div>
          </div>
        </Sider>
        <Layout>
          <Header className="top-bar">
            <Breadcrumb>
              <Breadcrumb.Item>
                <Select size="large" value={whse.code} placeholder="选择仓库" style={{ width: 160 }} onChange={this.handleWhseChange}>
                  {whses.map(wh => <Option value={wh.code} key={wh.code}>{wh.name}</Option>)}
                </Select>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                货主
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {owner.name}
              </Breadcrumb.Item>
            </Breadcrumb>
            <RadioGroup value={listFilter.status} onChange={this.handleStatusChange} size="large">
              <RadioButton value="pending">待备案</RadioButton>
              <RadioButton value="sent">已发送</RadioButton>
              <RadioButton value="completed">备案完成</RadioButton>
            </RadioGroup>
            <div className="top-bar-tools">
              <Button type="primary" ghost size="large" icon="sync" onClick={this.handleSyncProductSKUs}>
                同步货品SKU
              </Button>
              <ButtonToggle size="large"
                iconOn="fork" iconOff="fork"
                onClick={this.toggleRightSider}
              >
                映射规则
              </ButtonToggle>
            </div>
          </Header>
          <Content className="main-content" key="main">
            <div className="page-body">
              <div className="toolbar">
                <SearchBar size="large" placeholder={this.msg('productSearchPlaceholder')} onInputSearch={this.handleSearch} />
              </div>
              <div className="panel-body table-panel">
                <RemoteTable columns={this.columns} dataSource={this.dataSource} rowSelection={rowSelection} rowKey="id"
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
          width={320}
          collapsedWidth={0}
          className="right-sider"
        >
          <div className="right-sider-panel">
            <div className="panel-header">
              <h3>映射规则</h3>
            </div>
            <Form layout="vertical" style={{ padding: 16 }}>
              <FormItem>
                <RadioGroup value={rule} onChange={this.handleRuleChange}>
                  <Radio style={radioStyle} value={0}>按商品货号一一对应</Radio>
                  <Radio style={radioStyle} value={1}>按商品编码+中文品名匹配</Radio>
                </RadioGroup>
              </FormItem>
              <FormItem>
                <Button type="primary" icon="save" onClick={this.handleRuleSave}>保存</Button>
              </FormItem>
            </Form>
          </div>
        </Sider>
      </Layout>
    );
  }
}
