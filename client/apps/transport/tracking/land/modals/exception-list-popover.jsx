import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Popover, Table, Icon } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { loadExceptions } from 'common/reducers/trackingLandException';
import { TRANSPORT_EXCEPTIONS } from '../../../eventTypes';
import messages from '../message.i18n';
import { format } from 'client/common/i18n/helpers';
const formatMsg = format(messages);

@injectIntl
@connect(
  () => ({
  }),
  {
    loadExceptions,
  }
)

export default class ExceptionListPopover extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    excpCount: PropTypes.number.isRequired,
    dispId: PropTypes.number.isRequired,
    shipmtNo: PropTypes.string.isRequired,
    loadExceptions: PropTypes.func.isRequired,
    onShowExcpModal: PropTypes.func.isRequired,
    shipmt: PropTypes.object.isRequired,
  }
  state = {
    exceptions: [],
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  handleMouseOver = () => {
    const { shipmtNo } = this.props;
    this.props.loadExceptions({
      shipmtNo,
      pageSize: 9999,
      currentPage: 1,
    }).then((result) => {
      this.setState({ exceptions: result.data.data });
    });
  }
  render() {
    const { excpCount, shipmt } = this.props;
    const columns = [{
      dataIndex: 'excp_level',
      render: (o) => {
        if (o === 'INFO') {
          return (<Icon type="info-circle" className="sign-info" />);
        } else if (o === 'WARN') {
          return (<Icon type="exclamation-circle" className="sign-warning" />);
        } else if (o === 'ERROR') {
          return (<Icon type="cross-circle" className="sign-error" />);
        }
        return o;
      },
    }, {
      title: this.msg('exceptionType'),
      dataIndex: 'type',
      render: (o) => {
        const t = TRANSPORT_EXCEPTIONS.find(item => item.code === o);
        return t ? t.name : '';
      },
    }, {
      title: this.msg('exceptionDescription'),
      dataIndex: 'excp_event',
      render: (o, record) => {
        if (record.charge === null || record.charge === 0) {
          return o;
        } else {
          return `费用金额 ${record.charge.toFixed(2)} 元, ${o}`;
        }
      },
    }];
    const content = (
      <div>
        <Table columns={columns} dataSource={this.state.exceptions} rowKey="id" size="middle" pagination={false} showHeader={false} />
      </div>
    );
    return (
      <Popover placement="rightTop" title={`异常 ${shipmt.shipmt_no}`} content={content} trigger="hover">
        <a onMouseOver={this.handleMouseOver} style={{ textDecoration: 'underline' }} onClick={() => this.props.onShowExcpModal(shipmt)}>
        {excpCount}
        </a>
      </Popover>
    );
  }
}
