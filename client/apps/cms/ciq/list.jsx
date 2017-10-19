import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Breadcrumb, Layout, Radio, message, Icon, Switch, Tag } from 'antd';
import DataTable from 'client/components/DataTable';
import PageHeader from 'client/components/PageHeader';
import connectNav from 'client/common/decorators/connect-nav';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { loadCiqDecls, setInspect, setCiqFinish } from 'common/reducers/cmsDeclare';
import { openCiqModal } from 'common/reducers/cmsDelegation';
import { showPreviewer } from 'common/reducers/cmsDelgInfoHub';
import { intlShape, injectIntl } from 'react-intl';
import messages from './message.i18n';
import TrimSpan from 'client/components/trimSpan';
import { format } from 'client/common/i18n/helpers';
import SearchBar from 'client/components/SearchBar';
import RowUpdater from 'client/components/rowUpdater';
import DelegationDockPanel from '../common/dock/delegationDockPanel';
import CiqnoFillModal from '../common/ciq/modals/ciqNoFill';

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
    ciqdeclList: state.cmsDeclare.ciqdeclList,
    listFilter: state.cmsDeclare.listFilter,
  }),
  { loadCiqDecls, openCiqModal, setCiqFinish, setInspect, showPreviewer }
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
    ciqdeclList: PropTypes.object.isRequired,
    listFilter: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    searchInput: '',
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: this.msg('delgNo'),
    dataIndex: 'delg_no',
    width: 120,
    fixed: 'left',
    render: (o, record) => (
      <a onClick={ev => this.handlePreview(record, ev)}>
        {o}
      </a>),
  }, {
    title: this.msg('orderNo'),
    width: 180,
    dataIndex: 'order_no',
    render: o => <TrimSpan text={o} maxLen={20} />,
  }, {
    title: this.msg('preEntryNo'),
    dataIndex: 'pre_entry_seq_no',
    width: 180,
  }, {
    title: this.msg('ciqNo'),
    width: 180,
    dataIndex: 'ciq_no',
    render: (o, record) => {
      if (record.id) {
        if (o) {
          return o;
        } else if (record.ciq_status !== 1 && (record.ciq_type === 'LA' || record.ciq_type === 'LB')) {
          return (
            <PrivilegeCover module="clearance" feature={this.props.ietype} action="edit">
              <RowUpdater onHit={this.handleCiqNoFill} row={record}
                label={<Icon type="edit" />}
              />
            </PrivilegeCover>
          );
        } else {
          return '-';
        }
      } else {
        return '-';
      }
    },
  }, {
    title: '报检类别',
    width: 100,
    dataIndex: 'ciqdecl_type',
    render: (o) => {
      if (o === 'NL') {
        return <Tag color="cyan">包装检疫</Tag>;
      } else if (o === 'LA' || o === 'LB') {
        return <Tag color="orange">法定检验</Tag>;
      }
      return <span />;
    },
  }, {
    title: '报检状态',
    dataIndex: 'ciqdecl_status',
    width: 100,
  }, {
    title: '报检日期',
    width: 120,
    render: (o, record) => (record.id ?
      record.process_date && moment(record.process_date).format('MM.DD HH:mm') : '-'),
  }, {
    title: this.msg('qualityCheck'),
    dataIndex: 'ciq_quality_inspect',
    width: 80,
    render: (o, record) =>
      <ColumnSwitch field="pzcy" record={record} checked={!!o} onChange={this.handleEditChange} />,
  }, {
    title: this.msg('anipkCheck'),
    dataIndex: 'ciq_ap_inspect',
    width: 100,
    render: (o, record) =>
      <ColumnSwitch field="djcy" record={record} checked={!!o} onChange={this.handleEditChange} />,
  }, {
    title: '发货人',
    dataIndex: 'consignor',
    width: 180,
    render: o => <TrimSpan text={o} maxLen={12} />,
  }, {
    title: '收货人',
    dataIndex: 'consignee',
    width: 180,
    render: o => <TrimSpan text={o} maxLen={12} />,
  }, {
    title: this.msg('ciqAgent'),
    dataIndex: 'ciqdecl_org',
    width: 180,
    render: o => <TrimSpan text={o} maxLen={12} />,
  }, {
    title: '报检地',
    dataIndex: 'ciqdecl_place',
    width: 100,
  }, {
    title: this.msg('opColumn'),
    dataIndex: 'OPS_COL',
    width: 100,
    fixed: 'right',
    render: (o, record) => {
      if (record.ciq_status < 2) {
        return (
          <span>
            <RowUpdater onHit={this.handleCiqFinish} label={this.msg('ciqFinish')} row={record} />
          </span>
        );
      } else {
        return (
          <span>{this.msg('ciqFinish')}</span>
        );
      }
    },
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
        ietype: this.props.ietype,
        tenantId: this.props.tenantId,
        pageSize: pagination.pageSize,
        currentPage: pagination.current,
      };
      const filter = { ...this.props.listFilter };
      params.filter = JSON.stringify(filter);
      return params;
    },
    remotes: this.props.ciqdeclList,
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
  handleCiqFinish = (row) => {
    this.props.setCiqFinish(row.entry_id, row.delg_no);
  }
  handleTableLoad = (currentPage, filter) => {
    this.setState({ expandedKeys: [] });
    this.props.loadCiqDecls({
      ietype: this.props.ietype,
      tenantId: this.props.tenantId,
      filter: JSON.stringify(filter || this.props.listFilter),
      pageSize: this.props.ciqdeclList.pageSize,
      currentPage: currentPage || this.props.ciqdeclList.current,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 5);
      }
    });
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
  render() {
    const { ciqdeclList, listFilter } = this.props;
    this.dataSource.remotes = ciqdeclList;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const toolbarActions = (<span>
      <SearchBar placeholder={this.msg('ciqSearchPlaceholder')} size="large" onInputSearch={this.handleSearch} />
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
            <RadioGroup value={listFilter.iotype} onChange={this.handleIOFilter} size="large">
              <RadioButton value="all">{this.msg('all')}</RadioButton>
              <RadioButton value="import">{this.msg('import')}</RadioButton>
              <RadioButton value="export">{this.msg('export')}</RadioButton>
            </RadioGroup>
          </PageHeader.Nav>
        </PageHeader>
        <Content className="page-content" key="main">
          <DataTable toolbarActions={toolbarActions}
            rowSelection={rowSelection} selectedRowKeys={this.state.selectedRowKeys} handleDeselectRows={this.handleDeselectRows}
            columns={this.columns} dataSource={this.dataSource} rowKey="id" loading={ciqdeclList.loading}
            onRowClick={this.handleRowClick}
          />
          <CiqnoFillModal reload={this.handleTableLoad} />
        </Content>
        <DelegationDockPanel />
      </Layout>
    );
  }
}
