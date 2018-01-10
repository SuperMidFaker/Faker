import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Popconfirm } from 'antd';
import currencyFormatter from 'currency-formatter';
import { getDeclTax } from 'common/reducers/cmsCustomsDeclare';
import { taxRecalculate } from 'common/reducers/cmsDelegationDock';
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
  { getDeclTax, taxRecalculate }
)
export default class DutyTaxPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    head: PropTypes.shape({
      pre_entry_seq_no: PropTypes.string,
    }).isRequired,
  }
  state = {
    dataSource: [],
    total: {},
    loading: false,
  };
  componentDidMount() {
    this.handleReload();
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  handleCalculator = () => {
    this.setState({
      loading: true,
    });
    this.props.taxRecalculate(this.props.head.delg_no).then((result) => {
      if (!result.error) {
        this.setState({
          loading: false,
        });
        this.handleReload();
      }
    });
  }
  handleReload = () => {
    this.props.getDeclTax(this.props.head.pre_entry_seq_no).then((result) => {
      if (!result.error) {
        const summary = result.data.reduce((prev, next) => {
          const dutyTax = prev.dutyTax + Number(next.duty_tax);
          const vatTax = prev.vatTax + Number(next.vat_tax);
          const exciseTax = prev.exciseTax + Number(next.excise_tax);
          return {
            dutyTax,
            vatTax,
            exciseTax,
          };
        }, {
          dutyTax: 0,
          vatTax: 0,
          exciseTax: 0,
        });
        this.setState({
          dataSource: result.data,
          total: summary,
        });
      }
    });
  }
  render() {
    const columns = [{
      title: this.msg('seqNo'),
      dataIndex: 'g_no',
      width: 45,
      align: 'center',
      render: (o, record, index) => index + 1,
    }, {
      title: this.msg('hscode'),
      dataIndex: 'hscode',
      width: 110,
      render: (o, record) => record.code_t + record.code_s,
    }, {
      title: this.msg('gName'),
      dataIndex: 'g_name',
    }, {
      title: this.msg('origCountry'),
      width: 120,
    }, {
      title: this.msg('decTotal'),
      dataIndex: 'trade_tot',
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
      dataIndex: 'duty_paid',
      width: 150,
      align: 'right',
      render(o) {
        return o ? currencyFormatter.format(o, { code: 'CNY', precision: 4 }) : '';
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
      dataIndex: 'duty_tax',
      width: 150,
      align: 'right',
      render(o) {
        return o ? currencyFormatter.format(o, { code: 'CNY', precision: 4 }) : '';
      },
    }, {
      title: '增值税率',
      dataIndex: 'vat_rates',
      align: 'right',
      width: 100,
      render(o) {
        const val = o ? o * 100 : 0;
        return val ? `${val.toFixed(2)}%` : '';
      },
    }, {
      title: '增值税',
      dataIndex: 'vat_tax',
      width: 150,
      align: 'right',
      render(o) {
        return o ? currencyFormatter.format(o, { code: 'CNY', precision: 4 }) : '';
      },
    }, {
      title: '消费税率',
      dataIndex: 'gst_rates',
      align: 'right',
      width: 100,
      render(o) {
        const val = o ? o * 100 : 0;
        return val ? `${val.toFixed(2)}%` : '';
      },
    }, {
      title: '消费税',
      dataIndex: 'excise_tax',
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
        dataSource={this.state.dataSource}
        rowKey="id"
      >
        <DataPane.Toolbar>
          <Popconfirm title="确定重新估算?" onConfirm={this.handleCalculator}>
            <Button type="primary" ghost loading={this.state.loading} icon="calculator">{this.msg('estimate')}</Button>
          </Popconfirm>
          <DataPane.Extra>
            <Summary>
              <Summary.Item label="关税">{currencyFormatter.format(this.state.total.dutyTax, { code: 'CNY', precision: 4 })}</Summary.Item>
              <Summary.Item label="增值税">{currencyFormatter.format(this.state.total.vatTax, { code: 'CNY', precision: 4 })}</Summary.Item>
              <Summary.Item label="消费税">{currencyFormatter.format(this.state.total.exciseTax, { code: 'CNY', precision: 4 })}</Summary.Item>
            </Summary>
          </DataPane.Extra>
        </DataPane.Toolbar>
      </DataPane>
    );
  }
}
