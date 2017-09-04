import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { Badge, Breadcrumb, Layout, Radio, Select, Tag, message } from 'antd';
import DataTable from 'client/components/DataTable';
import TrimSpan from 'client/components/trimSpan';
import SearchBar from 'client/components/SearchBar';
import RowUpdater from 'client/components/rowUpdater';
import connectNav from 'client/common/decorators/connect-nav';
import { loadEntryRegDatas } from 'common/reducers/cwmShFtz';
import { showDock } from 'common/reducers/cwmReceive';
import ModuleMenu from '../menu';
import ReceivingDockPanel from '../../../receiving/dock/receivingDockPanel';
import OrderDockPanel from '../../../../scof/orders/docks/orderDockPanel';
import DelegationDockPanel from '../../../../cms/common/dock/delegationDockPanel';
import ShipmentDockPanel from '../../../../transport/shipment/dock/shipmentDockPanel';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import { CWM_ASN_BONDED_REGTYPES } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const { Header, Content, Sider } = Layout;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const OptGroup = Select.OptGroup;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    entryList: state.cwmShFtz.entryList,
    listFilter: state.cwmShFtz.listFilter,
    whses: state.cwmContext.whses,
    whse: state.cwmContext.defaultWhse,
    owners: state.cwmContext.whseAttrs.owners,
  }),
  { loadEntryRegDatas, switchDefaultWhse, showDock }
)
@connectNav({
  depth: 2,
  moduleName: 'cwm',
})
export default class SHFTZEntryList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    entryList: PropTypes.object.isRequired,
    listFilter: PropTypes.object.isRequired,
    whses: PropTypes.arrayOf(PropTypes.shape({ code: PropTypes.string, name: PropTypes.string })),
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    searchInput: '',
  }
  componentDidMount() {
    const listFilter = this.props.listFilter;
    let status = listFilter.status;
    if (['all', 'pending', 'sent', 'completed'].filter(stkey => stkey === status).length === 0) {
      status = 'all';
    }
    let type = listFilter.type;
    if (['all', 'bonded', 'export'].filter(stkey => stkey === type).length === 0) {
      type = 'all';
    }
    let ownerView = listFilter.ownerView;
    if (ownerView !== 'all' && this.props.owners.filter(owner => listFilter.ownerView === owner.customs_code).length === 0) {
      ownerView = 'all';
    }
    const filter = { ...listFilter, status, type, ownerView };
    this.handleEntryListLoad(null, null, filter);
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: 'ASN编号',
    dataIndex: 'asn_no',
    width: 180,
    fixed: 'left',
    render: o => (<a onClick={() => this.handlePreview(o)}>{o}</a>),
  }, {
    title: '报关单号',
    dataIndex: 'pre_entry_seq_no',
    width: 180,
    render: (preno, row) => row.cus_decl_no || preno,
  }, {
    title: '海关进库单号',
    width: 200,
    dataIndex: 'ftz_ent_no',
  }, {
    title: '监管类型',
    width: 80,
    dataIndex: 'ftz_ent_type',
    render: (enttype) => {
      const entType = CWM_ASN_BONDED_REGTYPES.filter(regtype => regtype.value === enttype)[0];
      return entType && <Tag color={entType.tagcolor}>{entType.ftztext}</Tag>;
    },
  }, {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    render: (o) => {
      if (o === 0) {
        return (<Badge status="default" text="待备案" />);
      } else if (o === 1) {
        return (<Badge status="processing" text="已发送" />);
      } else if (o === 2) {
        return (<Badge status="success" text="备案完成" />);
      }
    },
  }, {
    title: '货主',
    width: 180,
    dataIndex: 'owner_name',
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: '仓储企业',
    width: 180,
    dataIndex: 'wh_ent_name',
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: '进口日期',
    width: 120,
    dataIndex: 'ie_date',
    render: (o) => {
      if (o) {
        return `${moment(o).format('YYYY.MM.DD')}`;
      }
    },
  }, {
    title: '进库日期',
    width: 120,
    dataIndex: 'ftz_ent_date',
    render: (o) => {
      if (o) {
        return `${moment(o).format('YYYY.MM.DD')}`;
      }
    },
  }, {
    title: '操作',
    dataIndex: 'OPS_COL',
    width: 100,
    fixed: 'right',
    render: (o, record) => <RowUpdater onHit={this.handleDetail} label="进库明细" row={record} />,
  }]
  handlePreview = (asnNo) => {
    this.props.showDock(asnNo);
  }
  dataSource = new DataTable.DataSource({
    fetcher: params => this.props.loadEntryRegDatas(params),
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
        currentPage: pagination.current,
        whseCode: this.props.whse.code,
      };
      const filter = { ...this.props.listFilter, transType: '' };
      params.filter = JSON.stringify(filter);
      return params;
    },
    remotes: this.props.entryList,
  })
  handleEntryListLoad = (currentPage, whsecode, filter) => {
    const { tenantId, whse, listFilter, entryList: { pageSize, current } } = this.props;
    let newfilter = filter || listFilter;
    newfilter = { ...newfilter, transType: '' };
    this.props.loadEntryRegDatas({
      tenantId,
      filter: JSON.stringify(newfilter),
      pageSize,
      currentPage: currentPage || current,
      whseCode: whsecode || whse.code,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
  }
  handleStatusChange = (ev) => {
    if (ev.target.value === this.props.listFilter.status) {
      return;
    }
    const filter = { ...this.props.listFilter, status: ev.target.value };
    this.handleEntryListLoad(1, this.props.whse.code, filter);
  }
  handleTypeChange = (ev) => {
    if (ev.target.value === this.props.listFilter.type) {
      return;
    }
    const filter = { ...this.props.listFilter, type: ev.target.value };
    this.handleEntryListLoad(1, this.props.whse.code, filter);
  }
  handleCreateBtnClick = () => {
    this.context.router.push('/cwm/ftz/receive/reg');
  }
  handleDetail = (row) => {
    const link = `/cwm/supervision/shftz/entry/${row.asn_no}`;
    this.context.router.push(link);
  }
  handleWhseChange = (value) => {
    this.props.switchDefaultWhse(value);
    message.info('当前仓库已切换');
    this.handleEntryListLoad(1, value);
  }
  handleSearch = (searchVal) => {
    const filters = { ...this.props.listFilter, filterNo: searchVal };
    this.handleEntryListLoad(1, this.props.whse.code, filters);
  }
  handleOwnerSelectChange = (value) => {
    const filters = { ...this.props.listFilter, ownerView: value };
    this.handleEntryListLoad(1, this.props.whse.code, filters);
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  render() {
    const { entryList, listFilter, whses, whse, owners } = this.props;
    const bondedWhses = whses.filter(wh => wh.bonded === 1);
    this.dataSource.remotes = entryList;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const toolbarActions = (<span>
      <SearchBar placeholder={this.msg('entrySearchPlaceholder')} size="large" onInputSearch={this.handleSearch} value={listFilter.filterNo} />
      <span />
      <Select showSearch optionFilterProp="children" size="large" style={{ width: 160 }} value={listFilter.ownerView}
        onChange={this.handleOwnerSelectChange} defaultValue="all" dropdownMatchSelectWidth={false} dropdownStyle={{ width: 360 }}
      >
        <OptGroup>
          <Option value="all">全部货主</Option>
          {owners.map(data => (<Option key={data.customs_code} value={data.customs_code}
            search={`${data.partner_code}${data.name}`}
          >{data.name}
          </Option>)
          )}
        </OptGroup>
      </Select></span>);
    return (
      <Layout>
        <Sider width={200} className="menu-sider" key="sider">
          <div className="page-header">
            <Breadcrumb>
              <Breadcrumb.Item>
                  上海自贸区监管
                </Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div className="left-sider-panel">
            <ModuleMenu currentKey="entry" />
          </div>
        </Sider>
        <Layout>
          <Header className="page-header">
            <Breadcrumb>
              <Breadcrumb.Item>
                <Select size="large" value={whse.code} placeholder="选择仓库" style={{ width: 160 }} onChange={this.handleWhseChange}>
                  {bondedWhses.map(wh => <Option value={wh.code} key={wh.code}>{wh.name}</Option>)}
                </Select>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.msg('ftzEntryReg')}
              </Breadcrumb.Item>
            </Breadcrumb>
            <RadioGroup value={listFilter.status} onChange={this.handleStatusChange} size="large">
              <RadioButton value="all">全部状态</RadioButton>
              <RadioButton value="pending">待备案</RadioButton>
              <RadioButton value="sent">已发送</RadioButton>
              <RadioButton value="completed">备案完成</RadioButton>
            </RadioGroup>
            <span />
            <RadioGroup value={listFilter.type} onChange={this.handleTypeChange} size="large">
              <RadioButton value="all">全部类型</RadioButton>
              <RadioButton value="bonded">{CWM_ASN_BONDED_REGTYPES[0].ftztext}</RadioButton>
              <RadioButton value="export" disabled>{CWM_ASN_BONDED_REGTYPES[1].ftztext}</RadioButton>
            </RadioGroup>
            <div className="page-header-tools" />
          </Header>
          <Content className="main-content" key="main">
            <DataTable
              toolbarActions={toolbarActions}
              rowSelection={rowSelection}
              selectedRowKeys={this.state.selectedRowKeys}
              handleDeselectRows={this.handleDeselectRows}
              columns={this.columns}
              dataSource={this.dataSource}
              indentSize={8}
              rowKey="id"
              defaultExpandedRowKeys={['1']}
            />
            <ReceivingDockPanel />
            <OrderDockPanel />
            <DelegationDockPanel />
            <ShipmentDockPanel />
          </Content>
        </Layout>
      </Layout>
    );
  }
}
