import React from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Breadcrumb, Button, Badge, Modal, Layout, Radio, Select, Tooltip, Tag } from 'antd';
import { loadFlowList, loadFlowTrackingFields, openCreateFlowModal, openFlow, reloadFlowList, editFlow, toggleFlowDesigner } from 'common/reducers/scofFlow';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import DataTable from 'client/components/DataTable';
import PageHeader from 'client/components/PageHeader';
import RowAction from 'client/components/RowAction';
import SearchBox from 'client/components/SearchBox';
import EditableCell from 'client/components/EditableCell';
import CreateFlowModal from './modal/createFlowModal';
import FlowDesigner from './designer';
import { formatMsg } from './message.i18n';

const { Content } = Layout;
const { Option } = Select;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

function fetchData({ state, dispatch }) {
  return dispatch(loadFlowList({
    filter: JSON.stringify({ ...state.scofFlow.listFilter, name: '' }),
    pageSize: state.scofFlow.flowList.pageSize,
    current: state.scofFlow.flowList.current,
  }));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    reload: state.scofFlow.reloadFlowList,
    loading: state.scofFlow.flowListLoading,
    thisFlow: state.scofFlow.currentFlow,
    listFilter: state.scofFlow.listFilter,
    flowList: state.scofFlow.flowList,
    listCollapsed: state.scofFlow.listCollapsed,
    designerVisible: state.scofFlow.flowDesigner.visible,
    partners: state.partner.partners,
  }),
  {
    openCreateFlowModal,
    loadFlowList,
    loadFlowTrackingFields,
    openFlow,
    reloadFlowList,
    editFlow,
    toggleFlowDesigner,
  }
)
@connectNav({
  depth: 2,
  moduleName: 'scof',
})
export default class FlowList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  componentWillMount() {
    this.props.loadFlowTrackingFields();
  }
  msg = formatMsg(this.props.intl)
  flowDataSource = new DataTable.DataSource({
    fetcher: params => this.props.loadFlowList(params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize,
      showTotal: total => `共 ${total} 条`,
    }),
    getParams: (pagination, tblfilters) => {
      const newfilters = { ...this.props.listFilter, ...tblfilters[0] };
      const params = {
        pageSize: pagination.pageSize,
        current: pagination.current,
        filter: JSON.stringify(newfilters),
      };
      return params;
    },
    remotes: this.props.flowList,
  })
  columns = [{
    title: this.msg('流程名称'),
    dataIndex: 'name',
    render: (o, record) => (<EditableCell
      value={record.name}
      cellTrigger={false}
      onSave={name => this.handleFlowNameChange(record.id, name)}
    />),
  }, {
    title: this.msg('关联客户'),
    dataIndex: 'customer',
    render: (o, record) => (record.customer_tenant_id === -1 ?
      <Tooltip title="线下企业" placement="left"><Badge status="default" />{record.customer}</Tooltip> :
      <Tooltip title="线上租户" placement="left"><Badge status="processing" />{record.customer}</Tooltip>),
  }, {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    render: o => (o === 1 ? <Tag color="green">已启用</Tag> : <Tag>已停用</Tag>),
  }, {
    title: '最后更新时间',
    dataIndex: 'last_updated_date',
    key: 'last_updated_date',
    width: 140,
    render(o) {
      return moment(o).format('YYYY/MM/DD HH:mm');
    },
  }, {
    title: '更新者',
    dataIndex: 'last_updated_by',
    key: 'last_updated_by',
    width: 120,
  }, {
    title: '操作',
    key: 'OP_COL',
    width: 140,
    render: (_, record) => (<span>
      <RowAction onClick={this.handleDesignFlow} icon="form" label={this.msg('design')} row={record} />
      {record.status === 1 ? <RowAction onClick={this.handleDisableFlow} icon="pause-circle" tooltip={this.msg('disable')} row={record} /> :
      <RowAction onClick={this.handleEnableFlow} icon="play-circle" tooltip={this.msg('enable')} row={record} />
      }
    </span>
    ),
  },
  ]
  handleTableChange = (pagination, filters, sorter) => {
    const params = {
      pageSize: pagination.pageSize,
      current: pagination.current,
      sorter: {
        field: sorter.field,
        order: sorter.order === 'descend' ? 'DESC' : 'ASC',
      },
    };
    this.props.loadFlowList({
      filter: JSON.stringify(this.props.listFilter),
      pageSize: params.pageSize,
      current: params.current,
    });
  }
  handleSearch = (value) => {
    const filter = { ...this.props.listFilter, name: value };
    this.props.loadFlowList({
      filter: JSON.stringify(filter),
      pageSize: this.props.flowList.pageSize,
      current: 1,
    });
  }
  handleDesignFlow = (row) => {
    this.props.toggleFlowDesigner(true);
    this.props.openFlow(row);
  }
  handleCreateFlow = () => {
    this.props.openCreateFlowModal();
  }
  handleFlowNameChange = (flowid, name) => {
    this.props.editFlow(flowid, { name });
  }
  handleDelReload = () => {
    let { current } = this.props.flowList;
    if (this.props.flowList.data.length === 1 && this.props.flowList.current > 1) {
      current -= 1;
    }
    this.props.loadFlowList({
      filter: JSON.stringify(this.props.listFilter),
      pageSize: this.props.flowList.pageSize,
      current,
    });
  }
  handleSubFlowAuth = (flow) => {
    this.props.openSubFlowAuthModal(flow.id);
  }
  render() {
    const {
      thisFlow, flowList, loading, designerVisible, partners, listFilter,
    } = this.props;
    this.flowDataSource.remotes = flowList;
    const toolbarActions = (<span>
      <SearchBox
        placeholder={this.msg('searchPlaceholder')}
        onSearch={this.handleSearch}
      />
      <Select
        showSearch
        optionFilterProp="children"
        style={{ width: 200 }}
        onChange={this.handleClientSelectChange}
        value={listFilter.partnerId}
        dropdownMatchSelectWidth={false}
        dropdownStyle={{ width: 360 }}
      >
        {partners.map(data => (<Option key={data.id} value={data.id}>{data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}</Option>))}
      </Select>
    </span>);
    return (
      <Layout>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('flowName')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Nav>
            <RadioGroup onChange={this.handleStatusChange}>
              <RadioButton value="enabled">已启用</RadioButton>
              <RadioButton value="disabled">已停用</RadioButton>
            </RadioGroup>
          </PageHeader.Nav>
          <PageHeader.Actions>
            <Button type="primary" icon="plus" onClick={this.handleCreateFlow} >{this.msg('createFlow')}</Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content">
          <DataTable
            toolbarActions={toolbarActions}
            dataSource={this.flowDataSource}
            columns={this.columns}
            rowClassName={record => (thisFlow && record.id === thisFlow.id ? 'table-row-selected' : '')}
            loading={loading}
            rowKey="id"
            onRow={record => ({
              onDoubleClick: () => { this.handleDesignFlow(record); },
            })}
          />
        </Content>
        <CreateFlowModal />
        <Modal
          maskClosable={false}
          title={this.msg('flowDesigner')}
          width="100%"
          visible={designerVisible}
          onCancel={() => this.props.toggleFlowDesigner(false)}
          footer={null}
          wrapClassName="fullscreen-modal"
          destroyOnClose
        >
          <FlowDesigner currentFlow={thisFlow} reloadOnDel={this.handleDelReload} />
        </Modal>
      </Layout>
    );
  }
}
