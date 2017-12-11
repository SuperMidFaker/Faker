import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Badge, Breadcrumb, Layout, Radio, message, Icon, Switch, Tag, Tooltip } from 'antd';
import DataTable from 'client/components/DataTable';
import PageHeader from 'client/components/PageHeader';
import PageHint from 'client/components/PageHint';
import RowAction from 'client/components/RowAction';
import connectNav from 'client/common/decorators/connect-nav';
// import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { setInspect } from 'common/reducers/cmsDeclare';
import { loadCiqDecls, loadCiqParams } from 'common/reducers/cmsCiqDeclare';
import { createFilename } from 'client/util/dataTransform';
import { openCiqModal } from 'common/reducers/cmsDelegation';
import { showPreviewer } from 'common/reducers/cmsDelgInfoHub';
import { intlShape, injectIntl } from 'react-intl';
import messages from './message.i18n';
import TrimSpan from 'client/components/trimSpan';
import { format } from 'client/common/i18n/helpers';
import SearchBar from 'client/components/SearchBar';
import DelegationDockPanel from '../common/dock/delegationDockPanel';

const formatMsg = format(messages);
const { Content } = Layout;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

function ColumnSwitch(props) {
  const { record, field, checked, onChange } = props;
  function handleChange(value) {
    if (onChange) {
      onChange(record, field, value);
    }
  }
  return <Switch size="small" disabled={record.ciq_status === 1} checked={checked} onChange={handleChange} />;
}
ColumnSwitch.propTypes = {
  record: PropTypes.object.isRequired,
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
  }),
  { loadCiqDecls, openCiqModal, setInspect, showPreviewer, loadCiqParams }
)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})

