import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import { Button } from 'antd';
import Table from 'client/components/remoteAntTable';
import connectFetch from 'client/common/decorators/connect-fetch';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { loadQuoteTable } from 'common/reducers/cmsQuote';
import { TARIFF_KINDS, TRANS_MODE, DECL_I_TYPE, DECL_E_TYPE } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import NavLink from 'client/components/nav-link';
import moment from 'moment';
const formatMsg = format(messages);

function fetchData({ state, dispatch }) {
  return dispatch(loadQuoteTable(state.account.tenantId));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    quotes: state.cmsQuote.quotes,
  }),
)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
@withPrivilege({ module: 'clearance', feature: 'quote' })
export default class QuoteList extends Component {
  static propTypes = {
    tenantId: PropTypes.number.isRequired,
    quotes: PropTypes.array.isRequired,
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  handleNavigationTo(to, query) {
    this.context.router.push({ pathname: to, query });
  }
  render() {
    const msg = descriptor => formatMsg(this.props.intl, descriptor);
    const { quotes } = this.props;
    const DECL_TYPE = DECL_I_TYPE.concat(DECL_E_TYPE);
    const columns = [
      {
        title: msg('quoteNo'),
        dataIndex: 'quote_no',
        width: 150,
      }, {
        title: msg('partners'),
        dataIndex: 'partner.name',
        width: 150,
      }, {
        title: msg('tariffKinds'),
        dataIndex: 'tariff_kind',
        width: 150,
        render: (o) => {
          const decl = TARIFF_KINDS.filter(ts => ts.value === o)[0];
          return decl && decl.text;
        },
      }, {
        title: msg('declareWay'),
        dataIndex: 'decl_way_code',
        width: 150,
        render: (o) => {
          let text = '';
          if (o) {
            o.forEach((d) => {
              const decl = DECL_TYPE.filter(dl => dl.key === d)[0];
              text = `${decl && decl.value}|${text}`;
            });
          }
          return text;
        },
      }, {
        title: msg('transMode'),
        dataIndex: 'trans_mode',
        width: 150,
        render: (o) => {
          let text = '';
          if (o) {
            o.forEach((d) => {
              const decl = TRANS_MODE.filter(dl => dl.value === d)[0];
              text = `${decl && decl.text}|${text}`;
            });
          }
          return text;
        },
      }, {
        title: msg('remark'),
        dataIndex: 'remarks',
        width: 150,
        render: (o) => {
          let text = '';
          if (o) {
            o.forEach((d) => {
              text = `${d}|${text}`;
            });
          }
          return text;
        },
      }, {
        title: msg('status'),
        dataIndex: 'valid',
        width: 150,
        render: (o) => {
          if (!o) {
            return '无效';
          } else {
            return '有效';
          }
        },
      }, {
        title: msg('modifiedCount'),
        dataIndex: 'modify_count',
        width: 150,
      }, {
        title: msg('modifiedBy'),
        dataIndex: 'modify_name',
        width: 150,
      }, {
        title: msg('modifiedTime'),
        dataIndex: 'modify_time',
        width: 150,
        render: (o, record) => {
          return `${moment(record.modify_time).format('MM.DD HH:mm')}`;
        },
      }, {
        title: msg('operation'),
        width: 100,
        render: (o, record) => {
          return (
            <span>
              <NavLink to={`/clearance/quote/edit/${record.quote_no}`}>
              {msg('modify')}
              </NavLink>
            </span>
          );
        },
      },
    ];
    return (
      <div>
        <header className="top-bar">
          <span>{msg('quoteManage')}</span>
        </header>
        <div className="main-content">
          <div className="page-body">
            <div className="panel-header">
              <Button type="primary" onClick={() => this.handleNavigationTo('/clearance/quote/create')}>
                新建报价
              </Button>
            </div>
            <div className="panel-body table-panel">
              <Table columns={columns} dataSource={quotes} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
