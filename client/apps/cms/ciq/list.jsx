import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Badge, Breadcrumb, Layout, Radio, message, Icon, Input, Switch, Tag, Tooltip, Select, DatePicker } from 'antd';
import DataTable from 'client/components/DataTable';
import PageHeader from 'client/components/PageHeader';
import PageHint from 'client/components/PageHint';
import RowAction from 'client/components/RowAction';
import connectNav from 'client/common/decorators/connect-nav';
// import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { setInspect } from 'common/reducers/cmsCustomsDeclare';
import { loadCiqDecls, loadCiqParams } from 'common/reducers/cmsCiqDeclare';
import { createFilename } from 'client/util/dataTransform';
import { openCiqModal } from 'common/reducers/cmsDelegation';
import { showPreviewer } from 'common/reducers/cmsDelegationDock';
import { intlShape, injectIntl } from 'react-intl';
import TrimSpan from 'client/components/trimSpan';
import { loadPartnersByTypes } from 'common/reducers/partner';
import { CIQ_DECL_STATUS, PARTNER_ROLES, PARTNER_BUSINESSE_TYPES } from 'common/constants';
import DelegationDockPanel from '../common/dock/delegationDockPanel';
import { formatMsg } from './message.i18n';

const { Content } = Layout;
const { Search } = Input;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const { Option } = Select;
const { RangePicker } = DatePicker;

function ColumnSwitch(props) {
  const {
    record, field, checked, onChange,
  } = props;
  function handleChange(value) {
    if (onChange) {
      onChange(record, field, value);
    }
  }
  return <Switch size="small" disabled={record.ciq_status === 1} checked={checked} onChange={handleChange} />;
}
ColumnSwitch.propTypes = {
  record: PropTypes.shape({ ciq_status: PropTypes.bool }).isRequired,
  field: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func,
};

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    ciqDeclList: state.cmsCiqDeclare.ciqDeclList,
    listFilter: state.cmsCiqDeclare.ciqListFilter,
    organizations: state.cmsCiqDeclare.ciqParams.organizations,
    clients: state.partner.partners,
  }),
  {
    loadCiqDecls, openCiqModal, setInspect, showPreviewer, loadCiqParams, loadPartnersByTypes,
  }
)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})

