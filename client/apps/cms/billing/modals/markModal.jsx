import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Modal, Table, Checkbox, message } from 'antd';
import { closeMarkModal, saveMarkstate } from 'common/reducers/cmsExpense';
import { formatMsg } from '../message.i18n';

function ColumnCheckbox(props) {
  const { record, field, onChange } = props;
  function handleChange(value) {
    if (onChange) {
      onChange(record, field, value);
    }
  }
  let checkStatus = false;
  if (record[field] === 1) {
    checkStatus = true;
  }
  const label = `${checkStatus ? '已结单' : '未结单'}`;
  return (
    <p style={{ marginBottom: '20px' }}>
      <Checkbox
        checked={checkStatus}
        onChange={handleChange}
      >
        {label}
      </Checkbox>
    </p>
  );
}
ColumnCheckbox.propTypes = {
  record: PropTypes.object.isRequired,
  field: PropTypes.string.isRequired,
  onChange: PropTypes.func,
};

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    showMarkModal: state.cmsExpense.showMarkModal,
  }),
  { closeMarkModal, saveMarkstate }
)
export default class MarkModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    showMarkModal: PropTypes.bool.isRequired,
    closeMarkModal: PropTypes.func.isRequired,
    data: PropTypes.array.isRequired,
  }
  msg = formatMsg(this.props.intl)
  columns = [
    {
      title: this.msg('delgNo'),
      dataIndex: 'delg_no',
    }, {
      title: this.msg('statementEn'),
      render: (o, record) => (
        <ColumnCheckbox field="status" record={record} onChange={this.handleOnChange} />
      ),
    },
  ];
  handleOnChange = (record, field, value) => {
    const checkStatus = value.target.checked;
    record[field] = checkStatus ? 1 : 0; // eslint-disable-line no-param-reassign
    this.forceUpdate();
  }
  handleCancel = () => {
    this.props.closeMarkModal();
  }
  handleSave = () => {
    this.props.saveMarkstate(this.props.data).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.props.closeMarkModal();
      }
    });
  }

  render() {
    const { showMarkModal, data } = this.props;
    return (
      <Modal
        maskClosable={false}
        visible={showMarkModal}
        title={this.msg('markState')}
        onCancel={this.handleCancel}
        onOk={this.handleSave}
      >
        <Table columns={this.columns} dataSource={data} pagination={false} scroll={{ y: 200 }} />
      </Modal>
    );
  }
}
