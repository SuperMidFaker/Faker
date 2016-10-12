import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Collapse, Form, Button, message } from 'antd';
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
const Panel = Collapse.Panel;

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
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  billListPanelHeader = (
    <span>
      {this.msg('billList')}
      <ExcelUpload endpoint={''} formData={{
        bill_seq_no: this.props.billHead.bill_seq_no,
        tenant_id: this.props.tenantId,
        creater_login_id: this.props.loginId,
      }} onUploaded={this.handleUploaded}
      >
        <Button type="primary" style={{ marginLeft: 5, paddingTop: -2 }}>Import</Button>
      </ExcelUpload>
    </span>
  )
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
    return (<div>
      <div className="panel-body collapse fixed-height">
        <Collapse accordion defaultActiveKey="bill-head" style={{ marginBottom: 46 }}>
          <Panel header={<span>{this.msg('billHeader')}</span>} key="bill-head">
            <BillHead ietype={ietype} readonly={readonly} form={form} formData={billHead} />
          </Panel>
          <Panel header={/* this.msg('billList') */this.billListPanelHeader} key="bill-list">
            <BillBody ietype={ietype} readonly={readonly} data={billBody} headNo={billHead.bill_seq_no}
              onAdd={actions.addNewBillBody} onDel={actions.delBillBody} onEdit={actions.editBillBody}
              billSeqNo={billHead.bill_seq_no}
            />
          </Panel>
        </Collapse>
      </div>
      <div className="panel-footer">
        {!readonly &&
          <Button type="primary" onClick={this.handleBillSave} icon="save">
            {formatGlobalMsg(this.props.intl, 'save')}
          </Button>
        }
      </div>
    </div>);
  }
}
