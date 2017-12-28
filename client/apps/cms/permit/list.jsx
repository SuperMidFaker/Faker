import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Breadcrumb, Button, Icon, Layout, Radio, Tag } from 'antd';
import { format } from 'client/common/i18n/helpers';
import DataTable from 'client/components/DataTable';
import RowAction from 'client/components/RowAction';
import PageHeader from 'client/components/PageHeader';
import { Logixon } from 'client/components/FontIcon';
import connectNav from 'client/common/decorators/connect-nav';
import { loadPermits, loadCertParams } from 'common/reducers/cmsPermit';
import { loadPartnersByTypes } from 'common/reducers/partner';
import { PARTNER_ROLES, PARTNER_BUSINESSE_TYPES } from 'common/constants';
import SearchBar from 'client/components/SearchBar';
import messages from './message.i18n';

const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const formatMsg = format(messages);
const { Content } = Layout;


@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    permitList: state.cmsPermit.permitList,
    loading: state.cmsPermit.permitList.loading,
    clients: state.partner.partners,
    certParams: state.cmsPermit.certParams,
  }),
  { loadPermits, loadPartnersByTypes, loadCertParams }
)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
export default class PermitList extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    searchInput: '',
  }
  componentWillMount() {
    this.props.loadPermits({
      pageSize: this.props.permitList.pageSize,
      current: this.props.permitList.current,
    });
    this.props.loadPartnersByTypes(
      this.props.tenantId,
      [PARTNER_ROLES.CUS, PARTNER_ROLES.DCUS], PARTNER_BUSINESSE_TYPES.clearance
    );
    this.props.loadCertParams();
  }
  msg = key => formatMsg(this.props.intl, key);
  handleDetail = (row) => {
    this.context.router.push(`clearance/permit/${row.id}`);
  }
  columns = [{
    title: this.msg('关联货主'),
    width: 250,
    dataIndex: 'owner_partner_id',
    render: o => this.props.clients.find(cl => cl.partner_id === o) &&
    this.props.clients.find(cl => cl.partner_id === o).name,
  }, {
    title: this.msg('标准'),
    width: 60,
    dataIndex: 'permit_category',
    align: 'center',
    render: o => <Logixon type={o} />,
  }, {
    title: this.msg('证书类型'),
    width: 200,
    dataIndex: 'permit_code',
    render: o => this.props.certParams.find(cert => cert.cert_code === o) &&
    this.props.certParams.find(cert => cert.cert_code === o).cert_spec,
  }, {
    title: this.msg('证书编号'),
    dataIndex: 'permit_no',
    width: 150,
  }, {
    title: this.msg('次数管控'),
    width: 100,
    dataIndex: 'usage_control',
    align: 'center',
    render: o => (o ? <Tag color="#87d068">开启</Tag> : <Tag>关闭</Tag>),
  }, {
    title: this.msg('总次数'),
    width: 100,
    dataIndex: 'max_usage',
    align: 'right',
  }, {
    title: this.msg('剩余次数'),
    width: 100,
    dataIndex: 'ava_usage',
    align: 'right',
  }, {
    title: this.msg('有效期管控'),
    width: 120,
    dataIndex: 'expiry_control',
    align: 'center',
    render: o => (o ? <Tag color="#87d068">开启</Tag> : <Tag>关闭</Tag>),
  }, {
    title: this.msg('发证日期'),
    dataIndex: 'start_date',
    width: 150,
    align: 'center',
    render: (o, record) => (record.start_date ? moment(record.start_date).format('YYYY.MM.DD') : '-'),
  }, {
    title: this.msg('到期日期'),
    dataIndex: 'stop_date',
    width: 150,
    align: 'center',
    render: (o, record) => (record.stop_date ? moment(record.stop_date).format('YYYY.MM.DD') : '-'),
  }, {
    title: this.msg('状态'),
    width: 80,
    dataIndex: 'status',
    render: (o) => {
      if (o) {
        return <Tag color="green">有效</Tag>;
      }
      return <Tag color="red">失效</Tag>;
    },
  }, {
    title: this.msg('证书文件'),
    dataIndex: 'permit_file',
    align: 'center',
    render: (o) => {
      if (o && o !== '') {
        return <a href={o} target="_blank"><Icon type="file-pdf" /></a>;
      }
      return <span />;
    },
  }, {
    title: this.msg('操作'),
    width: 100,
    render: (o, record) => (
      <span>
        <RowAction onClick={this.handleDetail} icon="form" label="详情" row={record} />
      </span>),
  }]
  handleAdd = () => {
    this.context.router.push('/clearance/permit/add');
  }
  handlePreview = (manualNo) => {
    this.context.router.push(`/clearance/manual/${manualNo}`);
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  handleReload = () => {
    this.props.loadPermits({
    });
  }
  handleSearch = () => {
    this.props.loadPermits({
    });
  }
  render() {
    const { loading } = this.props;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const toolbarActions = (<span>
      <SearchBar
        placeholder={this.msg('证书编号')}
        onInputSearch={this.handleSearch}
      />
    </span>);
    const dataSource = new DataTable.DataSource({
      fetcher: params => this.props.loadPermits(params),
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
          pageSize: pagination.pageSize,
          current: pagination.current,
          filters: { text: this.state.searchInput },
        };
        return params;
      },
      remotes: this.props.permitList,
    });
    return (
      <Layout>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('permit')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Nav>
            <RadioGroup onChange={this.handleStatusFilter}>
              <RadioButton value="valid">{this.msg('filterValid')}</RadioButton>
              <RadioButton value="expiring">{this.msg('filterExpiring')}</RadioButton>
              <RadioButton value="expired">{this.msg('filterExpired')}</RadioButton>
            </RadioGroup>
          </PageHeader.Nav>
          <PageHeader.Actions>
            <Button type="primary" onClick={this.handleAdd} icon="plus">
              {this.msg('addPermit')}
            </Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content" key="main">
          <DataTable
            toolbarActions={toolbarActions}
            rowSelection={rowSelection}
            selectedRowKeys={this.state.selectedRowKeys}
            handleDeselectRows={this.handleDeselectRows}
            columns={this.columns}
            dataSource={dataSource}
            rowKey="permit_no"
            loading={loading}
          />
        </Content>
      </Layout>
    );
  }
}
