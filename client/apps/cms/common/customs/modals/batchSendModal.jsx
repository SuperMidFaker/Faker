import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Select, message, Table } from 'antd';
import Expander from './expander';
import { sendMutiDecl, closeBatchSendModal } from 'common/reducers/cmsDeclare';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { CMS_DECL_TYPE, CMS_IMPORT_DECL_TYPE, CMS_EXPORT_DECL_TYPE } from 'common/constants';

const formatMsg = format(messages);
const Option = Select.Option;

function ColumnSelect(props) {
  const { record, field, options, onChange, index } = props;
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
    visible: state.cmsDeclare.batchSendModal.visible,
    data: state.cmsDeclare.batchSendModal.data,
    easilist: state.cmsDeclare.batchSendModal.easilist,
    agentCustCo: state.cmsManifest.sendDeclsModal.agentCustCo,
    loginId: state.account.loginId,
    loginName: state.account.username,
  }),
  { closeBatchSendModal, sendMutiDecl }
)
export default class BatchSendModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ietype: PropTypes.oneOf(['import', 'export']),
    tenantId: PropTypes.number.isRequired,
    subdomain: PropTypes.string.isRequired,
    data: PropTypes.object,
    visible: PropTypes.bool.isRequired,
    closeBatchSendModal: PropTypes.func.isRequired,
    reload: PropTypes.func,
  }
  state = {
    easipassList: [],
    bodies: [],
    expandDatas: {},
  };
  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data) {
      const custNames = Object.keys(nextProps.data);
      const bodies = custNames.map(value => ({
        agent_name: value,
        agent_custco: nextProps.data[value][0].agent_custco,
        declType: '',
        easipass: '',
      }));
      this.setState({ bodies, expandDatas: nextProps.data });
    }
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  handleCancel = () => {
    this.props.closeBatchSendModal();
  }
  handleOk = () => {
    const { subdomain, loginId, loginName } = this.props;
    const expDatas = Object.values(this.state.expandDatas);
    const sendVals = [];
    for (let i = 0; i < expDatas.length; i++) {
      for (let j = 0; j < expDatas[i].length; j++) {
        const data = expDatas[i][j];
        if (data.easipass && data.declType) {
          sendVals.push(data);
        } else {
          return message.error('单证类型、EDI 填写不完整', 5);
        }
      }
    }
    if (sendVals.length > 0) {
      this.props.sendMutiDecl({ values: sendVals, subdomain, loginId, username: loginName }).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          message.info('发送成功');
          this.props.closeBatchSendModal();
          this.props.reload();
        }
      });
    }
  }
  handleEditChange = (record, index, field, value) => {
    const bodies = this.state.bodies;
    bodies[index][field] = value;
    const row = bodies[index];
    const expandDatas = this.state.expandDatas;
    const expDatas = [...expandDatas[row.agent_name]];
    for (let i = 0; i < expDatas.length; i++) {
      expDatas[i][field] = value;
    }
    expandDatas[row.agent_name] = expDatas;
    this.setState({ bodies, expandDatas });
  }
  handleExpChange = (value) => {
    const expandDatas = this.state.expandDatas;
    expandDatas[value.custname] = value.changeData;
    this.setState({ expandDatas });
  }
  handleExpandDetail = (row) => {
    let declList = [];
    if (this.props.ietype === 'import') {
      declList = CMS_IMPORT_DECL_TYPE;
    } else if (this.props.ietype === 'export') {
      declList = CMS_EXPORT_DECL_TYPE;
    } else {
      declList = CMS_DECL_TYPE;
    }
    const subData = this.state.expandDatas[row.agent_name];
    return (<Expander custkey={row.agent_name} subData={subData} declList={declList} onchange={this.handleExpChange} />);
  };
  render() {
    const { visible, ietype, easilist } = this.props;
    let declList = [];
    if (ietype === 'import') {
      declList = CMS_IMPORT_DECL_TYPE;
    } else if (ietype === 'export') {
      declList = CMS_EXPORT_DECL_TYPE;
    } else {
      declList = CMS_DECL_TYPE;
    }
    const columns = [{
      title: this.msg('agent'),
      dataIndex: 'agent_name',
    }, {
      title: this.msg('declType'),
      width: 200,
      render: (o, record, index) =>
        (<ColumnSelect field="declType"
          onChange={this.handleEditChange} options={declList} record={record} index={index}
        />),
    }, {
      title: 'EDI',
      width: 200,
      render: (o, record, index) => {
        let easipassOpt = [];
        if (easilist[record.agent_custco]) {
          easipassOpt = easilist[record.agent_custco].map(easi => ({
            value: easi.app_uuid,
            text: easi.name,
          }));
        }
        return (
          <ColumnSelect field="easipass"
            onChange={this.handleEditChange} options={easipassOpt} record={record} index={index}
          />);
      },
    }];
    return (
      <Modal title={this.msg('sendBatchDeclMsgs')} visible={visible} width={800}
        onOk={this.handleOk} onCancel={this.handleCancel}
      >
        <Table size="middle" rowKey="agent_name" columns={columns} dataSource={this.state.bodies}
          expandedRowRender={this.handleExpandDetail}
        />
      </Modal>
    );
  }
}
