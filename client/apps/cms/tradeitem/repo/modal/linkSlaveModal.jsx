import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl';
import moment from 'moment';
import { Modal, message, Table } from 'antd';
import { showLinkSlaveModal, getUnlinkSlavesByOwner, linkMasterSlaves } from 'common/reducers/cmsTradeitem';
import { formatMsg } from '../../message.i18n';

@injectIntl
@connect(state => ({
  masterRepo: state.cmsTradeitem.linkSlaveModal.masterRepo,
  visible: state.cmsTradeitem.linkSlaveModal.visible,
  slaveList: state.cmsTradeitem.linkSlaveModal.slaves,
}),
  { showLinkSlaveModal, getUnlinkSlavesByOwner, linkMasterSlaves }
)
export default class LinkSlaveModal extends React.Component {
  static PropTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    showLinkSlaveModal: PropTypes.func.isRequired,
    getUnlinkSlavesByOwner: PropTypes.func.isRequired,
    linkMasterSlaves: PropTypes.func.isRequired,
  };
  componentWillReceiveProps(nextProps) {
    if (nextProps.masterRepo.owner_tenant_id !== this.props.masterRepo.owner_tenant_id) {
      this.props.getUnlinkSlavesByOwner(nextProps.masterRepo.owner_tenant_id);
    }
  }
  msg = formatMsg(this.props.intl)
  handleCancel = () => {
    this.props.showLinkSlaveModal({ masterRepo: {}, visible: false, slaves: [] });
  }
  handleOk = () => {
    const { masterRepo } = this.props;
    const { selectedRowKeys } = this.state;
    if (selectedRowKeys.length === 0) {
      message.error('未选择从库');
      return;
    }
    this.props.linkMasterSlaves(masterRepo.id, selectedRowKeys).then(
      (result) => {
        if (!result.error) {
          this.handleCancel();
          this.props.reload();
        } else {
          message.error(result.error.message, 10);
        }
      });
  }
  columns = [{
    title: '库创建者',
    dataIndex: 'creator_name',
  }, {
    title: '物料数',
    dataIndex: 'classified_num',
  }, {
    title: '最后更新时间',
    dataIndex: 'last_modified_date',
    render: (modifdate, row) => modifdate ? moment(modifdate).format('YYYY-MM-DD') : moment(row.created_date).format('YYYY-MM-DD'),
  }];
  render() {
    const { visible, slaveList } = this.props;
    const rowSelection = {
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    return (
      <Modal maskClosable={false} title={this.msg('linkSlave')} visible={visible} onCancel={this.handleCancel} onOk={this.handleOk}>
        <Table columns={this.columns} dataSource={slaveList} rowKey="id" rowSelection={rowSelection} />
      </Modal>
    );
  }
}

