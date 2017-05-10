import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, Modal, message } from 'antd';
import { showEditBodyModal, editBillBody, loadBillBody, addNewBillBody } from 'common/reducers/cmsManifest';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import EditBodyForm from '../form/editBodyForm';


const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    editBodyVisible: state.cmsManifest.editBodyVisible,
    billBodies: state.cmsManifest.billBodies,
  }),
  { showEditBodyModal, editBillBody, loadBillBody, addNewBillBody }
)
@Form.create()
export default class EditBodyModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    editBody: PropTypes.object,
    editBodyVisible: PropTypes.bool.isRequired,
    billSeqNo: PropTypes.string,
  }
  handleCancel = () => {
    this.props.showEditBodyModal(false);
  }
  handleOk = () => {
    this.props.form.validateFields((errors) => {
      if (!errors) {
        const { tenantId, loginId, billSeqNo } = this.props;
        const values = this.props.form.getFieldsValue();
        if (this.props.editBody.id) {
          const body = { ...values, id: this.props.editBody.id };
          this.props.editBillBody(body).then((result) => {
            if (result.error) {
              message.error(result.error.message, 10);
            } else {
              this.props.loadBillBody(billSeqNo);
              this.props.showEditBodyModal(false);
              this.props.form.resetFields();
            }
          });
        } else {
          let gNO = 1;
          if (this.props.billBodies.length > 1) {
            gNO += this.props.billBodies[this.props.billBodies.length - 2].g_no;
          }
          const body = { ...values, g_no: gNO };
          this.props.addNewBillBody({ billSeqNo, body, loginId, tenantId }).then((result) => {
            if (result.error) {
              message.error(result.error.message, 10);
            } else {
              this.props.loadBillBody(billSeqNo);
              this.props.showEditBodyModal(false);
              this.props.form.resetFields();
            }
          });
        }
      }
    });
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  render() {
    const { editBodyVisible, form, editBody, billSeqNo } = this.props;
    return (
      <Modal visible={editBodyVisible} width={800} style={{ top: 24 }}
        onOk={this.handleOk} onCancel={this.handleCancel}
      >
        <EditBodyForm form={form} editBody={editBody} billSeqNo={billSeqNo} />
      </Modal>
    );
  }
}

