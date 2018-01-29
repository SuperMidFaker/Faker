import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Table } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import SubCustomerModal from '../modals/subCustomerModal';
import { showSubCustomerModal } from 'common/reducers/sofCustomers';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
  }),
  { showSubCustomerModal }
)
@connectNav({
  depth: 2,
  moduleName: 'scof',
})

export default class SubCustomerList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    showSubCustomerModal: PropTypes.func.isRequired,
    customer: PropTypes.object.isRequired,
  }
  state = {
    currentPage: 1,
  }
  msg = key => formatMsg(this.props.intl, key)
  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  }
  render() {
    const { customer } = this.props;
    const columns = [{
      dataIndex: 'name',
      key: 'name',
      render: o => (<div style={{ paddingLeft: 15 }}>{o}</div>),
    }];
    return (
      <div className="pane">
        <div className="pull-right">
          <Button onClick={() => this.props.showSubCustomerModal('add', customer)}>添加</Button>
        </div>
        <div className="panel-body table-panel table-fixed-layout">
          <Table
            size="small"
            dataSource={customer.subCustomers}
            columns={columns}
            showHeader={false}
            pagination={{ current: this.state.currentPage, defaultPageSize: 15, onChange: this.handlePageChange }}
            rowKey="id"
          />
        </div>
        <SubCustomerModal onOk={() => {}} />
      </div>
    );
  }
}
