import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Collapse, Form, Button } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import HeadForm from './headForm';
import BodyTable from './bodyList';
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
  data: PropTypes.array,
};
const Panel = Collapse.Panel;

@injectIntl
@connect(
  state => ({
    billHead: state.cmsDeclare.billHead,
    billBody: state.cmsDeclare.billBody,
  })
)
@Form.create()
export default class BillForm extends React.Component {
  static propTypes = {
    ietype: PropTypes.string.isRequired,
    intl: intlShape.isRequired,
    readonly: PropTypes.bool,
    form: PropTypes.object.isRequired,
    billHead: PropTypes.object.isRequired,
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  BillHeader = (
    <div>
      <span style={{ paddingRight: '20px' }}>{this.msg('billHeader')}</span>
      <Button type="primary">{formatGlobalMsg(this.props.intl, 'save')}</Button>
    </div>
  )
  render() {
    const { ietype, readonly, form, billHead, billBody } = this.props;
    return (
      <Collapse accordion defaultActiveKey="bill-head">
        <Panel header={this.BillHeader} key="bill-head">
          <BillHead ietype={ietype} readonly={readonly} form={form} formData={billHead}
          />
        </Panel>
        <Panel header={this.msg('billList')} key="bill-list">
          <BillBody ietype={ietype} readonly={readonly} data={billBody} />
        </Panel>
      </Collapse>
    );
  }
}
