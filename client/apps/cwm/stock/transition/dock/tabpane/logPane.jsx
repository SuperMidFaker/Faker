import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Table } from 'antd';
import { intlShape, injectIntl } from 'react-intl';


@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,

  }),
  { }
)
export default class LogPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  state = {
    tabKey: '',
    logs: [],
  }

  render() {
    const { logs } = this.state;
    return (
      <div className="pane-content tab-pane">
        <Table dataSource={logs} />
      </div>
    );
  }
}
