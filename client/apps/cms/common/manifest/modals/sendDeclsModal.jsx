import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Select, message, Table } from 'antd';
import { getEasipassList, sendMutiDecl } from 'common/reducers/cmsDeclare';
import { showSendDeclsModal } from 'common/reducers/cmsManifest';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { CMS_IMPORT_DECL_TYPE, CMS_EXPORT_DECL_TYPE } from 'common/constants';
const formatMsg = format(messages);
const Option = Select.Option;

function ColumnSelect(props) {
  const {
    record, field, options, onChange, index,
  } = props;
  function handleChange(value) {
    if (onChange) {
      onChange(record, index, field, value);
    }
  }
  return (
    <Select showArrow optionFilterProp="search" value={record[field] || ''} onChange={handleChange} style={{ width: '100%' }}>
      {
        options.map(opt => <Option value={opt.value} key={`${opt.value}`}>{`${opt.text}`}</Option>)
      }
    </Select>
  );
}

ColumnSelect.proptypes = {
  record: PropTypes.object.isRequired,
  index: PropTypes.number,
  field: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  options: PropTypes.array.isRequired,
};

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    subdomain: state.account.subdomain,
    visible: state.cmsManifest.sendDeclsModal.visible,
    preEntrySeqNo: state.cmsManifest.sendDeclsModal.preEntrySeqNo,
    delgNo: state.cmsManifest.sendDeclsModal.delgNo,
    agentCustCo: state.cmsManifest.sendDeclsModal.agentCustCo,
    loginId: state.account.loginId,
    loginName: state.account.username,
  }),
  { showSendDeclsModal, getEasipassList, sendMutiDecl }
)
export default class SendDeclsModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ietype: PropTypes.oneOf(['import', 'export']),
    tenantId: PropTypes.number.isRequired,
    subdomain: PropTypes.string.isRequired,
    visible: PropTypes.bool.isRequired,
    preEntrySeqNo: PropTypes.string.isRequired,
    delgNo: PropTypes.string.isRequired,
    showSendDeclsModal: PropTypes.func.isRequired,
    getEasipassList: PropTypes.func.isRequired,
    reload: PropTypes.func,
    entries: PropTypes.array,
  }
  state = {
    easipassList: [],
    bodies: [],
  };
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && !this.props.visible) {
      this.props.getEasipassList(nextProps.tenantId, nextProps.agentCustCo).then((result) => {
        this.setState({ easipassList: result.data });
      });
    }
    if (nextProps.entries !== this.props.entries) {
      const bodies = nextProps.entries.map(entry => ({
        pre_entry_seq_no: entry.pre_entry_seq_no,
        declType: '',
        easipass: '',
      }));
      this.setState({ bodies });
    }
  }
  handleCancel = () => {
    this.props.showSendDeclsModal({ visible: false });
  }
  handleOk = () => {
    const {
      delgNo, subdomain, loginId, loginName,
    } = this.props;
    const values = this.state.bodies.map(val => ({
      delg_no: delgNo,
      pre_entry_seq_no: val.pre_entry_seq_no,
      easipass: val.easipass,
      declType: val.declType,
    }));
    this.props.sendMutiDecl({
      values, subdomain, loginId, username: loginName,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        message.info('发送成功');
        this.props.showSendDeclsModal({ visible: false });
        this.props.reload();
      }
    });
  }
  handleEditChange = (record, index, field, value) => {
    record[field] = value; // eslint-disable-line no-param-reassign
    this.forceUpdate();
    const bodies = this.state.bodies;
    bodies[index] = record;
    this.setState({ bodies });
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  render() {
    const { visible, ietype } = this.props;
    const easipassOpt = this.state.easipassList.map(easi => ({
      value: easi.app_uuid,
      text: easi.name,
    }));
    let declList = [];
    if (ietype === 'import') {
      declList = CMS_IMPORT_DECL_TYPE;
    } else if (ietype === 'export') {
      declList = CMS_EXPORT_DECL_TYPE;
    }
    const columns = [{
      title: this.msg('统一编号'),
      width: 150,
      dataIndex: 'pre_entry_seq_no',
    }, {
      title: this.msg('declType'),
      render: (o, record, index) =>
        (<ColumnSelect field="declType"
          onChange={this.handleEditChange} options={declList} record={record} index={index}
        />),
    }, {
      title: 'EDI',
      render: (o, record, index) =>
        (<ColumnSelect field="easipass"
          onChange={this.handleEditChange} options={easipassOpt} record={record} index={index}
        />),
    }];
    return (
      <Modal maskClosable={false} title={this.msg('sendAllPackets')} visible={visible} width={800}
        onOk={this.handleOk} onCancel={this.handleCancel}
      >
        <Table size="middle" rowKey="id" columns={columns} dataSource={this.state.bodies} />
      </Modal>
    );
  }
}

