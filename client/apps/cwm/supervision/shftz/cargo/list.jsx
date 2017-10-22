import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Form, Icon, Popover, Layout, Radio, Select, message, Table } from 'antd';
import { loadProductCargo, loadParams, updateCargoRule, syncProdSKUS,
  fileCargos, confirmCargos, editGname } from 'common/reducers/cwmShFtz';
import { switchDefaultWhse, loadWhse } from 'common/reducers/cwmContext';
import DataTable from 'client/components/DataTable';
import SearchBar from 'client/components/SearchBar';
import PageHeader from 'client/components/PageHeader';
import ButtonToggle from 'client/components/ButtonToggle';
import TrimSpan from 'client/components/trimSpan';
import NavLink from 'client/components/NavLink';
import ExcelUploader from 'client/components/ExcelUploader';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import EditableCell from 'client/components/EditableCell';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const { Content, Sider } = Layout;
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
    loginId: state.account.loginId,
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
    submitting: state.cwmShFtz.submitting,
  }),
  { loadProductCargo,
    switchDefaultWhse,
    updateCargoRule,
    syncProdSKUS,
    fileCargos,
    confirmCargos,
    loadWhse,
    editGname }
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
    owners: this.props.owners.filter(owner => owner.portion_enabled),
    owner: this.props.owners.filter(owner => owner.portion_enabled).length === 0 ? {} : this.props.owners.filter(owner => owner.portion_enabled)[0],
    rule: null,
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.owners !== this.props.owners) {
      const owners = nextProps.owners.filter(owner => owner.portion_enabled);
      const owner = owners.length === 0 ? {} : owners[0];
      this.setState({ owners, owner });
      this.handleCargoLoad(1, this.props.listFilter, owner);
    }
    if (this.state.rule === null || nextProps.cargoRule !== this.props.cargoRule) {
      this.setState({ rule: nextProps.cargoRule.type });
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: this.msg('productNo'),
    width: 150,
    dataIndex: 'product_no',
  }, {
    title: this.msg('ftzCargoNo'),
    dataIndex: 'ftz_cargo_no',
    width: 160,
    render: (o, record) => {
      switch (record.status) {
        case 0:
          return <span className="text-warning">{o}<Icon type="exclamation-circle-o" /></span>;
        case 1:
          return <span className="text-info">{o}<Icon type="question-circle-o" /></span>;
        case 2:
          return <span className="text-success">{o}<Icon type="check-circle-o" /></span>;
        default:
          break;
      }
    },
  }, {
    title: this.msg('hscode'),
    width: 120,
    dataIndex: 'hscode',
  }, {
    title: this.msg('gname'),
    width: 180,
    dataIndex: 'name',
    render: (o, record) => <EditableCell value={o} onSave={value => this.handleGnameChange(value, record.id)} />,
  }, {
    title: this.msg('currency'),
    width: 140,
    dataIndex: 'currency',
    render: (o) => {
      const currency = this.props.currencies.filter(cur => cur.value === o)[0];
      const text = currency ? `${currency.value}| ${currency.text}` : o;
      return text;
    },
  }, {
    title: this.msg('country'),
    width: 140,
    dataIndex: 'country',
    render: (o) => {
      const country = this.props.tradeCountries.filter(cur => cur.value === o)[0];
      const text = country ? `${country.value}| ${country.text}` : o;
      return text;
    },
  }, {
    title: this.msg('opColumn'),
    dataIndex: 'OPS_COL',
    width: 160,
  }]
  dataSource = new DataTable.DataSource({
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
  handleGnameChange = (val, id) => {
    const change = { name: val };
    this.props.editGname({ change, id });
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
    message.info('当前仓库已切换');
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
    let owners = this.props.owners.filter(owner => owner.portion_enabled);
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
    this.props.updateCargoRule({ type: this.state.rule, id: this.props.cargoRule.id }).then(() => {
      this.handleCargoLoad(1, this.props.listFilter);
    });
  }
  handleCargoSend = () => {
    const tenantId = this.props.tenantId;
    const whse = this.props.whse;
    this.props.fileCargos(this.state.owner.customs_code, whse.code, whse.ftz_whse_code, tenantId).then((result) => {
      if (!result.error) {
        const filter = { ...this.props.listFilter, status: 'sent' };
        this.handleCargoLoad(1, filter);
      }
    });
  }
  handleCargoConfirm = () => {
    this.props.confirmCargos(this.state.owner.customs_code, this.props.whse.code, this.props.tenantId).then((result) => {
      if (!result.error) {
        const filter = { ...this.props.listFilter, status: 'completed' };
        this.handleCargoLoad(1, filter);
      }
    });
  }
  handleFiledCargoImport = () => {
    const filter = { ...this.props.listFilter, status: 'completed' };
    this.handleCargoLoad(1, filter);
  }
  render() {
    const { cargolist, listFilter, loading, whses, whse, tenantId, loginId, submitting } = this.props;
    const bondedWhses = whses.filter(wh => wh.bonded === 1);
    const { owners, owner, rule } = this.state;
    const filterOwners = owners.filter(item => item.portion_enabled);
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
      render: (o, record) => <span className="menu-sider-item"><TrimSpan text={record.customs_code ? `${record.customs_code} | ${record.name}` : record.name} maxLen={30} /></span>,
    }];
    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };
    const columns = [...this.columns];
    if (rule === 1) {
      columns.shift();
    }
    const toolbarActions = (<span>
      <SearchBar size="large" placeholder={this.msg('productSearchPlaceholder')} onInputSearch={this.handleSearch} value={listFilter.filterNo} />
    </span>);
    return (
      <Layout>
        <Sider width={320} className="menu-sider" key="sider" >
          <div className="page-header">
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
            <div className="list-body">
              <Table size="middle" columns={ownerColumns} dataSource={filterOwners} showHeader={false} onRowClick={this.handleRowClick}
                pagination={{ current: this.state.currentPage, defaultPageSize: 50, onChange: this.handlePageChange }}
                rowClassName={record => record.id === owner.id ? 'table-row-selected' : ''} rowKey="id"
              />
            </div>
          </div>
        </Sider>
        <Layout>
          <PageHeader>
            <PageHeader.Title>
              <Breadcrumb>
                <Breadcrumb.Item>
                  <Select size="large" value={whse.code} placeholder="选择仓库" style={{ width: 160 }} onChange={this.handleWhseChange}>
                    {bondedWhses.map(wh => <Option value={wh.code} key={wh.code}>{wh.name}</Option>)}
                  </Select>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                  {owner.name}
                </Breadcrumb.Item>
              </Breadcrumb>
            </PageHeader.Title>
            <PageHeader.Nav>
              <RadioGroup value={listFilter.status} onChange={this.handleStatusChange} size="large">
                <RadioButton value="all">全部</RadioButton>
                <RadioButton value="pending">待备案</RadioButton>
                <RadioButton value="sent">已发送</RadioButton>
                <RadioButton value="completed">备案料号规则库</RadioButton>
              </RadioGroup>
            </PageHeader.Nav>
            <PageHeader.Actions>
              {listFilter.status === 'pending' &&
              <Button size="large" icon="sync" loading={submitting} onClick={this.handleSyncProductSKUs} >
              同步SKU
            </Button>
            }
              {listFilter.status === 'pending' &&
              <Button type="primary" size="large" icon="cloud-upload-o" loading={submitting} onClick={this.handleCargoSend}>
                发送备案
              </Button>
              }
              {listFilter.status === 'sent' &&
              <Button type="primary" ghost size="large" icon="check" loading={submitting} onClick={this.handleCargoConfirm}>
                确认备案
              </Button>
              }
              <Popover content={<a href={`${XLSX_CDN}/分拨货物备案料号模板.xlsx`}><Icon type="file-excel" />下载导入模板</a>}>
                <ExcelUploader endpoint={`${API_ROOTS.default}v1/cwm/shftz/cargo/filed/import`}
                  formData={{
                    data: JSON.stringify({
                      tenantId,
                      loginId,
                      whseCode: whse.code,
                      ownerCusCode: owner.customs_code,
                      ruleType: rule,
                    }),
                  }} onUploaded={this.handleFiledCargoImport}
                >
                  <Button size="large"><Icon type="upload" /> 导入备案料号</Button>
                </ExcelUploader>
              </Popover>
              <ButtonToggle size="large" iconOn="tool" iconOff="tool" onClick={this.toggleRightSider} />
            </PageHeader.Actions>
          </PageHeader>
          <Content className="page-content" key="main">
            <DataTable columns={columns} dataSource={this.dataSource} rowSelection={rowSelection} rowKey="id"
              toolbarActions={toolbarActions} scroll={{ x: 1400 }} loading={loading}
            />
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
                <Button type="primary" icon="save" loading={submitting} onClick={this.handleRuleSave}>保存</Button>
              </FormItem>
            </Form>
          </div>
        </Sider>
      </Layout>
    );
  }
}
