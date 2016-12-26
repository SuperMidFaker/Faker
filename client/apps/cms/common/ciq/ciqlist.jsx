import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { Breadcrumb, message, Icon, Switch, Tag } from 'antd';
import Table from 'client/components/remoteAntTable';
import QueueAnim from 'rc-queue-anim';
import connectNav from 'client/common/decorators/connect-nav';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { loadCiqDecls, saveCheckedState, setDeclFinish, saveStateTOExp } from 'common/reducers/cmsDeclare';
import { openCiqModal } from 'common/reducers/cmsDelegation';
import { intlShape, injectIntl } from 'react-intl';
import messages from './message.i18n';
import TrimSpan from 'client/components/trimSpan';
import { format } from 'client/common/i18n/helpers';
import SearchBar from 'client/components/search-bar';
import RowUpdater from '../delegation/rowUpdater';
import CiqnoFillModal from './modals/ciqNoFill';

const formatMsg = format(messages);

function ColumnSwitch(props) {
  const { record, field, onChange } = props;
  function handleChange(value) {
    if (onChange) {
      onChange(record, field, value);
    }
  }
  let check = false;
  if (record[field] === 1) {
    check = true;
  }
  return <Switch size="small" disabled={record.ciq_status === 1 || check} checked={check} value={record[field] || 0} onChange={handleChange} />;
}
ColumnSwitch.propTypes = {
  record: PropTypes.object.isRequired,
  field: PropTypes.string.isRequired,
  onChange: PropTypes.func,
};

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    ciqdeclList: state.cmsDeclare.ciqdeclList,
    listFilter: state.cmsDeclare.listFilter,
  }),
  { loadCiqDecls, openCiqModal, saveCheckedState, setDeclFinish, saveStateTOExp }
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
    title: this.msg('preEntryNo'),
    dataIndex: 'pre_entry_seq_no',
    fixed: 'left',
    width: 150,
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
    title: '委托方',
    dataIndex: 'customer_name',
    width: 180,
    render: o => <TrimSpan text={o} maxLen={12} />,
  }, {
    title: this.msg('ciqAgent'),
    dataIndex: 'ciq_name',
    width: 180,
    render: o => <TrimSpan text={o} maxLen={12} />,
  }, {
    title: '提运单号',
    dataIndex: 'bl_wb_no',
  }, {
    title: this.msg('delgNo'),
    dataIndex: 'delg_no',
    width: 120,
  }, {
    title: '检验检疫',
    width: 100,
    dataIndex: 'ciq_type',
    render: (o) => {
      if (o === 'NL') {
        return <Tag color="#ccc">一般报检</Tag>;
      } else if (o === 'LA' || o === 'LB') {
        return <Tag color="#fa0">法定检验</Tag>;
      }
      return <span />;
    },
  }, {
    title: '报检日期',
    width: 120,
    render: (o, record) => (record.id ?
      record.process_date && moment(record.process_date).format('MM.DD HH:mm') : '-'),
  }, {
    title: this.msg('qualityCheck'),
    dataIndex: 'ciq_quality_inspect',
    width: 80,
    fixed: 'right',
    render: (o, record) =>
      <ColumnSwitch field="ciq_quality_inspect" record={record} onChange={this.handleEditChange} />,
  }, {
    title: this.msg('anipkCheck'),
    dataIndex: 'ciq_ap_inspect',
    width: 100,
    fixed: 'right',
    render: (o, record) =>
      <ColumnSwitch field="ciq_ap_inspect" record={record} onChange={this.handleEditChange} />,
  }, {
    title: this.msg('opColumn'),
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
  dataSource = new Table.DataSource({
    fetcher: params => this.props.loadCiqDecls(params),
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
  handleEditChange = (record, field, value) => {
    record[field] = value ? 1 : 0; // eslint-disable-line no-param-reassign
    this.props.saveCheckedState(record);
    record.field = field; // eslint-disable-line no-param-reassign
    this.props.saveStateTOExp(record);
    this.forceUpdate();
  }
  handleCiqFinish = (row) => {
    this.props.setDeclFinish(row.entry_id, row.delg_no);
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
    const { ciqdeclList } = this.props;
    this.dataSource.remotes = ciqdeclList;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    return (
      <QueueAnim type={['bottom', 'up']}>
        <header className="top-bar" key="header">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.props.ietype === 'import' ? this.msg('importOperation') : this.msg('exportOperation')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('ciqDeclaration')}
            </Breadcrumb.Item>
          </Breadcrumb>
        </header>
        <div className="top-bar-tools">
          <SearchBar placeholder={this.msg('ciqSearchPlaceholder')} onInputSearch={this.handleSearch} />
        </div>
        <div className="main-content" key="main">
          <div className="page-body">
            <div className="panel-body table-panel expandable">
              <Table rowSelection={rowSelection} columns={this.columns} rowKey="pre_entry_seq_no" dataSource={this.dataSource} loading={ciqdeclList.loading} scroll={{ x: 1700 }} />
            </div>
            <CiqnoFillModal reload={this.handleTableLoad} />
          </div>
        </div>
      </QueueAnim>
    );
  }
}