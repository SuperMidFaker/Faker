import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Button, Layout, Table } from 'antd';
import { showWhseMembers, loadwhseOwners } from 'common/reducers/cwmWarehouse';
import OwnersModal from '../modal/ownersModal';
import { formatMsg } from '../message.i18n';

const { Content } = Layout;

@injectIntl
@connect(
  state => ({
    whseOwners: state.cwmWarehouse.whseOwners,
  }),
  { showWhseMembers, loadwhseOwners }
)
export default class OwnersPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    whseCode: PropTypes.string.isRequired,
    whseTenantId: PropTypes.number.isRequired,
    whseOwners: PropTypes.array,
  }
  state = {
    selectedRowKeys: [],
  }
  componentWillMount() {
    this.props.loadwhseOwners(this.props.whseCode);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.whseCode !== this.props.whseCode) {
      this.props.loadwhseOwners(nextProps.whseCode);
    }
  }
  columns = [{
    title: '货主名称',
    dataIndex: 'owner_name',
  }, {
    title: '操作',
  }]
  msg = formatMsg(this.props.intl)
  render() {
    const { whseCode, whseTenantId, whseOwners } = this.props;
    return (
      <Content>
        <div className="toolbar">
          <Button type="primary" ghost icon="plus-circle" onClick={() => this.props.showWhseMembers()}>添加货主</Button>
        </div>
        <Table columns={this.columns} dataSource={whseOwners} />
        <OwnersModal whseCode={whseCode} whseTenantId={whseTenantId} whseOwners={whseOwners} />
      </Content>
    );
  }
}
