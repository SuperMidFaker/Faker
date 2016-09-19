import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import { setNavTitle } from 'common/reducers/navbar';
import { Button, message } from 'antd';
import Table from 'client/components/remoteAntTable';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadCompRelations, switchStatus } from 'common/reducers/cmsCompRelation';
import { RELATION_TYPES, I_E_TYPES } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
const formatMsg = format(messages);

const rowSelection = {
  onSelect() {},
};

function fetchData({ state, dispatch, cookie }) {
  if (!state.cmsCompRelation.loaded) {
    return dispatch(loadCompRelations(cookie, {
      tenantId: state.account.tenantId,
      pageSize: state.cmsCompRelation.list.pageSize,
      currentPage: state.cmsCompRelation.list.currentPage,
      searchText: state.cmsCompRelation.list.searchText,
    }));
  }
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    code: state.account.code,
    loading: state.cmsCompRelation.loading,
    list: state.cmsCompRelation.list,
  }),
  { loadCompRelations, switchStatus })
@connectNav((props, dispatch) => {
  dispatch(setNavTitle({
    depth: 2,
    moduleName: props.ietype,
    withModuleLayout: false,
    goBackFn: null,
  }));
})
export default class Manage extends Component {
  static propTypes = {
    tenantId: PropTypes.number.isRequired,
    intl: intlShape.isRequired,
    loadCompRelations: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  handleStatusSwitch(record, index) {
    this.props.switchStatus(index, record.id, record.status === 1 ? 0 : 1).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
  }
  handleNavigationTo(to, query) {
    this.context.router.push({ pathname: to, query });
  }
  renderColumnText(status, text) {
    let style = {};
    if (status === 0) {
      style = { color: '#CCC' };
    }
    return <span style={style}>{text}</span>;
  }
  render() {
    const msg = descriptor => formatMsg(this.props.intl, descriptor);
    const columns = [
      {
        title: msg('priceNo'),
        dataIndex: 'price_no',
        render: (text, record) => this.renderColumnText(record.status, text),
      }, {
        title: msg('delgClient'),
        dataIndex: 'customer_name',
        render: (text, record) => this.renderColumnText(record.status, text),
      }, {
        title: msg('invoiceNo'),
        dataIndex: 'invoice_no',
        render: (text, record) => {
          for (let i = 0; i < RELATION_TYPES.length; i++) {
            if (RELATION_TYPES[i].key === text) {
              return this.renderColumnText(record.status, RELATION_TYPES[i].value);
            }
          }
        },
      }, {
        title: msg('deliveryNo'),
        dataIndex: 'delivery_no',
        render: (text, record) => {
          for (let i = 0; i < I_E_TYPES.length; i++) {
            if (I_E_TYPES[i].key === text) {
              return this.renderColumnText(record.status, I_E_TYPES[i].value);
            }
          }
        },
      }, {
        title: msg('entryId'),
        dataIndex: 'entry_id',
        render: (text, record) => this.renderColumnText(record.status, text),
      }, {
        title: msg('delgEnterprise'),
        dataIndex: 'ccb_name',
        render: (text, record) => this.renderColumnText(record.status, text),
      }, {
        title: msg('endConfirm'),
        dataIndex: 'end_status',
        render: (text, record) => this.renderColumnText(record.status, text),
      }, {
        title: msg('lastActTime'),
        dataIndex: 'last_act_time',
        render: (text, record) => this.renderColumnText(record.status, text),
      },
    ];
    return (
      <div>
        <header className="top-bar">
          <span></span>
        </header>
        <div className="main-content">
          <div className="page-body">
            <div className="panel-header">
              <Button type="primary" style={{ marginBottom: 8 }} onClick={() => this.handleNavigationTo('/clearance/quote/create')}>
                新建报价
              </Button>
            </div>
            <div className="panel-body table-panel">
              <Table columns={columns} rowSelection={rowSelection} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
