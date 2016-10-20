import React, { PropTypes, Component } from 'react';
import QueueAnim from 'rc-queue-anim';
import { connect } from 'react-redux';
import { Icon, Button, Select, Form, Popconfirm, message, Card, Table } from 'antd';
import { delgDispSave, delDisp, setSavedStatus } from 'common/reducers/cmsDelegation';
import { intlShape, injectIntl } from 'react-intl';
import messages from './message.i18n';
import { format } from 'client/common/i18n/helpers';
const formatMsg = format(messages);

const Option = Select.Option;
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 21 },
};
function noop() {}

function getFieldInits(dispatch) {
  const init = {};
  if (dispatch) {
    init.decl_name = dispatch.decl_name || '';
    init.insp_name = dispatch.insp_name || '';
    init.cert_name = dispatch.cert_name || '';
  }
  return init;
}

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
    <div className="pull-right">{button}</div>
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
    fieldInits: getFieldInits(state.cmsDelegation.dispatch),
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
    fieldInits: PropTypes.object.isRequired,
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
    this.props.delDisp(dispatch.delg_no, tenantId
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
    if (recv.insp_name === recv.decl_name) {
      if (recv.cert_name === recv.decl_name) {
        const pts = partners.filter(pt => pt.partner_id === recv.decl_name);
        let partner = {};
        if (pts.length === 1) {
          partner = pts[0];
          partner.server_type = '123';
          this.props.delgDispSave(delgDisp, dispatch, partner
          ).then(
            (result) => {
              if (result.error) {
                message.error(result.error.message);
              } else {
                this.props.setSavedStatus({ saved: true });
              }
            }
          );
        }
      } else {
        let pts = partners.filter(pt => pt.partner_id === recv.decl_name);
        let partner = {};
        if (pts.length === 1) {
          partner = pts[0];
          partner.server_type = '12';
          this.props.delgDispSave(delgDisp, dispatch, partner
          ).then(
            (result) => {
              if (result.error) {
                message.error(result.error.message);
              } else {
                this.props.setSavedStatus({ saved: true });
              }
            });
        }
        pts = partners.filter(pt => pt.partner_id === recv.cert_name);
        partner = {};
        if (pts.length === 1) {
          partner = pts[0];
          partner.server_type = '3';
          this.props.delgDispSave(delgDisp, dispatch, partner
          ).then(
            (result) => {
              if (result.error) {
                message.error(result.error.message);
              } else {
                this.props.setSavedStatus({ saved: true });
              }
            }
          );
        }
      }
    } else if (recv.cert_name === recv.decl_name) {
      const pts = partners.filter(pt => pt.partner_id === recv.decl_name);
      let partner = {};
      if (pts.length === 1) {
        partner = pts[0];
        partner.server_type = '13';
        this.props.delgDispSave(delgDisp, dispatch, partner
        ).then(
          (result) => {
            if (result.error) {
              message.error(result.error.message);
            } else {
              this.props.setSavedStatus({ saved: true });
            }
          }
        );
      }
    } else {
      let pts = partners.filter(pt => pt.partner_id === recv.decl_name);
      let partner = {};
      if (pts.length === 1) {
        partner = pts[0];
        partner.server_type = '1';
        this.props.delgDispSave(delgDisp, dispatch, partner
        ).then(
          (result) => {
            if (result.error) {
              message.error(result.error.message);
            } else {
              this.props.setSavedStatus({ saved: true });
            }
          });
      }
      pts = partners.filter(pt => pt.partner_id === recv.insp_name);
      partner = {};
      if (pts.length === 1) {
        partner = pts[0];
        partner.server_type = '2';
        this.props.delgDispSave(delgDisp, dispatch, partner
        ).then(
          (result) => {
            if (result.error) {
              message.error(result.error.message);
            } else {
              this.props.setSavedStatus({ saved: true });
            }
          });
      }
      pts = partners.filter(pt => pt.partner_id === recv.cert_name);
      partner = {};
      if (pts.length === 1) {
        partner = pts[0];
        partner.server_type = '3';
        this.props.delgDispSave(delgDisp, dispatch, partner
        ).then(
          (result) => {
            if (result.error) {
              message.error(result.error.message);
            } else {
              this.props.setSavedStatus({ saved: true });
            }
          }
        );
      }
    }
  }
  render() {
    const { form: { getFieldDecorator }, delgDisp, partners, show, saved, fieldInits } = this.props;
    const dataSource = [delgDisp];
    let dock = '';
    if (show) {
      dock = (
        <div className="dock-panel inside">
          <div className="panel-heading">
            <span className="title">{this.msg('delgDispatch')}</span>
            <div className="pull-right">
              <Button type="ghost" shape="circle-outline" onClick={this.onClose}>
                <Icon type="cross" />
              </Button>
            </div>
          </div>
          <Card>
            <Form>
              <FormItem label={this.msg('dispDecl')} {...formItemLayout}>
                {getFieldDecorator('decl_name', { initialValue: fieldInits.decl_name }
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
              <FormItem label={this.msg('dispInspect')} {...formItemLayout}>
                {getFieldDecorator('insp_name', { initialValue: fieldInits.insp_name }
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
              <FormItem label={this.msg('dispCert')} {...formItemLayout}>
                {getFieldDecorator('cert_name', { initialValue: fieldInits.cert_name }
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
            <Table columns={this.columns} dataSource={dataSource} pagination={false} />
          </Card>
          <div className="panel-footer">
            <ButtonSelect saved={saved} onconfirm={this.handleConfirm} onclick={this.handleSave} />
          </div>
        </div>
      );
    }
    return (
      <QueueAnim key="dock" animConfig={{ translateX: [0, 400], opacity: [1, 1] }}>{dock}</QueueAnim>
    );
  }
}
