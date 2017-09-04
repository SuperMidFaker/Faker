import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { Badge, Breadcrumb, Layout, Radio, Select, Icon, Tag, message, Button, Popconfirm } from 'antd';
import DataTable from 'client/components/DataTable';
import TrimSpan from 'client/components/trimSpan';
import SearchBar from 'client/components/SearchBar';
import RowUpdater from 'client/components/rowUpdater';
import connectNav from 'client/common/decorators/connect-nav';
import { loadEntryRegDatas, showTransferInModal, deleteVirtualTransfer } from 'common/reducers/cwmShFtz';
import { showDock } from 'common/reducers/cwmReceive';
import ModuleMenu from '../../menu';
import ReceivingDockPanel from '../../../../receiving/dock/receivingDockPanel';
import OrderDockPanel from '../../../../../scof/orders/docks/orderDockPanel';
import DelegationDockPanel from '../../../../../cms/common/dock/delegationDockPanel';
import ShipmentDockPanel from '../../../../../transport/shipment/dock/shipmentDockPanel';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import { CWM_ASN_BONDED_REGTYPES } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
import TransferInModal from './modal/transferInModal';

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
  { loadEntryRegDatas, switchDefaultWhse, showDock, showTransferInModal, deleteVirtualTransfer }
)
@connectNav({
  depth: 2,
  moduleName: 'cwm',
})
export default class SHFTZTransferInList extends React.Component {
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
    if (['all', 'pending', 'received', 'verified'].filter(stkey => stkey === status).length === 0) {
      status = 'all';
    }
    let ownerView = listFilter.ownerView;
    if (ownerView !== 'all' && this.props.owners.filter(owner => listFilter.ownerView === owner.customs_code).length === 0) {
      ownerView = 'all';
    }
    const filter = { ...listFilter, status, transType: 'transfer', ownerView };
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
    title: '海关进库单号',
    width: 200,
    dataIndex: 'ftz_ent_no',
  }, {
    title: '监管类型',
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
        return (<Badge status="default" text="未接收" />);
      } else if (o === 1) {
        return (<Badge status="processing" text="已接收" />);
      } else if (o === 2) {
        return (<Badge status="success" text="已核对" />);
      }
    },
  }, {
    title: '收货单位(货主)',
    width: 180,
    dataIndex: 'owner_name',
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: '发货单位',
    width: 180,
    dataIndex: 'sender_name',
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: '收货仓库',
    width: 180,
    dataIndex: 'wh_ent_name',
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: '发货仓库',
    width: 180,
    dataIndex: 'send_wh_ent_name',
    render: o => <TrimSpan text={o} maxLen={14} />,
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
    render: (o, record) => {
      if (record.virtual_transfer) {
        return (
          <span>
            <RowUpdater onHit={this.handleDetail} label="转入明细" row={record} />
            <span className="ant-divider" />
            <Popconfirm title="确认删除" onConfirm={() => this.handleVTransDel(record.asn_no)}>
              <a> <Icon type="delete" /></a>
            </Popconfirm>
          </span>
        );
      } else {
        return <RowUpdater onHit={this.handleDetail} label="转入明细" row={record} />;
      }
    },
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
      const filter = { ...this.props.listFilter, transType: 'transfer' };
      params.filter = JSON.stringify(filter);
      return params;
    },
    remotes: this.props.entryList,
  })
  handleEntryListLoad = (currentPage, whsecode, filter) => {
    const { tenantId, whse, listFilter, entryList: { pageSize, current } } = this.props;
    let newfilter = filter || listFilter;
    newfilter = { ...newfilter, transType: 'transfer' };
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
  handleVTransDel = (asnNo) => {
    this.props.deleteVirtualTransfer({ asnNo }).then((result) => {
      if (!result.error) {
        this.handleEntryListLoad();
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
  handleCreateBtnClick = () => {
    this.context.router.push('/cwm/ftz/receive/reg');
  }
  handleDetail = (row) => {
    const link = `/cwm/supervision/shftz/transfer/in/${row.asn_no}`;
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
  handleCreateTransIn = () => {
    const { listFilter, owners } = this.props;
    const ownerCusCode = listFilter.ownerView !== 'all' ? listFilter.ownerView : (owners[0] && owners[0].customs_code);
    this.props.showTransferInModal({ visible: true, ownerCusCode });
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
          {owners.map(data => (<Option key={data.customs_code} value={data.customs_code} search={`${data.partner_code}${data.name}`}>{data.name}</Option>)
            )}
        </OptGroup>
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
            <ModuleMenu currentKey="transferin" />
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
                {this.msg('ftzTransferIn')}
              </Breadcrumb.Item>
            </Breadcrumb>
            <RadioGroup value={listFilter.status} onChange={this.handleStatusChange} size="large">
              <RadioButton value="all">全部状态</RadioButton>
              <RadioButton value="pending">未接收</RadioButton>
              <RadioButton value="received">已接收</RadioButton>
              <RadioButton value="verified">已核对</RadioButton>
            </RadioGroup>
            <div className="page-header-tools">
              <Button size="large" icon="plus" onClick={this.handleCreateTransIn}>转移入分拨</Button>
            </div>
          </Header>
          <Content className="main-content" key="main">
            <DataTable
              columns={this.columns}
              rowSelection={rowSelection}
              dataSource={this.dataSource}
              indentSize={8}
              rowKey="id"
              defaultExpandedRowKeys={['1']}
              toolbarActions={toolbarActions}
              selectedRowKeys={this.state.selectedRowKeys}
              handleDeselectRows={this.handleDeselectRows}
            />
            <ReceivingDockPanel />
            <OrderDockPanel />
            <DelegationDockPanel />
            <ShipmentDockPanel />
            <TransferInModal reload={this.handleEntryListLoad} />
          </Content>
        </Layout>
      </Layout>
    );
  }
}
