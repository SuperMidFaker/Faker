import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Card, Form, Button, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import HeadForm from './headForm';
import BodyTable from './bodyList';
import ExcelUpload from 'client/components/excelUploader';
import { addNewBillBody, delBillBody, editBillBody, saveBillHead, loadBillBodyList } from 'common/reducers/cmsDeclare';
import { format } from 'client/common/i18n/helpers';
import globalMessage from 'client/common/root.i18n';
import messages from '../message.i18n';

const formatMsg = format(messages);
const formatGlobalMsg = format(globalMessage);

function BillHead(props) {
  return <HeadForm {...props} type="bill" />;
}
BillHead.propTypes = {
  ietype: PropTypes.string.isRequired,
  readonly: PropTypes.bool,
  form: PropTypes.object.isRequired,
  formData: PropTypes.object.isRequired,
};

function BillBody(props) {
  return <BodyTable {...props} type="bill" />;
}
BillBody.propTypes = {
  ietype: PropTypes.string.isRequired,
  readonly: PropTypes.bool,
  data: PropTypes.array.isRequired,
  headNo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  billSeqNo: PropTypes.string,
  onAdd: PropTypes.func.isRequired,
  onDel: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};

@injectIntl
@connect(
  state => ({
    billHead: state.cmsDeclare.billHead,
    billBody: state.cmsDeclare.billBody,
    loginId: state.account.loginId,
    tenantId: state.account.tenantId,
  }),
  { addNewBillBody, delBillBody, editBillBody, saveBillHead, loadBillBodyList }
)
@Form.create()
export default class BillForm extends React.Component {
  static propTypes = {
    ietype: PropTypes.string.isRequired,
    intl: intlShape.isRequired,
    readonly: PropTypes.bool,
    tenantId: PropTypes.number.isRequired,
    form: PropTypes.object.isRequired,
    billHead: PropTypes.object.isRequired,
    loginId: PropTypes.number.isRequired,
    addNewBillBody: PropTypes.func.isRequired,
    delBillBody: PropTypes.func.isRequired,
    editBillBody: PropTypes.func.isRequired,
    saveBillHead: PropTypes.func.isRequired,
    loadBillBodyList: PropTypes.func.isRequired,
  }
  componentWillReceiveProps(nextProps) {
    if (!nextProps.readonly && nextProps.billHead !== this.props.billHead) {
      this.billListPanelHeader = (
        <ExcelUpload endpoint={`${API_ROOTS.default}v1/cms/declare/billbody/import`}
          formData={{
            data: JSON.stringify({
              bill_seq_no: this.props.billHead.bill_seq_no,
              tenant_id: this.props.tenantId,
              creater_login_id: this.props.loginId,
            }),
          }} onUploaded={this.handleUploaded}
        >
          <Button type="primary" size="small" icon="file-excel">{formatGlobalMsg(this.props.intl, 'import')}</Button>
        </ExcelUpload>
      );
    }
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  handleUploaded = () => {
    this.props.loadBillBodyList({ billSeqNo: this.props.billHead.bill_seq_no });
  }
  handleBillSave = (ev) => {
    ev.preventDefault();
    // todo bill head save sync with entry head, vice verse
    this.props.form.validateFields((errors) => {
      if (!errors) {
        const { billHead, ietype, loginId, tenantId } = this.props;
        const head = { ...billHead, ...this.props.form.getFieldsValue() };
        this.props.saveBillHead({ head, ietype, loginId, tenantId }).then(
          (result) => {
            if (result.error) {
              message.error(result.error.message);
            } else {
              message.info('更新成功');
            }
          }
        );
      }
    });
  }
  render() {
    const { ietype, readonly, form, billHead, billBody, ...actions } = this.props;
    return (
      <div className={`page-body ${readonly ? 'readonly' : ''}`}>
        <div className="panel-header">
          {!readonly &&
          <Button type="primary" onClick={this.handleBillSave} icon="save">
            {formatGlobalMsg(this.props.intl, 'save')}
          </Button>}
          <span />
          <ExcelUpload endpoint={`${API_ROOTS.default}v1/cms/declare/billbody/import`}
            formData={{
              data: JSON.stringify({
                bill_seq_no: this.props.billHead.bill_seq_no,
                tenant_id: this.props.tenantId,
                creater_login_id: this.props.loginId,
              }),
            }} onUploaded={this.handleUploaded}
          >
            <Button icon="file-excel">{this.msg('importBody')}</Button>
          </ExcelUpload>
        </div>
        <div className="panel-body card-wrapper">
          <Card bodyStyle={{ padding: 8 }}>
            <BillHead ietype={ietype} readonly={readonly} form={form} formData={billHead} />
          </Card>
          <Card bodyStyle={{ padding: 0 }}>
            <BillBody ietype={ietype} readonly={readonly} data={billBody} headNo={billHead.bill_seq_no}
              onAdd={actions.addNewBillBody} onDel={actions.delBillBody} onEdit={actions.editBillBody}
              billSeqNo={billHead.bill_seq_no}
            />
          </Card>
        </div>
      </div>);
  }
}