export default class CiqDeclList extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ietype: PropTypes.oneOf(['import', 'export']),
    tenantId: PropTypes.number.isRequired,
    ciqDeclList: PropTypes.object.isRequired,
    listFilter: PropTypes.object.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    searchInput: '',
  }
  componentDidMount() {
    this.handleTableLoad();
    this.props.loadCiqParams();
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: this.msg('ciqDeclNo'),
    dataIndex: 'pre_entry_seq_no',
    width: 180,
    fixed: 'left',
    render: (o, record) => record.ciq_decl_no ? <span className="text-emphasis">{record.ciq_decl_no}</span> : <span className="text-normal">{o}</span>,
  }, {
    title: <Tooltip title="申报项数"><Icon type="bars" /></Tooltip>,
    dataIndex: 'detail_count',
    width: 50,
    render: dc => !isNaN(dc) ? dc : null,
  }, {
    title: this.msg('ciqDeclCode'),
    width: 100,
    dataIndex: 'ciq_decl_type',
    render: (o) => {
      switch (Number(o)) {
        case 13:
          return <Tag color="cyan">入境检验检疫</Tag>;
        case 14:
          return <Tag color="cyan">入境流向</Tag>;
        case 15:
          return <Tag color="cyan">入境验证</Tag>;
        case 21:
          return <Tag color="orange">出境预检</Tag>;
        case 24:
          return <Tag color="orange">出境检验检疫</Tag>;
        case 25:
          return <Tag color="orange">出境核查货证</Tag>;
        case 28:
          return <Tag color="orange">出境验证</Tag>;
        default:
          break;
      }
    },
  }, {
    title: this.msg('ciqClNo'),
    dataIndex: 'ciq_cl_no',
    width: 180,
  }, {
    title: this.msg('delgNo'),
    dataIndex: 'delg_no',
    width: 120,
    render: (o, record) => (
      <a onClick={ev => this.handlePreview(record, ev)}>
        {o}
      </a>),
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
          return <Badge status="default" text="已创建" />;
        case 1:
          return <Badge status="processing" text="报检受理" />;
        case 2:
          return <Badge status="error" text="施检查验" />;
        case 3:
          return <Badge status="success" text="通关放行" />;
        case 4:
          return <Badge status="success" text="签发证单" />;
        default:
          break;
      }
    },
  }, {
    title: this.msg('consigneeCname'),
    dataIndex: 'ciq_consignee_name_cn',
    width: 180,
    render: o => <TrimSpan text={o} maxLen={12} />,
  }, {
    title: this.msg('consignorCname'),
    dataIndex: 'ciq_consignor_name_cn',
    width: 180,
    render: o => <TrimSpan text={o} maxLen={12} />,
  }, {
    title: this.msg('orgCode'),
    dataIndex: 'ciq_org_code',
    width: 100,
    render: o => this.props.organizations.find(org => org.org_code === o) && this.props.organizations.find(org => org.org_code === o).org_name,
  }, {
    title: this.msg('ciqDeclDate'),
    dataIndex: 'ciq_decl_date',
    width: 120,
    render: o => (o ? moment(0).format('MM.DD HH:mm') : '-'),
  /*
  }, {
    title: this.msg('ciqQualityInsp'),
    dataIndex: 'ciq_quality_inspect',
    width: 80,
    render: (o, record) =>
      <ColumnSwitch field="pzcy" record={record} checked={!!o} onChange={this.handleEditChange} />,
  }, {
    title: this.msg('ciqApInsp'),
    dataIndex: 'ciq_ap_inspect',
    width: 100,
    render: (o, record) =>
      <ColumnSwitch field="djcy" record={record} checked={!!o} onChange={this.handleEditChange} />,
  */
  }, {
    title: this.msg('declRegNo'),
    dataIndex: 'agent_name',
    width: 180,
  }, {
    title: this.msg('报检人员'),
    dataIndex: 'agent_ciq_person',
    width: 180,
  }, {
    title: this.msg('opColumn'),
    dataIndex: 'OPS_COL',
    width: 100,
    fixed: 'right',
    render: (o, record) => (
      <span>
        <RowAction onClick={this.handleDetail} icon="form" label="详情" row={record} />
        <RowAction onClick={this.exportCiqDecl} icon="file-excel" tooltip="九城商检导出" row={record} />
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
  handlePreview = (record, ev) => {
    ev.stopPropagation();
    this.props.showPreviewer(record.delg_no, 'ciqDecl');
  }
  handleEditChange = (record, field, checked) => {
    this.props.setInspect({
      preEntrySeqNo: record.pre_entry_seq_no,
      delgNo: record.delg_no,
      field,
      enabled: checked,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.handleTableLoad();
      }
    });
  }
  handleTableLoad = (currentPage, filter) => {
    this.setState({ expandedKeys: [] });
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
  handleCiqNoFill = (row) => {
    this.props.openCiqModal({
      entryHeadId: row.id,
      delgNo: row.delg_no,
    });
  }
  handleSearch = (searchVal) => {
    const filters = this.mergeFilters(this.props.listFilter, searchVal);
    this.handleTableLoad(1, filters);
  }
  mergeFilters(curFilters, value) {
    const newFilters = {};
    Object.keys(curFilters).forEach((key) => {
      if (key !== 'filterNo') {
        newFilters[key] = curFilters[key];
      }
    });
    if (value !== null && value !== undefined && value !== '') {
      newFilters.filterNo = value;
    }
    return newFilters;
  }
  handleIEFilter = (e) => {
    const { listFilter, ciqDeclList } = this.props;
    const newFilters = { ...listFilter, ieType: e.target.value };
    this.handleTableLoad(ciqDeclList.current, newFilters);
  }
  exportCiqDecl = (row) => {
    window.open(`${API_ROOTS.default}v1/cms/clearance/ciqdecl/${createFilename('ciqdecl')}.xlsx?preEntrySeqNo=${row.pre_entry_seq_no}`);
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
    const toolbarActions = (<span>
      <SearchBar placeholder={this.msg('ciqSearchPlaceholder')} onInputSearch={this.handleSearch} />
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
          <DataTable toolbarActions={toolbarActions}
            rowSelection={rowSelection} selectedRowKeys={this.state.selectedRowKeys} handleDeselectRows={this.handleDeselectRows}
            columns={this.columns} dataSource={this.dataSource} rowKey="id" loading={ciqDeclList.loading}
            onRowClick={this.handleRowClick}
          />
        </Content>
        <DelegationDockPanel />
      </Layout>
    );
  }
}