export default class CiqDeclList extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    ciqDeclList: PropTypes.shape({ pageSize: PropTypes.number }).isRequired,
    listFilter: PropTypes.shape({
      ieType: PropTypes.oneOf(['import', 'all', 'export']),
      status: PropTypes.string,
    }).isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
  }
  componentDidMount() {
    this.handleTableLoad();
    this.props.loadCiqParams();
    this.props.loadPartnersByTypes(
      this.props.tenantId,
      [PARTNER_ROLES.CUS, PARTNER_ROLES.DCUS], PARTNER_BUSINESSE_TYPES.clearance
    );
  }
  msg = formatMsg(this.props.intl)
  columns = [{
    title: this.msg('ciqDeclNo'),
    dataIndex: 'pre_entry_seq_no',
    width: 180,
    fixed: 'left',
    render: (o, record) => (record.ciq_decl_no ?
      <span className="text-emphasis">{record.ciq_decl_no}</span> :
      <span className="text-normal">{o}</span>),
  }, {
    title: <Tooltip title="申报项数"><Icon type="bars" /></Tooltip>,
    dataIndex: 'detail_count',
    width: 50,
    render: dc => (!Number.isNaN(Number(dc)) ? dc : null),
  }, {
    title: this.msg('ciqDeclCode'),
    width: 120,
    dataIndex: 'ciq_decl_type',
    render: (o) => {
      switch (Number(o)) {
        case 13:
          return <Tag color="cyan">{this.msg('ciqInInsp')}</Tag>;
        case 14:
          return <Tag color="cyan">{this.msg('ciqInFlow')}</Tag>;
        case 15:
          return <Tag color="cyan">{this.msg('ciqInVali')}</Tag>;
        case 21:
          return <Tag color="orange">{this.msg('ciqOutPreInsp')}</Tag>;
        case 24:
          return <Tag color="orange">{this.msg('ciqOutInsp')}</Tag>;
        case 25:
          return <Tag color="orange">{this.msg('ciqOutCheck')}</Tag>;
        case 28:
          return <Tag color="orange">{this.msg('ciqOutVali')}</Tag>;
        default:
          return null;
      }
    },
  }, {
    title: this.msg('ciqClNo'),
    dataIndex: 'ciq_cl_no',
    width: 180,
  }, {
    title: this.msg('delgNo'),
    dataIndex: 'delg_no',
    width: 160,
    render: (o, record) => (
      <a onClick={ev => this.showDelegationDock(record, ev)}>
        {o}
      </a>),
  }, {
    title: this.msg('client'),
    dataIndex: 'i_e_type',
    width: 180,
    render: (o, record) => (o === 0 ?
      <TrimSpan text={record.ciq_consignee_name_cn} maxLen={12} /> :
      <TrimSpan text={record.ciq_consignor_name_cn} maxLen={12} />),
  }, {
    title: this.msg('custOrderNo'),
    width: 180,
    dataIndex: 'cust_order_no',
    render: o => <TrimSpan text={o} maxLen={20} />,
  }, {
    title: this.msg('status'),
    dataIndex: 'status',
    width: 100,
    render: (o) => {
      switch (o) {
        case 0:
          return <Badge status="default" text={this.msg('pending')} />;
        case 1:
          return <Badge status="processing" text={this.msg('accept')} />;
        case 2:
          return <Badge status="error" text={this.msg('insp')} />;
        case 3:
          return <Badge status="success" text={this.msg('pass')} />;
        case 4:
          return <Badge status="success" text={this.msg('sign')} />;
        default:
          return null;
      }
    },
  }, {
    title: this.msg('orgCode'),
    dataIndex: 'ciq_org_code',
    width: 150,
    render: o => this.props.organizations.find(org => org.org_code === o) &&
    this.props.organizations.find(org => org.org_code === o).org_name,
  }, {
    title: this.msg('ciqDeclDate'),
    dataIndex: 'ciq_decl_date',
    width: 120,
    render: o => (o ? moment(o).format('YYYY.MM.DD') : '-'),
  }, {
    title: this.msg('declRegNo'),
    dataIndex: 'agent_name',
    width: 180,
  }, {
    title: this.msg('agentPerson'),
    dataIndex: 'agent_ciq_person',
    width: 120,
  }, {
    title: this.msg('opColumn'),
    dataIndex: 'OPS_COL',
    width: 100,
    fixed: 'right',
    render: (o, record) => (
      <span>
        <RowAction onClick={this.handleDetail} icon="form" label={this.msg('detail')} row={record} />
        <RowAction onClick={this.handleExportNinetown} icon="file-excel" tooltip={this.msg('declExport')} row={record} />
      </span>),
  }]
  dataSource = new DataTable.DataSource({
    fetcher: params => this.props.loadCiqDecls(params),
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
        pageSize: pagination.pageSize,
        currentPage: pagination.current,
      };
      const filter = { ...this.props.listFilter };
      params.filter = JSON.stringify(filter);
      return params;
    },
    remotes: this.props.ciqDeclList,
  })
  handleTableLoad = (currentPage, filter) => {
    this.props.loadCiqDecls({
      tenantId: this.props.tenantId,
      filter: JSON.stringify(filter || this.props.listFilter),
      pageSize: this.props.ciqDeclList.pageSize,
      currentPage: currentPage || this.props.ciqDeclList.current,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 5);
      }
    });
  }
  handleDetail = (row) => {
    const ioPart = row.i_e_type === 0 ? 'in' : 'out';
    const link = `/clearance/ciqdecl/${ioPart}/${row.pre_entry_seq_no}`;
    this.context.router.push(link);
  }
  handleSearch = (searchVal) => {
    const newFilters = {};
    const curFilters = this.props.listFilter;
    const value = searchVal;
    Object.keys(curFilters).forEach((key) => {
      if (key !== 'filterNo') {
        newFilters[key] = curFilters[key];
      }
    });
    if (value !== null && value !== undefined && value !== '') {
      newFilters.filterNo = value;
    }
    this.handleTableLoad(1, newFilters);
  }
  handleIEFilter = (e) => {
    const { listFilter, ciqDeclList } = this.props;
    const newFilters = { ...listFilter, ieType: e.target.value };
    this.handleTableLoad(ciqDeclList.current, newFilters);
  }
  handleExportNinetown = (row) => {
    window.open(`${API_ROOTS.default}v1/cms/clearance/ciqdecl/${createFilename('ciqdecl')}.xlsx?preEntrySeqNo=${row.pre_entry_seq_no}`);
  }
  handleStatusChange = (value) => {
    const filters = { ...this.props.listFilter, status: value };
    this.handleTableLoad(this.props.ciqDeclList.current, filters);
  }
  handleClientSelectChange = (value) => {
    const filters = { ...this.props.listFilter, clientPid: value };
    this.handleTableLoad(this.props.ciqDeclList.current, filters);
  }
  handleDateRangeChange = (value, dateString) => {
    const filters = { ...this.props.listFilter, startTime: dateString[0], endTime: dateString[1] };
    this.handleTableLoad(this.props.ciqDeclList.current, filters);
  }
  showDelegationDock = (record, ev) => {
    ev.stopPropagation();
    this.props.showPreviewer(record.delg_no, 'shipment');
  }
  render() {
    const { ciqDeclList, listFilter } = this.props;
    this.dataSource.remotes = ciqDeclList;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const clients = [{
      name: this.msg('allClients'),
      partner_id: -1,
    }].concat(this.props.clients);
    const toolbarActions = (<span>
      <Search placeholder={this.msg('ciqSearchPlaceholder')} onSearch={this.handleSearch} style={{ width: 200 }} />
      <Select
        showSearch
        optionFilterProp="children"
        value={listFilter.status}
        onChange={this.handleStatusChange}
      >
        <Option value="all" key="all">{this.msg('allStatus')}</Option>
        {CIQ_DECL_STATUS.map(item => (
          <Option key={item.value} value={item.value}>
            {item.text}
          </Option>))}
      </Select>
      <Select
        showSearch
        optionFilterProp="children"
        style={{ width: 160 }}
        onChange={this.handleClientSelectChange}
        value={listFilter.clientPid}
        dropdownMatchSelectWidth={false}
        dropdownStyle={{ width: 360 }}
      >
        {clients.map(data => (<Option key={data.partner_id} value={data.partner_id}>
          {data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}
        </Option>))}
      </Select>
      <RangePicker
        defaultValue={[listFilter.startTime, listFilter.endTime]}
        ranges={{ Today: [moment(), moment()], 'This Month': [moment().startOf('month'), moment()] }}
        onChange={this.handleDateRangeChange}
        style={{ width: 256 }}
      />
    </span>);
    return (
      <Layout>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('ciqDecl')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Nav>
            <RadioGroup value={listFilter.ieType} onChange={this.handleIEFilter} >
              <RadioButton value="all">{this.msg('all')}</RadioButton>
              <RadioButton value="import">{this.msg('import')}</RadioButton>
              <RadioButton value="export">{this.msg('export')}</RadioButton>
            </RadioGroup>
          </PageHeader.Nav>
          <PageHeader.Actions>
            <PageHint />
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content" key="main">
          <DataTable
            toolbarActions={toolbarActions}
            rowSelection={rowSelection}
            selectedRowKeys={this.state.selectedRowKeys}
            handleDeselectRows={this.handleDeselectRows}
            columns={this.columns}
            dataSource={this.dataSource}
            rowKey="id"
            loading={ciqDeclList.loading}
            onRow={record => ({
              onClick: () => {},
              onDoubleClick: () => { this.handleDetail(record); },
              onContextMenu: () => {},
              onMouseEnter: () => {},
              onMouseLeave: () => {},
            })}
          />
        </Content>
        <DelegationDockPanel />
      </Layout>
    );
  }
}
