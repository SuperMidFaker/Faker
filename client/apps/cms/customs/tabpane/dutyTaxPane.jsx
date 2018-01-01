import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button } from 'antd';
import currencyFormatter from 'currency-formatter';
import { loadContainers, saveContainer, delContainer } from 'common/reducers/cmsManifest';
import DataPane from 'client/components/DataPane';
import Summary from 'client/components/Summary';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
  }),
  { loadContainers, saveContainer, delContainer }
)
export default class DutyTaxPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  state = {
    datas: [],
  };
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  render() {
    const columns = [{
      title: this.msg('seqNo'),
      dataIndex: 'g_no',
      width: 45,
      align: 'center',
    }, {
      title: this.msg('hscode'),
      dataIndex: 'hscode',
      width: 110,
    }, {
      title: this.msg('gName'),
      dataIndex: 'g_name',
      width: 200,
    }, {
      title: this.msg('decTotal'),
      dataIndex: 'trade_total',
      width: 150,
      align: 'right',
    }, {
      title: this.msg('currency'),
      dataIndex: 'currency',
      width: 100,
    }, {
      title: this.msg('exchangeRate'),
      dataIndex: 'exchange_rate',
      width: 80,
    }, {
      title: '完税价格',
      dataIndex: 'duty_base_price',
      width: 150,
      align: 'right',
      render(o) {
        return o ? currencyFormatter.format(o, { code: 'CNY' }) : '';
      },
    }, {
      title: '关税率',
      dataIndex: 'duty_rate',
      width: 100,
      align: 'right',
      render(o) {
        const val = o ? o * 100 : 0;
        return val ? `${val.toFixed(2)}%` : '';
      },
    }, {
      title: '关税',
      dataIndex: 'duty_amount',
      width: 150,
      align: 'right',
      render(o) {
        return o ? currencyFormatter.format(o, { code: 'CNY' }) : '';
      },
    }, {
      title: '增值税率',
      dataIndex: 'vat_rate',
      align: 'right',
      width: 100,
      render(o) {
        const val = o ? o * 100 : 0;
        return val ? `${val.toFixed(2)}%` : '';
      },
    }, {
      title: '增值税',
      dataIndex: 'vat_amount',
      width: 150,
      align: 'right',
      render(o) {
        return o ? currencyFormatter.format(o, { code: 'CNY' }) : '';
      },
    }, {
      title: '消费税率',
      dataIndex: 'consump_tax_rate',
      align: 'right',
      width: 100,
      render(o) {
        const val = o ? o * 100 : 0;
        return val ? `${val.toFixed(2)}%` : '';
      },
    }, {
      title: '消费税',
      dataIndex: 'consump_tax_amount',
      width: 150,
      align: 'right',
      render(o) {
        return o ? currencyFormatter.format(o, { code: 'CNY' }) : '';
      },
    }];
    return (
      <DataPane
        fullscreen={this.props.fullscreen}
        columns={columns}
        scrollOffset={312}
        dataSource={this.state.datas}
        rowKey="id"
      >
        <DataPane.Toolbar>
          <Button type="primary" ghost onClick={this.handleAdd} icon="calculator">{this.msg('estimate')}</Button>
          <DataPane.Extra>
            <Summary>
              <Summary.Item label="关税">{}</Summary.Item>
              <Summary.Item label="增值税">{}</Summary.Item>
              <Summary.Item label="消费税">{}</Summary.Item>
            </Summary>
          </DataPane.Extra>
        </DataPane.Toolbar>
      </DataPane>
    );
  }
}
