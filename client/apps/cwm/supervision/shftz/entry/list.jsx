import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { Badge, Breadcrumb, Layout, Radio, Select, Tag, message } from 'antd';
import DataTable from 'client/components/DataTable';
import TrimSpan from 'client/components/trimSpan';
import SearchBar from 'client/components/SearchBar';
import RowAction from 'client/components/RowAction';
import connectNav from 'client/common/decorators/connect-nav';
import { loadEntryRegDatas } from 'common/reducers/cwmShFtz';
import { showDock } from 'common/reducers/cwmReceive';
import ModuleMenu from '../menu';
import ReceivingDockPanel from '../../../receiving/dock/receivingDockPanel';
import OrderDockPanel from '../../../../scof/orders/docks/orderDockPanel';
import DelegationDockPanel from '../../../../cms/common/dock/delegationDockPanel';
import ShipmentDockPanel from '../../../../transport/shipment/dock/shipmentDockPanel';
import PageHeader from 'client/components/PageHeader';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import { CWM_ASN_BONDED_REGTYPES } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const { Content, Sider } = Layout;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

@injectIntl
@connect(
  state => ({
    entryList: state.cwmShFtz.entryList,
    listFilter: state.cwmShFtz.listFilter,
    whses: state.cwmContext.whses,
    whse: state.cwmContext.defaultWhse,
    owners: state.cwmContext.whseAttrs.owners,
    loading: state.cwmShFtz.loading,
    userMembers: state.account.userMembers,
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
    if (['all', 'pending', 'processing', 'completed'].filter(stkey => stkey === status).length === 0) {
      status = 'all';
    }
    let ownerView = listFilter.ownerView;
    if (ownerView !== 'all' && this.props.owners.filter(owner => listFilter.ownerView === owner.customs_code).length === 0) {
      ownerView = 'all';
    }
    const filter = {
      ...listFilter, status, type: 'bonded', ownerView,
    };
    this.handleEntryListLoad(null, null, filter);
  }
  componentWillReceiveProps(nextprops) {
    if (nextprops.whse.code !== this.props.whse.code) {
      this.handleEntryListLoad(1, nextprops.whse.code, this.props.listFilter);
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: '进区凭单号/备案编号',
    width: 200,
    dataIndex: 'ftz_ent_no',
    fixed: 'left',
    render: (o, record) => o ? <span className="text-emphasis">{o}</span> : <span className="text-normal">{record.pre_ftz_ent_no}</span>,
  }, {
    title: '监管类型',
    width: 100,
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
        return (<Badge status="default" text="待进区" />);
      } else if (o === 1) {
        return (<Badge status="processing" text="已备案" />);
      } else if (o === 2) {
        return (<Badge status="success" text="已进区" />);
      }
    },
  }, {
    title: '报关单号',
    dataIndex: 'pre_entry_seq_no',
    width: 180,
    render: (preno, row) => row.cus_decl_no ? <span className="text-emphasis">{row.cus_decl_no}</span> : <span className="text-normal">{preno}</span>,
  }, {
    title: '货主',
    width: 180,
    dataIndex: 'owner_name',
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: '客户单号',
    dataIndex: 'po_no',
    width: 160,
  }, {
    title: '仓储企业',
    width: 180,
    dataIndex: 'wh_ent_name',
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: 'ASN编号',
    dataIndex: 'asn_no',
    width: 160,
    render: o => (<a onClick={() => this.handlePreview(o)}>{o}</a>),
  }, {
    title: '报关日期',
    width: 120,
    dataIndex: 'cus_decl_date',
    render: (o) => {
      if (o) {
        return `${moment(o).format('YYYY.MM.DD')}`;
      }
    },
  }, {
    title: '备案更新时间',
    width: 120,
    dataIndex: 'reg_date',
    render: (o) => {
      if (o) {
        return `${moment(o).format('MM.DD HH:mm')}`;
      }
    },
  }, {
    title: '进区更新时间',
    width: 120,
    dataIndex: 'ftz_ent_date',
    render: (o) => {
      if (o) {
        return `${moment(o).format('MM.DD HH:mm')}`;
      }
    },
  }, {
    title: '创建人员',
    dataIndex: 'created_by',
    width: 80,
    render: o => this.props.userMembers.find(member => member.login_id === o) && this.props.userMembers.find(member => member.login_id === o).name,
  }, {
    title: '创建时间',
    width: 120,
    dataIndex: 'created_date',
    render: (o) => {
      if (o) {
        return `${moment(o).format('MM.DD HH:mm')}`;
      }
    },
  }, {
    title: '操作',
    dataIndex: 'OPS_COL',
    width: 100,
    fixed: 'right',
    render: (o, record) => record.status === 0 ?
      <RowAction onClick={this.handleDetail} icon="form" label="详情" row={record} /> :
      <RowAction onClick={this.handleDetail} icon="eye-o" label="详情" row={record} />,
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
        pageSize: pagination.pageSize,
        currentPage: pagination.current,
        whseCode: this.props.whse.code,
      };
      const filter = { ...this.props.listFilter };
      params.filter = JSON.stringify(filter);
      return params;
    },
    remotes: this.props.entryList,
  })
  handleEntryListLoad = (currentPage, whsecode, filter) => {
    const { whse, listFilter, entryList: { pageSize, current } } = this.props;
    const newfilter = filter || listFilter;
    this.props.loadEntryRegDatas({
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
    const link = `/cwm/supervision/shftz/entry/${row.pre_entry_seq_no}`;
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
    const { entryList, listFilter, owners } = this.props;
    this.dataSource.remotes = entryList;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const toolbarActions = (<span>
      <SearchBar placeholder={this.msg('entrySearchPlaceholder')} onInputSearch={this.handleSearch} value={listFilter.filterNo} />
      <span />
      <Select showSearch optionFilterProp="children" style={{ width: 160 }} value={listFilter.ownerView}
        onChange={this.handleOwnerSelectChange} defaultValue="all" dropdownMatchSelectWidth={false} dropdownStyle={{ width: 360 }}
      >
        <Option value="all">全部货主</Option>
        {owners.map(data => (<Option key={data.customs_code} value={data.customs_code}
          search={`${data.partner_code}${data.name}`}
        >{data.name}
        </Option>))}
      </Select>
    </span>);
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
            <ModuleMenu currentKey="bondedEntry" />
          </div>
        </Sider>
        <Layout>
          <PageHeader>
            <PageHeader.Title>
              <Breadcrumb>
                <Breadcrumb.Item>
                  {this.msg('ftzBondedEntryReg')}
                </Breadcrumb.Item>
              </Breadcrumb>
            </PageHeader.Title>
            <PageHeader.Nav>
              <RadioGroup value={listFilter.status} onChange={this.handleStatusChange} >
                <RadioButton value="all">全部</RadioButton>
                <RadioButton value="pending">待进区</RadioButton>
                <RadioButton value="processing">已备案</RadioButton>
                <RadioButton value="completed">已进区</RadioButton>
              </RadioGroup>
            </PageHeader.Nav>
          </PageHeader>
          <Content className="page-content" key="main">
            <DataTable
              defaultExpandAllRows
              toolbarActions={toolbarActions}
              rowSelection={rowSelection}
              selectedRowKeys={this.state.selectedRowKeys}
              handleDeselectRows={this.handleDeselectRows}
              columns={this.columns}
              dataSource={this.dataSource}
              indentSize={0}
              rowKey="id"
              loading={this.props.loading}
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
