import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import SheetHeadPanel from '../../forms/SheetHeadPanel';
import SheetBodyPanel from '../../forms/SheetBodyPanel';
import { addNewBillBody, delBillBody, editBillBody, saveBillHead, loadBillBodyList } from 'common/reducers/cmsDeclare';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);

function BillSheetHeadPanel(props) {
  return <SheetHeadPanel {...props} type="bill" />;
}
BillSheetHeadPanel.propTypes = {
  ietype: PropTypes.string.isRequired,
  readonly: PropTypes.bool,
  form: PropTypes.object.isRequired,
  formData: PropTypes.object.isRequired,
};

function BillSheetBodyPanel(props) {
  return <SheetBodyPanel {...props} type="bill" />;
}
BillSheetBodyPanel.propTypes = {
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
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  render() {
    const { ietype, readonly, form, billHead, billBody, ...actions } = this.props;
    return (
      <div className="page-body">
        <div className={`panel-body collapse ${readonly ? 'readonly' : ''}`}>
          <BillSheetHeadPanel ietype={ietype} readonly={readonly} form={form} formData={billHead} />
          <BillSheetBodyPanel ietype={ietype} readonly={readonly} data={billBody} headNo={billHead.bill_seq_no}
            onAdd={actions.addNewBillBody} onDel={actions.delBillBody} onEdit={actions.editBillBody}
            billSeqNo={billHead.bill_seq_no}
          />
        </div>
      </div>);
  }
}
