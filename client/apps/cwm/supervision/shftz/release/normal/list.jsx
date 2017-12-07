import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { Badge, Breadcrumb, Button, Layout, Radio, Select, Tag, message } from 'antd';
import DataTable from 'client/components/DataTable';
import TrimSpan from 'client/components/trimSpan';
import SearchBar from 'client/components/SearchBar';
import RowUpdater from 'client/components/rowUpdater';
import connectNav from 'client/common/decorators/connect-nav';
import ShippingDockPanel from '../../../../shipping/dock/shippingDockPanel';
import OrderDockPanel from '../../../../../scof/orders/docks/orderDockPanel';
import DelegationDockPanel from '../../../../../cms/common/dock/delegationDockPanel';
import ShipmentDockPanel from '../../../../../transport/shipment/dock/shipmentDockPanel';
import PageHeader from 'client/components/PageHeader';
import ModuleMenu from '../../menu';
import { showDock } from 'common/reducers/cwmShippingOrder';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
import NormalRelRegModal from './modal/normalRelRegModal';
import { openNormalRelRegModal, loadReleaseRegDatas } from 'common/reducers/cwmShFtz';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import { CWM_SO_BONDED_REGTYPES } from 'common/constants';

const formatMsg = format(messages);
const { Content, Sider } = Layout;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

