import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Collapse, Form, Button, message } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import HeadForm from './headForm';
import BodyTable from './bodyList';
import { addNewBillBody, delBillBody, editBillBody, saveBill } from 'common/reducers/cmsDeclare';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import globalMessage from 'client/common/root.i18n';
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
    billBodyCreated: state.cmsDeclare.billBodyCreated,
    billBodyDeleted: state.cmsDeclare.billBodyDeleted,
    billBodyEdited: state.cmsDeclare.billBodyEdited,
    loginId: state.account.loginId,
  }),
  { addNewBillBody, delBillBody, editBillBody, saveBill }
)
@Form.create()
export default class BillForm extends React.Component {
  static propTypes = {
    ietype: PropTypes.string.isRequired,
    intl: intlShape.isRequired,
    readonly: PropTypes.bool,
    form: PropTypes.object.isRequired,
    billHead: PropTypes.object.isRequired,
    billBodyCreated: PropTypes.array.isRequired,
    billBodyDeleted: PropTypes.array.isRequired,
    billBodyEdited: PropTypes.array.isRequired,
    loginId: PropTypes.number.isRequired,
    addNewBillBody: PropTypes.func.isRequired,
    delBillBody: PropTypes.func.isRequired,
    editBillBody: PropTypes.func.isRequired,
    saveBill: PropTypes.func.isRequired,
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  handleBillSave = (ev) => {
    ev.preventDefault();
    this.props.form.validateFieldsAndScroll(errors => {
      if (!errors) {
        const {
          billHead, billBodyCreated, billBodyDeleted,
          billBodyEdited, ietype, loginId,
        } = this.props;
        const head = { ...billHead, ...this.props.form.getFieldsValue() };
        this.props.saveBill(
          head, billBodyCreated, billBodyDeleted,
          billBodyEdited, ietype, loginId
        ).then(
          result => {
            if (result.error) {
              message.error(result.error.message);
            }
          }
        );
      }
    });
  }
  render() {
    const {
      ietype, readonly, form, billHead, billBody,
      ...actions,
    } = this.props;
    return (<div>
      <Button type="primary" onClick={this.handleBillSave}
        style={{ marginLeft: '10px', marginBottom: '10px'}}>
        {formatGlobalMsg(this.props.intl, 'save')}
      </Button>
      <Collapse accordion defaultActiveKey="bill-head">
        <Panel header={<span>{this.msg('billHeader')}</span>} key="bill-head">
          <BillHead ietype={ietype} readonly={readonly} form={form} formData={billHead}
          />
        </Panel>
        <Panel header={this.msg('billList')} key="bill-list">
          <BillBody ietype={ietype} readonly={readonly} data={billBody}
            onAdd={actions.addNewBillBody} onDel={actions.delBillBody}
            onEdit={actions.editBillBody} />
        </Panel>
      </Collapse>
    </div>);
  }
}
