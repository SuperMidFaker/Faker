import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Collapse, Form, Button, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import HeadForm from './headForm';
import BodyTable from './bodyList';
import { addNewEntryBody, delEntryBody, editEntryBody,
  saveEntryHead, delEntry } from 'common/reducers/cmsDeclare';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import globalMessage from 'client/common/root.i18n';
const formatMsg = format(messages);
const formatGlobalMsg = format(globalMessage);

function BillHead(props) {
  return <HeadForm {...props} type="entry" />;
}
BillHead.propTypes = {
  ietype: PropTypes.string.isRequired,
  readonly: PropTypes.bool,
  form: PropTypes.object.isRequired,
  formData: PropTypes.object.isRequired,
};

function BillBody(props) {
  return <BodyTable {...props} type="entry" />;
}
BillBody.propTypes = {
  ietype: PropTypes.string.isRequired,
  readonly: PropTypes.bool,
  data: PropTypes.array.isRequired,
  headNo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onAdd: PropTypes.func.isRequired,
  onDel: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};
const Panel = Collapse.Panel;

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    tenantId: state.account.tenantId,
  }),
  { addNewEntryBody, delEntryBody, editEntryBody, saveEntryHead, delEntry }
)
@Form.create()
export default class EntryForm extends React.Component {
  static propTypes = {
    ietype: PropTypes.string.isRequired,
    intl: intlShape.isRequired,
    readonly: PropTypes.bool,
    form: PropTypes.object.isRequired,
    entry: PropTypes.object.isRequired,
    totalCount: PropTypes.number.isRequired,
    index: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    tenantId: PropTypes.number.isRequired,
    addNewEntryBody: PropTypes.func.isRequired,
    delEntryBody: PropTypes.func.isRequired,
    editEntryBody: PropTypes.func.isRequired,
    saveEntryHead: PropTypes.func.isRequired,
    delEntry: PropTypes.func.isRequired,
  }
  state = {
    head_id: undefined,
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  handleEntryHeadSave = (ev) => {
    ev.preventDefault();
    this.props.form.validateFields(errors => {
      if (!errors) {
        const { entry, totalCount, ietype, tenantId, loginId } = this.props;
        const head = {
          ...entry.head, ...this.props.form.getFieldsValue(),
          id: entry.head.id || this.state.head_id,
        };
        this.props.saveEntryHead({ head, totalCount, loginId, ietype, tenantId }).then(
          result => {
            if (result.error) {
              message.error(result.error.message);
            } else {
              message.info('更新成功');
              if (result.data.id !== head.id) {
                this.setState({ head_id: result.data.id });
              }
            }
          }
        );
      }
    });
  }
  handleEntryDel = () => {
    const headId = this.props.entry.head.id || this.state.head_id;
    if (headId) {
      this.props.delEntry(headId, this.props.index).then(result => {
        if (result.error) {
          message.error(result.error.message);
        }
      });
    }
  }
  render() {
    const { ietype, readonly, form, entry, ...actions } = this.props;
    const head = entry.head;
    return (<div>
      <div className="panel-body padding fixed-height">
        <Collapse accordion defaultActiveKey="entry-head" style={{ marginBottom: 46 }}>
          <Panel header={<span>{this.msg('entryHeader')}</span>} key="entry-head">
            <BillHead ietype={ietype} readonly={readonly} form={form} formData={head} />
          </Panel>
          <Panel header={this.msg('entryList')} key="entry-list">
            <BillBody ietype={ietype} readonly={readonly} data={entry.bodies}
              onAdd={actions.addNewEntryBody} onDel={actions.delEntryBody}
              onEdit={actions.editEntryBody} headNo={head.id || this.state.head_id}
              billSeqNo={head.bill_seq_no}
            />
          </Panel>
        </Collapse>
      </div>
      <div className="panel-footer">
        {!readonly &&
          <Button type="primary" onClick={this.handleEntryHeadSave} icon="save" size="small">
            {formatGlobalMsg(this.props.intl, 'save')}
          </Button>
        }
        {!readonly &&
          <Button type="ghost" icon="delete" size="small" onClick={this.handleEntryDel} />
        }
      </div>
    </div>);
  }
}
