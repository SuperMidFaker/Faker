import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { Button, Select, Form, Popconfirm, message, Card, Table } from 'antd';
import { delgDispSave, delDisp, setSavedStatus } from 'common/reducers/cmsDelegation';
import { intlShape, injectIntl } from 'react-intl';
import messages from './message.i18n';
import { format } from 'client/common/i18n/helpers';
const formatMsg = format(messages);

const Option = Select.Option;
const FormItem = Form.Item;

function noop() {}

function ButtonSelect(props) {
  const { saved, onconfirm, onclick } = props;
  let button = '';
  if (saved) {
    button = (
      <Popconfirm title="你确定撤回分配吗?" onConfirm={onconfirm} >
        <Button size="large">撤销</Button>
      </Popconfirm>
      );
  } else {
    button = (
      <Button size="large" type="primary" onClick={onclick}>
          分配
      </Button>
      );
  }
  return (
    <div>{button}</div>
   );
}
ButtonSelect.PropTypes = {
  saved: PropTypes.bool.isRequired,
  onconfirm: PropTypes.func,
  onclick: PropTypes.func,
};

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    delgDisp: state.cmsDelegation.delgDisp,
    dispatch: state.cmsDelegation.dispatch,
    partners: state.cmsDelegation.partners,
    saved: state.cmsDelegation.saved,
  }),
  { delgDispSave, delDisp, setSavedStatus }
)
@Form.create()
export default class DelgDispatch extends Component {
  static PropTypes = {
    intl: intlShape.isRequired,
    onClose: PropTypes.func.isRequired,
    delgDisp: PropTypes.object.isRequired,
    dispatch: PropTypes.object.isRequired,
    partners: PropTypes.array.isRequired,
    saved: PropTypes.bool.isRequired,
    form: PropTypes.object.isRequired,
    delgDispSave: PropTypes.func.isRequired,
    delDisp: PropTypes.func.isRequired,
    setSavedStatus: PropTypes.func.isRequired,
  }
  constructor(props) {
    super(props);
    this.onClose = this.props.onClose || noop;
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: this.msg('delgNo'),
    dataIndex: 'delg_no',
  }, {
    title: this.msg('delgClient'),
    dataIndex: 'customer_name',
  }, {
    title: this.msg('deliveryNo'),
    dataIndex: 'bl_wb_no',
  }]
  handleConfirm = () => {
    const { dispatch, tenantId } = this.props;
    this.props.delDisp(dispatch.delg_no, tenantId, dispatch.recv_server_type
    ).then(
      (result) => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          this.props.setSavedStatus({ saved: false });
        }
      }
    );
  }

  handleSave = () => {
    const { delgDisp, dispatch, partners } = this.props;
    const recv = this.props.form.getFieldsValue();
    let partner = {};
    if (recv.recv_name === dispatch.recv_name) {
      partner.name = dispatch.recv_name;
      partner.tid = dispatch.recv_tenant_id;
      partner.partner_id = dispatch.recv_partner_id;
    } else {
      const pts = partners.filter(pt => pt.partner_id === recv.recv_name);
      if (pts.length === 1) {
        partner = pts[0];
      }
    }
    this.props.delgDispSave(delgDisp, dispatch, partner
    ).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        this.props.setSavedStatus({ saved: true });
      }
    });
  }
  render() {
    const { form: { getFieldDecorator }, delgDisp, partners, show, saved, dispatch } = this.props;
    const dataSource = [delgDisp];
    const closer = (
      <button
        onClick={this.onClose}
        aria-label="Close"
        className="ant-modal-close"
      >
        <span className="ant-modal-close-x" />
      </button>);
    let title = '';
    let label = '';
    if (dispatch.type === 'delg') {
      title = this.msg('delgDispatch');
      label = this.msg('dispDecl');
    } else if (dispatch.type === 'ciq') {
      title = this.msg('ciqDispatch');
      label = this.msg('dispciq');
    } else if (dispatch.type === 'cert') {
      title = this.msg('certDispatch');
      label = this.msg('dispCert');
    }


    return (
        <div className={`dock-panel ${show ? 'inside' : ''}`}>
          <div className="panel-content">
            <div className="header">
              <span className="title">{title}</span>
              <div className="pull-right">
                {closer}
              </div>
            </div>
            <div className="body">
              <Card>
                <Form vertical>
                  <FormItem label={label}>
                    {getFieldDecorator('recv_name', { initialValue: dispatch.recv_name }
                    )(<Select
                      showSearch
                      showArrow
                      optionFilterProp="searched"
                      placeholder={this.msg('dispatchMessage')}
                      style={{ width: '80%' }}
                    >
                      {
                      partners.map(pt => (
                        <Option searched={`${pt.partner_code}${pt.name}`}
                          value={pt.partner_id} key={pt.partner_id}
                        >
                          {pt.name}
                        </Option>)
                      )
                    }
                    </Select>)}
                  </FormItem>
                </Form>
                <Table size="small" columns={this.columns} dataSource={dataSource} pagination={false} />
              </Card>
              <ButtonSelect saved={saved} onconfirm={this.handleConfirm} onclick={this.handleSave} />
            </div>
          </div>
        </div>
      );
    }
}
