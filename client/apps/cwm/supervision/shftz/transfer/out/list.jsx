import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { Badge, Button, Layout, Radio, Select, Tag, message } from 'antd';
import DataTable from 'client/components/DataTable';
import TrimSpan from 'client/components/trimSpan';
import SearchBox from 'client/components/SearchBox';
import RowAction from 'client/components/RowAction';
import connectNav from 'client/common/decorators/connect-nav';
import PageHeader from 'client/components/PageHeader';
import { showDock } from 'common/reducers/cwmShippingOrder';
import { openNewTransfOutModal, loadReleaseRegDatas } from 'common/reducers/cwmShFtz';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import { CWM_SO_BONDED_REGTYPES } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import ShippingDockPanel from '../../../../shipping/dock/shippingDockPanel';
import OrderDockPanel from '../../../../../scof/orders/docks/orderDockPanel';
import DelegationDockPanel from '../../../../../cms/common/dock/delegationDockPanel';
import ShipmentDockPanel from '../../../../../transport/shipment/dock/shipmentDockPanel';
import messages from '../../message.i18n';
import NewTransfOutModal from './newTransfOutModal';

const formatMsg = format(messages);
const { Content } = Layout;
const { Option } = Select;
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
  {
    openNewTransfOutModal, loadReleaseRegDatas, switchDefaultWhse, showDock,
  }
)
@connectNav({
  depth: 2,
  moduleName: 'cwm',
})
export default class SHFTZTransferOutList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    releaseList: PropTypes.shape({ current: PropTypes.number }).isRequired,
    listFilter: PropTypes.shape({ status: PropTypes.string }).isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
  }
  componentDidMount() {
    const { listFilter } = this.props;
    let { status } = listFilter;
    if (['all', 'pending', 'sent', 'completed'].filter(stkey => stkey === status).length === 0) {
      status = 'all';
    }
    let { ownerView } = listFilter;
    if (ownerView !== 'all' && this.props.owners.filter(owner => listFilter.ownerView === owner.customs_code).length === 0) {
      ownerView = 'all';
    }
    const filter = {
      ...listFilter, status, type: 'transfer', ownerView, filterNo: '',
    };
    this.handleReleaseListLoad(null, null, filter);
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: '海关出库单号',
    width: 200,
    dataIndex: 'ftz_rel_no',
    fixed: 'left',
    render: o => <span className="text-emphasis">{o}</span>,
  }, {
    title: '监管类型',
    dataIndex: 'ftz_rel_type',
    width: 100,
    render: (reltype) => {
      const regtype = CWM_SO_BONDED_REGTYPES.filter(sbr => sbr.value === reltype)[0];
      if (regtype) {
        return (<Tag color={regtype.tagcolor}>{regtype.ftztext}</Tag>);
      }
      return null;
    },
  }, {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    render: (o) => {
      if (o === 0) {
        return (<Badge status="default" text="待转出" />);
      } else if (o === 1) {
        return (<Badge status="processing" text="已发送" />);
      } else if (o === 2) {
        return (<Badge status="success" text="已转出" />);
      }
      return null;
    },
  }, {
    title: 'SO编号',
    dataIndex: 'so_no',
    width: 160,
    render: (o, record) => <a onClick={() => this.handlePreview(o, record.outbound_no)}>{o}</a>,
  }, {
    title: '客户单号',
    dataIndex: 'cust_order_no',
    width: 180,
  }, {
    title: '发货单位',
    width: 280,
    dataIndex: 'owner_name',
    render: (o, record) => <TrimSpan text={`${record.owner_cus_code}|${o}`} maxLen={30} />,
  }, {
    title: '发货仓库号',
    width: 100,
    dataIndex: 'sender_ftz_whse_code',
  }, {
    title: '收货单位',
    width: 280,
    dataIndex: 'receiver_name',
    render: (o, record) => (record.receiver_cus_code ? <TrimSpan text={`${record.receiver_cus_code}|${o}`} maxLen={30} /> : o),
  }, {
    title: '收货仓库号',
    width: 100,
    dataIndex: 'receiver_ftz_whse_code',
  }, {
    title: '出库日期',
    width: 120,
    dataIndex: 'ftz_rel_date',
    render: reldate => reldate && moment(reldate).format('YYYY.MM.DD'),
  }, {
    title: '创建时间',
    width: 120,
    dataIndex: 'created_date',
    render: o => o && moment(o).format('MM.DD HH:mm'),
  }, {
    title: '创建人员',
    dataIndex: 'created_by',
    width: 80,
    render: o => this.props.userMembers.find(member => member.login_id === o)
    && this.props.userMembers.find(member => member.login_id === o).name,
  }, {
    title: '操作',
    dataIndex: 'OPS_COL',
    width: 100,
    fixed: 'right',
    render: (o, record) => (record.status === 0 ?
      <RowAction onClick={this.handleDetail} icon="form" label="详情" row={record} /> :
      <RowAction onClick={this.handleDetail} icon="eye-o" label="详情" row={record} />),
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
  handleStatusChange = (ev) => {
    if (ev.target.value === this.props.listFilter.status) {
      return;
    }
    const filter = { ...this.props.listFilter, status: ev.target.value };
    this.handleReleaseListLoad(1, this.props.whse.code, filter);
  }
  handleDetail = (row) => {
    const link = `/cwm/supervision/shftz/transfer/out/${row.so_no}`;
    this.context.router.push(link);
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
  handleCreateTransfOut = () => {
    this.props.openNewTransfOutModal();
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
      <SearchBox placeholder={this.msg('releaseSearchPlaceholder')} onSearch={this.handleSearch} />
      <span />
      <Select
        showSearch
        optionFilterProp="children"
        style={{ width: 160 }}
        value={listFilter.ownerView}
        onChange={this.handleOwnerSelectChange}
        defaultValue="all"
        dropdownMatchSelectWidth={false}
        dropdownStyle={{ width: 360 }}
      >
        <Option value="all">全部货主</Option>
        {owners.map(data => (<Option key={data.customs_code} value={data.customs_code} search={`${data.partner_code}${data.name}`}>{data.name}
        </Option>))}
      </Select>
    </span>);
    return (
      <Layout>
        <PageHeader title={this.msg('ftzTransferOut')}>
          <PageHeader.Nav>
            <RadioGroup value={listFilter.status} onChange={this.handleStatusChange} >
              <RadioButton value="all">全部状态</RadioButton>
              <RadioButton value="pending">待转出</RadioButton>
              <RadioButton value="sent">已发送</RadioButton>
              <RadioButton value="completed">已转出</RadioButton>
            </RadioGroup>
          </PageHeader.Nav>
          <PageHeader.Actions>
            <Button type="primary" icon="plus" onClick={this.handleCreateTransfOut}>
              {this.msg('create')}
            </Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content" key="main">
          <DataTable
            columns={this.columns}
            rowSelection={rowSelection}
            dataSource={this.dataSource}
            toolbarActions={toolbarActions}
            indentSize={8}
            rowKey="id"
            selectedRowKeys={this.state.selectedRowKeys}
            onDeselectRows={this.handleDeselectRows}
            loading={this.props.loading}
          />
          <ShippingDockPanel />
          <OrderDockPanel />
          <DelegationDockPanel />
          <ShipmentDockPanel />
          <NewTransfOutModal reload={this.handleReleaseListLoad} />
        </Content>
      </Layout>
    );
  }
}
