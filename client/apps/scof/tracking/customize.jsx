import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Input, Table, Tooltip, Layout, Popconfirm, Icon } from 'antd';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { loadTrackings, addTracking, removeTracking, updateTracking,
  loadTrackingFields, toggleTrackingModal, loadTrackingItems } from 'common/reducers/scvTracking';
import ButtonToggle from 'client/components/ButtonToggle';
import PageHeader from 'client/components/PageHeader';
import SearchBox from 'client/components/SearchBox';
import { formatMsg } from './message.i18n';
import TrackingModal from './modals/trackingModal';
import TrackingItems from './trackingItems';

const { Content, Sider } = Layout;

function fetchData({ state, dispatch }) {
  dispatch(loadTrackingFields());
  return dispatch(loadTrackings(state.account.tenantId));
}
@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    trackings: state.scvTracking.trackings,
    loading: state.scvTracking.loading,
    loaded: state.scvTracking.loaded,
  }),
  {
    loadTrackings,
    addTracking,
    removeTracking,
    updateTracking,
    toggleTrackingModal,
    loadTrackingItems,
  }
)
@connectNav({
  depth: 2,
  moduleName: 'scof',
})
export default class CustomizeTracking extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    loaded: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
    tenantId: PropTypes.number.isRequired,
    trackings: PropTypes.array.isRequired,
    toggleTrackingModal: PropTypes.func.isRequired,
    loadTrackings: PropTypes.func.isRequired,
    removeTracking: PropTypes.func.isRequired,
    updateTracking: PropTypes.func.isRequired,
    loadTrackingItems: PropTypes.func.isRequired,
  }
  state = {
    tracking: {},
    currentPage: 1,
    collapsed: false,
    trackings: [],
    editId: -1,
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.trackings.length !== this.props.trackings.length || !this.state.tracking.id) {
      this.setState({
        tracking: nextProps.trackings.find(item =>
          item.id === this.state.tracking.id) || nextProps.trackings[0] || {},
      });
    }
    this.setState({ trackings: nextProps.trackings });
    if (!nextProps.loaded) {
      this.handleTableLoad();
    }
  }
  msg = formatMsg(this.props.intl)

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }
  handleShowTrackingModal = () => {
    this.props.toggleTrackingModal(true, 'add');
  }
  handleRowClick = (record) => {
    this.setState({
      tracking: record,
    });
  }
  handleTableLoad = () => {
    this.props.loadTrackings(this.props.tenantId).then(() => {
      this.props.loadTrackingItems(this.state.tracking.id);
    });
  }
  handleRemove = (id) => {
    this.props.removeTracking(id).then(() => {
      this.handleTableLoad();
    });
  }
  handleEdit = () => {
    this.props.toggleTrackingModal(true, 'edit', this.state.tracking);
  }
  handleEditName = (id) => {
    this.setState({ editId: id });
  }
  handleSave = (id) => {
    const tracking = this.state.trackings.find(item => item.id === id);
    this.props.updateTracking({ id: tracking.id, name: tracking.name }).then(() => {
      this.setState({ editId: -1 });
      this.handleTableLoad();
    });
  }
  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  }
  handleSearch = (value) => {
    let { trackings } = this.props;
    if (value) {
      trackings = this.props.trackings.filter((item) => {
        const reg = new RegExp(value);
        return reg.test(item.name);
      });
    }
    this.setState({ trackings, currentPage: 1 });
  }
  render() {
    const { tracking, editId } = this.state;
    const columns = [{
      dataIndex: 'name',
      key: 'name',
      render: (o, row) => {
        if (editId === row.id) {
          return (<Input
            value={o}
            onChange={(e) => {
            const ts = this.state.trackings.map((item) => {
              if (item.id === row.id) {
                return { ...item, name: e.target.value };
              }
              return item;
            });
            this.setState({ trackings: ts });
          }}
          />);
        }
        return (<span className="menu-sider-item">{o}</span>);
      },
    }, {
      title: '操作',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (_, row) => {
        if (row.id === editId) {
          return (
            <a role="presentation" onClick={() => this.handleSave(row.id)}><Icon type="save" /></a>
          );
        }
        return (
          <span>
            <a role="presentation" onClick={() => this.handleEditName(row.id)}><Icon type="edit" /></a>
            <span className="ant-divider" />
            <Popconfirm title="确认删除?" onConfirm={() => this.handleRemove(row.id)}>
              <a role="presentation"><Icon type="delete" /></a>
            </Popconfirm>
          </span>);
      },
    }];
    return (
      <Layout>
        <Sider
          width={320}
          className="menu-sider"
          key="sider"
          trigger={null}
          collapsible
          collapsed={this.state.collapsed}
          collapsedWidth={0}
        >

          <div className="page-header">
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('shipmentsTrackingCustomize')}
              </Breadcrumb.Item>
            </Breadcrumb>
            <div className="pull-right">
              <Tooltip placement="bottom" title="新增跟踪表">
                <Button type="primary" shape="circle" icon="plus" onClick={() => this.handleShowTrackingModal()} />
              </Tooltip>
            </div>
          </div>
          <div className="left-sider-panel">
            <div className="toolbar">
              <SearchBox
                placeholder={this.msg('searchPlaceholder')}
                onSearch={this.handleSearch}
              />
            </div>
            <div className="list-body">
              <Table
                size="middle"
                dataSource={this.state.trackings}
                columns={columns}
                showHeader={false}
                pagination={{
                  current: this.state.currentPage,
                  defaultPageSize: 15,
                  onChange: this.handlePageChange,
                }}
                rowClassName={record => ((record.id === tracking.id) ? 'table-row-selected' : '')}
                rowKey="id"
                loading={this.props.loading}
                onRow={record => ({
                  onClick: () => { this.handleRowClick(record); },
                })}
              />
              <TrackingModal onOk={this.handleTableLoad} />
            </div>
          </div>
        </Sider>
        <Layout>
          <PageHeader>
            <PageHeader.Title>
              <ButtonToggle
                iconOn="menu-fold"
                iconOff="menu-unfold"
                onClick={this.toggle}
                toggle
              />
              { this.state.collapsed && <Breadcrumb>
                <Breadcrumb.Item>
                  {this.msg('shipmentsTrackingCustomize')}
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                  {tracking.name}
                </Breadcrumb.Item>
              </Breadcrumb>}
            </PageHeader.Title>
            <PageHeader.Actions>
              <Button type="primary" ghost disabled={this.state.trackings.length === 0} onClick={this.handleEdit}>跟踪表设置</Button>
            </PageHeader.Actions>
          </PageHeader>
          <Content className="page-content">
            {this.state.trackings.length > 0 && <TrackingItems tracking={tracking} />}
          </Content>
        </Layout>
      </Layout>
    );
  }
}
