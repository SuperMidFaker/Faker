import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import { Breadcrumb, Layout, Table } from 'antd';
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
  }),
  { }
)
@connectNav({
  depth: 2,
  moduleName: 'transport',
})
export default class Instance extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    trackings: PropTypes.array.isRequired,
  }
  state = {
    tracking: {},
  }
  componentWillReceiveProps(nextProps) {
    this.setState({ tracking: nextProps.trackings.find(item => item.id === nextProps.params.trackingId) });
  }
  msg = key => formatMsg(this.props.intl, key)

  render() {
    // const { tracking } = this.state;
    const columns = [
    ];
    return (
      <Layout>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.msg('shipmentsTracking')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              业务数据
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
