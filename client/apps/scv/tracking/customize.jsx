import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Input, Table, Tooltip, Layout, Popconfirm, Icon } from 'antd';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import ButtonToggle from 'client/components/ButtonToggle';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import { loadTrackings, addTracking, removeTracking, updateTracking, loadTrackingFields, toggleTrackingModal } from 'common/reducers/scvTracking';
import TrackingModal from './modals/trackingModal';
import TrackingItems from './trackingItems';

const formatMsg = format(messages);
const { Header, Content, Sider } = Layout;
const Search = Input.Search;

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
  { loadTrackings, addTracking, removeTracking, updateTracking, toggleTrackingModal }
)
@connectNav({
  depth: 2,
  moduleName: 'scv',
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
    addTracking: PropTypes.func.isRequired,
    removeTracking: PropTypes.func.isRequired,
    updateTracking: PropTypes.func.isRequired,
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
        tracking: nextProps.trackings.find(item => item.id === this.state.tracking.id) || nextProps.trackings[0] || {},
      });
    }
    this.setState({ trackings: nextProps.trackings });
    if (!nextProps.loaded) {
      this.handleTableLoad();
    }
  }
  msg = key => formatMsg(this.props.intl, key)

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
    this.props.loadTrackings(this.props.tenantId);
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
    let trackings = this.props.trackings;
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
          return (<Input value={o} onChange={(e) => {
            const ts = this.state.trackings.map((item) => {
              if (item.id === row.id) {
                return { ...item, name: e.target.value };
              } else {
                return item;
              }
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
      width: 60,
      render: (_, row) => {
        if (row.id === editId) {
          return (
            <a role="button" onClick={() => this.handleSave(row.id)}><Icon type="save" /></a>
          );
        }
        return (
          <span>
            <a role="button" onClick={() => this.handleEditName(row.id)}><Icon type="edit" /></a>
            <span className="ant-divider" />
            <Popconfirm title="确认删除?" onConfirm={() => this.handleRemove(row.id)}>
              <a role="button"><Icon type="delete" /></a>
            </Popconfirm>
          </span>);
      },
    }];
    return (
      <Layout>
        <Sider width={320} className="menu-sider" key="sider" trigger={null}
          collapsible
          collapsed={this.state.collapsed}
          collapsedWidth={0}
        >
          <div className="left-sider-panel">
            <div className="top-bar">
              <Breadcrumb>
                <Breadcrumb.Item>
                  {this.msg('shipmentsTrackingCustomize')}
                </Breadcrumb.Item>
              </Breadcrumb>
              <div className="pull-right">
                <Tooltip placement="bottom" title="新增追踪表">
                  <Button type="primary" shape="circle" icon="plus" onClick={() => this.handleShowTrackingModal()} />
                </Tooltip>
              </div>
            </div>
            <div className="left-sider-panel">
              <div className="toolbar">
                <Search
                  placeholder={this.msg('searchPlaceholder')}
                  onSearch={this.handleSearch} size="large"
                />
              </div>
              <Table size="middle" dataSource={this.state.trackings} columns={columns} showHeader={false} onRowClick={this.handleRowClick}
                pagination={{ current: this.state.currentPage, defaultPageSize: 15, onChange: this.handlePageChange }}
                rowClassName={record => record.id === tracking.id ? 'table-row-selected' : ''} rowKey="id" loading={this.props.loading}
              />
              <TrackingModal onOk={this.handleTableLoad} />
            </div>
          </div>
        </Sider>
        <Layout>
          <Header className="top-bar">
            { this.state.collapsed && <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('shipmentsTrackingCustomize')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {tracking.name}
              </Breadcrumb.Item>
            </Breadcrumb>}
            <ButtonToggle size="large"
              iconOn="menu-fold" iconOff="menu-unfold"
              onClick={this.toggle}
              toggle
            />
            <div className="top-bar-tools">
              <Button type="primary" onClick={this.handleEdit}>重新设定</Button>
            </div>
          </Header>
          <Content className="main-content layout-fixed-width layout-fixed-width-large">
            <TrackingItems tracking={tracking} />
          </Content>
        </Layout>
      </Layout>
    );
  }
}
