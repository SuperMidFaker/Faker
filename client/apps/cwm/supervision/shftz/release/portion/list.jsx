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
import { loadReleaseRegDatas } from 'common/reducers/cwmShFtz';
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
  }),
  { loadReleaseRegDatas, switchDefaultWhse, showDock }
)
@connectNav({
  depth: 2,
  moduleName: 'cwm',
})
export default class SHFTZReleaseList extends React.Component {
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
    const filter = { ...listFilter, status, type: 'portion', ownerView };
    this.handleReleaseListLoad(null, null, filter);
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: '分拨出库单号/备案编号',
    dataIndex: 'ftz_rel_no',
    width: 200,
    fixed: 'left',
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
      if (o === 0) {
        return (<Badge status="default" text="待备案" />);
      } else if (o === 1) {
        return (<Badge status="processing" text="终端处理" />);
      } else if (o === 2) {
        return (<Badge status="success" text="备案完成" />);
      }
    },
  }, {
    title: 'SO编号',
    dataIndex: 'so_no',
    width: 160,
    render: (o, record) => <a onClick={() => this.handlePreview(o, record.outbound_no)}>{o}</a>,
  }, {
    title: '客户订单号',
    dataIndex: 'cust_order_no',
    width: 180,
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
    title: '运输单位',
    width: 180,
    dataIndex: 'carrier_name',
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: '出口日期',
    width: 120,
    dataIndex: 'ie_date',
    render: iedate => iedate && moment(iedate).format('YYYY.MM.DD'),
  }, {
    title: '报关日期',
    width: 120,
    dataIndex: 'cus_decl_date',
    render: decldate => decldate && moment(decldate).format('YYYY.MM.DD'),
  }, {
    title: '预计出区日期',
    width: 120,
    dataIndex: 'ftz_rel_date',
    render: reldate => reldate && moment(reldate).format('YYYY.MM.DD'),
  }, {
    title: '创建时间',
    width: 120,
    dataIndex: 'created_time',
    render: (o) => {
      if (o) {
        return `${moment(o).format('MM.DD HH:mm')}`;
      }
    },
  }, {
    title: '创建人员',
    dataIndex: 'created_by',
    width: 80,
  }, {
    title: '操作',
    dataIndex: 'OPS_COL',
    width: 100,
    fixed: 'right',
    render: (o, record) => record.status < 1 ? <RowUpdater onHit={this.handleDetail} label="发送备案" row={record} />
    : <RowUpdater onHit={this.handleDetail} label="备案详情" row={record} />,
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
    const bulkActions = <Button >发送报关申请</Button>;
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
            <ModuleMenu currentKey="relPortion" />
          </div>
        </Sider>
        <Layout>
          <PageHeader>
            <PageHeader.Title>
              <Breadcrumb>
                <Breadcrumb.Item>
                  {this.msg('ftzRelPortionReg')}
                </Breadcrumb.Item>
              </Breadcrumb>
            </PageHeader.Title>
            <PageHeader.Nav>
              <RadioGroup value={listFilter.status} onChange={this.handleStatusChange} >
                <RadioButton value="all">全部</RadioButton>
                <RadioButton value="pending">待备案</RadioButton>
                <RadioButton value="processing">终端处理</RadioButton>
                <RadioButton value="completed">备案完成</RadioButton>
              </RadioGroup>
            </PageHeader.Nav>
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
            />
            <ShippingDockPanel />
            <OrderDockPanel />
            <DelegationDockPanel />
            <ShipmentDockPanel />
          </Content>
        </Layout>
      </Layout>
    );
  }
}