@injectIntl
@connect(
  state => ({
    releaseList: state.cwmShFtz.releaseList,
    listFilter: state.cwmShFtz.listFilter,
    whses: state.cwmContext.whses,
    whse: state.cwmContext.defaultWhse,
    owners: state.cwmContext.whseAttrs.owners,
    loading: state.cwmShFtz.loading,
    userMembers: state.account.userMembers,
  }),
  { openNormalRelRegModal, loadReleaseRegDatas, switchDefaultWhse, showDock }
)
@connectNav({
  depth: 2,
  moduleName: 'cwm',
})
export default class SHFTZNormalRelRegList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    releaseList: PropTypes.object.isRequired,
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
    const filter = { ...listFilter, status, type: 'normal', ownerView };
    this.handleReleaseListLoad(null, null, filter);
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: '出区提货单号/备案编号',
    dataIndex: 'ftz_rel_no',
    width: 200,
    fixed: 'left',
    render: (o, record) => o ? <span className="text-emphasis">{o}</span> : <span className="text-normal">{record.pre_entry_seq_no}</span>,
  }, {
    title: '监管类型',
    dataIndex: 'ftz_rel_type',
    width: 100,
    render: (reltype) => {
      const regtype = CWM_SO_BONDED_REGTYPES.filter(sbr => sbr.value === reltype)[0];
      if (regtype) {
        return (<Tag color={regtype.tagcolor}>{regtype.ftztext}</Tag>);
      }
    },
  }, {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    render: (o) => {
      switch (o) {
        case 0:
          return (<Badge status="default" text="待备案" />);
        case 1:
          return (<Badge status="processing" text="已发送" />);
        case 2:
          return (<Badge status="processing" text="已备案" />);
        case 3:
          return (<Badge status="processing" text="部分委托" />);
        case 4:
          return (<Badge status="processing" text="全部委托" />);
        case 5:
          return (<Badge status="processing" text="部分清关" />);
        case 6:
          return (<Badge status="processing" text="清关完成" />);
        case 7:
          return (<Badge status="processing" text="部分出区" />);
        case 8:
          return (<Badge status="success" text="出区完成" />);
        default:
          break;
      }
    },
  }, {
    title: '报关单号',
    dataIndex: 'cus_decl_no',
    width: 160,
    render: o => <span className="text-emphasis">{o}</span>,
  }, {
    title: '货主',
    width: 180,
    dataIndex: 'owner_name',
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: '客户单号',
    dataIndex: 'cust_order_no',
    width: 180,
  }, {
    title: '提货单位',
    width: 180,
    dataIndex: 'receiver_name',
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: '关联编号',
    dataIndex: 'so_no',
    width: 160,
    render: (o, record) => <a onClick={() => this.handlePreview(o, record.outbound_no)}>{o}</a>,
  }, {
    title: '运输单位',
    width: 180,
    dataIndex: 'carrier_name',
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: '备案日期',
    width: 120,
    dataIndex: 'ftz_reg_date',
    render: reldate => reldate && moment(reldate).format('YYYY.MM.DD'),
  }, {
    title: '报关日期',
    width: 120,
    dataIndex: 'cus_decl_date',
    render: decldate => decldate && moment(decldate).format('YYYY.MM.DD'),
  }, {
    title: '出区日期',
    width: 120,
    dataIndex: 'exit_date',
    render: reldate => reldate && moment(reldate).format('YYYY.MM.DD'),
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
    width: 150,
    fixed: 'right',
    render: (o, record) => {
      switch (record.status) {
        case 0:
          return <RowUpdater onClick={this.handleDetail} label="发送备案" row={record} />;
        case 1:
          return <RowUpdater onClick={this.handleDetail} label="备案详情" row={record} />;
        case 2:
          return (<span>
            <RowUpdater onClick={this.handleDetail} label="委托清关" row={record} />
            <span className="ant-divider" />
            <RowUpdater onClick={this.handleDetail} label="备案详情" row={record} />
          </span>);
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
          return <RowUpdater onClick={this.handleDetail} label="备案详情" row={record} />;
        default:
          break;
      }
    },
  }]
  handlePreview = (soNo, outboundNo) => {
    this.props.showDock(soNo, outboundNo);
  }
  dataSource = new DataTable.DataSource({
    fetcher: params => this.props.loadReleaseRegDatas(params),
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
    remotes: this.props.releaseList,
  })
  handleCreateNormalRelReg = () => {
    this.props.openNormalRelRegModal();
  }
  handleReleaseListLoad = (currentPage, whsecode, filter) => {
    const { listFilter, whse, releaseList: { pageSize, current } } = this.props;
    const newfilter = filter || listFilter;
    this.props.loadReleaseRegDatas({
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
  handleNewNormalRelRegLoad = () => {
    this.handleReleaseListLoad(1, this.props.whse.code, { ...this.props.listFilter, status: 'all' });
  }
  handleStatusChange = (ev) => {
    if (ev.target.value === this.props.listFilter.status) {
      return;
    }
    const filter = { ...this.props.listFilter, status: ev.target.value };
    this.handleReleaseListLoad(1, this.props.whse.code, filter);
  }
  handleDetail = (row) => {
    const link = `/cwm/supervision/shftz/release/${row.ftz_rel_type}/${row.so_no}`;
    this.context.router.push(link);
  }
  handleWhseChange = (value) => {
    this.props.switchDefaultWhse(value);
    message.info('当前仓库已切换');
    this.handleReleaseListLoad(1, value);
  }
  handleSearch = (searchVal) => {
    const filters = { ...this.props.listFilter, filterNo: searchVal };
    this.handleReleaseListLoad(1, this.props.whse.code, filters);
  }
  handleOwnerSelectChange = (value) => {
    const filters = { ...this.props.listFilter, ownerView: value };
    this.handleReleaseListLoad(1, this.props.whse.code, filters);
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  render() {
    const { releaseList, listFilter, owners } = this.props;
    this.dataSource.remotes = releaseList;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const toolbarActions = (<span>
      <SearchBar placeholder={this.msg('releaseSearchPlaceholder')} onInputSearch={this.handleSearch} value={listFilter.filterNo} />
      <span />
      <Select showSearch optionFilterProp="children" style={{ width: 160 }} value={listFilter.ownerView}
        onChange={this.handleOwnerSelectChange} defaultValue="all" dropdownMatchSelectWidth={false} dropdownStyle={{ width: 360 }}
      >
        <Option value="all">全部货主</Option>
        {owners.map(data => (<Option key={data.customs_code} value={data.customs_code} search={`${data.partner_code}${data.name}`}>{data.name}</Option>)
          )}
      </Select>
    </span>);
    const bulkActions = (<span>
      {listFilter.status === 'pending' && <Button >批量发送</Button>}
      {listFilter.status === 'pending' && <Button >合并备案</Button>}
      {listFilter.status === 'processing' && <Button >批量同步</Button>}
      {listFilter.status === 'completed' && <Button >批量委托清关</Button>}
      {listFilter.status === 'cleared' && <Button >批量出区确认</Button>}
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
            <ModuleMenu currentKey="relNormal" />
          </div>
        </Sider>
        <Layout>
          <PageHeader>
            <PageHeader.Title>
              <Breadcrumb>
                <Breadcrumb.Item>
                  {this.msg('ftzRelNormalReg')}
                </Breadcrumb.Item>
              </Breadcrumb>
            </PageHeader.Title>
            <PageHeader.Nav>
              <RadioGroup value={listFilter.status} onChange={this.handleStatusChange} >
                <RadioButton value="all">全部</RadioButton>
                <RadioButton value="pending">待备案</RadioButton>
                <RadioButton value="completed">已备案</RadioButton>
                <RadioButton value="delegated">已委托</RadioButton>
                <RadioButton value="cleared">已清关</RadioButton>
                <RadioButton value="exited">已出区</RadioButton>
              </RadioGroup>
            </PageHeader.Nav>
            <PageHeader.Actions>
              <Button type="primary" icon="plus" onClick={this.handleCreateNormalRelReg}>
                {this.msg('create')}
              </Button>
            </PageHeader.Actions>
          </PageHeader>
          <Content className="page-content" key="main">
            <DataTable
              toolbarActions={toolbarActions}
              bulkActions={bulkActions}
              rowSelection={rowSelection}
              selectedRowKeys={this.state.selectedRowKeys}
              handleDeselectRows={this.handleDeselectRows}
              columns={this.columns}
              dataSource={this.dataSource}
              rowKey="id"
              loading={this.props.loading}
              indentSize={0}
              defaultExpandAllRows
            />
            <ShippingDockPanel />
            <OrderDockPanel />
            <DelegationDockPanel />
            <ShipmentDockPanel />
            <NormalRelRegModal reload={this.handleNewNormalRelRegLoad} />
          </Content>
        </Layout>
      </Layout>
    );
  }
}
