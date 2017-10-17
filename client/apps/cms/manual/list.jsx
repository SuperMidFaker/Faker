import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Breadcrumb, Button, Layout } from 'antd';
import DataTable from 'client/components/DataTable';
import PageHeader from 'client/components/PageHeader';
import PageHint from 'client/components/PageHint';
import TrimSpan from 'client/components/trimSpan';
import connectNav from 'client/common/decorators/connect-nav';
import SearchBar from 'client/components/SearchBar';
// import RowUpdater from 'client/components/rowUpdater';
import messages from './message.i18n';
import { format } from 'client/common/i18n/helpers';


const formatMsg = format(messages);
const { Content } = Layout;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
  }),
  { }
)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
export default class ManualList extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,

  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    searchInput: '',
  }

  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: this.msg('手/帐册编号'),
    dataIndex: 'ems_no',
    width: 120,
    fixed: 'left',
    render: (o, record) => (
      <a onClick={() => this.handlePreview(o, record)}>
        {o}
      </a>),
  }, {
    title: this.msg('经营单位'),
    width: 180,
    dataIndex: 'owner_name',
    render: o => <TrimSpan text={o} maxLen={10} />,
  }, {
    title: this.msg('手/帐册类型'),
    width: 200,
    dataIndex: 'ems_type',
    render: o => <TrimSpan text={o} maxLen={25} />,
  }, {
    title: this.msg('主管海关'),
    width: 180,
    dataIndex: 'master_customs',
    render: o => <TrimSpan text={o} maxLen={20} />,
  }, {
    title: this.msg('贸易方式'),
    width: 180,
    dataIndex: 'trade_mode',
    render: o => <TrimSpan text={o} maxLen={10} />,
  }, {
    title: this.msg('征免性质'),
    width: 80,
    dataIndex: 'cut_mode',
  }, {
    title: this.msg('录入日期'),
    dataIndex: 'input_date',
    render: (o, record) => record.last_act_time ? moment(record.last_act_time).format('MM.DD HH:mm') : '-',
  }, {
    title: this.msg('申报日期'),
    dataIndex: 'declare_date',
    render: (o, record) => record.last_act_time ? moment(record.last_act_time).format('MM.DD HH:mm') : '-',
  }, {
    title: this.msg('有效日期'),
    dataIndex: 'last_act_time',
    render: (o, record) => record.last_act_time ? moment(record.last_act_time).format('MM.DD HH:mm') : '-',
  }]

  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }

  render() {
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const toolbarActions = (<span>
      <SearchBar placeholder={this.msg('searchPlaceholder')} size="large"
        onInputSearch={this.handleSearch}
      /></span>);

    return (
      <Layout>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('manual')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Actions>
            <PageHint />
            <Button type="primary" size="large" onClick={this.handleCreateBtnClick} icon="plus">
              {this.msg('导入')}
            </Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content" key="main">
          <DataTable toolbarActions={toolbarActions}
            rowSelection={rowSelection} selectedRowKeys={this.state.selectedRowKeys} handleDeselectRows={this.handleDeselectRows}
            columns={this.columns} dataSource={this.dataSource} rowKey="manual_no"
          />
        </Content>
      </Layout>
    );
  }
}
