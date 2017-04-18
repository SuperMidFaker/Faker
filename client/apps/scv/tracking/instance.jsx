import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import { Breadcrumb, Layout, Table } from 'antd';
import { loadTrackingItems } from 'common/reducers/scvTracking';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
// import connectFetch from 'client/common/decorators/connect-fetch';

const formatMsg = format(messages);
const { Header, Content } = Layout;

// function fetchData({ dispatch, state, params }) {
//   return dispatch(loadParamVehicles(state.account.tenantId));
// }

// @connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    trackings: state.scvTracking.trackings,
    trackingItems: state.scvTracking.trackingItems,
  }),
  { loadTrackingItems }
)
@connectNav({
  depth: 2,
  moduleName: 'scv',
})
export default class Instance extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    trackings: PropTypes.array.isRequired,
    trackingItems: PropTypes.array.isRequired,
  }
  state = {
    tracking: {},
  }
  componentWillMount() {
    this.props.loadTrackingItems(Number(this.props.params.trackingId));
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.trackings.length > 0) {
      this.setState({ tracking: nextProps.trackings.find(item => item.id === Number(nextProps.params.trackingId)) });
    }
  }
  msg = key => formatMsg(this.props.intl, key)

  render() {
    const { trackingItems } = this.props;
    const { tracking } = this.state;
    const columns = trackingItems.map(item => ({
      dataIndex: item.field,
      key: item.field,
      title: item.custom_title,
    }));
    return (
      <Layout>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.msg('shipmentsTracking')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {tracking.name}
            </Breadcrumb.Item>
          </Breadcrumb>
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <Layout className="main-wrapper">
              <Content className="nav-content">
                <Table columns={columns} />
              </Content>
            </Layout>
          </div>
        </Content>
      </Layout>
    );
  }
}
