import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Popover, Table } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { loadSpecialCharges } from 'common/reducers/transportBilling';
import messages from '../message.i18n';
import { format } from 'client/common/i18n/helpers';
const formatMsg = format(messages);

@injectIntl
@connect(
  () => ({
  }),
  {
    loadSpecialCharges,
  }
)

export default class SpecialChargePopover extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    dispId: PropTypes.number.isRequired,
    shipmtNo: PropTypes.string.isRequired,
    loadSpecialCharges: PropTypes.func.isRequired,
  }
  state = {
    dataSource: [],
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  handleMouseOver = () => {
    const { dispId } = this.props;
    this.props.loadSpecialCharges(dispId).then((result) => {
      this.setState({ dataSource: result.data.data });
    });
  }
  render() {
    const columns = [{
      title: '金额',
      dataIndex: 'amount',
      render: o => this.props.intl.formatNumber(o, {
        style: 'currency',
        currency: 'CNY',
      }),
    }, {
      title: '提交者',
      dataIndex: 'submitter',
    }, {
      title: '备注',
      dataIndex: 'remark',
    }];
    const content = (
      <div>
        <Table columns={columns} dataSource={this.state.dataSource} rowKey="id" size="small" pagination={false} showHeader={false} />
      </div>
    );
    return (
      <Popover placement="rightTop" title="特殊费用" content={content} trigger="hover">
        <a onMouseOver={this.handleMouseOver}>
          {this.props.children}
        </a>
      </Popover>
    );
  }
}
