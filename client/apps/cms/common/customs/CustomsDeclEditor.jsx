import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form, Breadcrumb, Button, Dropdown, Menu, Radio, Icon, message } from 'antd';
import QueueAnim from 'rc-queue-anim';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import { fillEntryId } from 'common/reducers/cmsDelegation';
import SheetHeadPanel from '../forms/SheetHeadPanel';
import SheetBodyPanel from '../forms/SheetBodyPanel';
import ExtraDock from '../modals/extraDock';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

@injectIntl
@connect(
  state => ({
    billMeta: state.cmsManifest.billMeta,
    head: state.cmsManifest.entryHead,
    bodies: state.cmsManifest.entryBodies,
  }),
  { fillEntryId }
)
@connectNav({
  depth: 3,
  moduleName: 'clearance',
})
@Form.create()
export default class CustomsDeclEditor extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ietype: PropTypes.oneOf(['import', 'export']),
    billMeta: PropTypes.shape({
      bill_seq_no: PropTypes.string.isRequired,
      entries: PropTypes.arrayOf(PropTypes.shape({ pre_entry_seq_no: PropTypes.string })),
      editable: PropTypes.bool.isRequired,
    }),
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    visible: false,
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  lockMenu = (
    <Menu>
      <Menu.Item key="lock"><Icon type="lock" /> 锁定</Menu.Item>
      <Menu.Item key="delete"><Icon type="delete" /> 删除(不可恢复)</Menu.Item>
    </Menu>);
  handleDock = () => {
    this.setState({ visible: true });
  }
  handleManifestVisit = (ev) => {
    const { ietype, billMeta } = this.props;
    if (ev.key === 'bill') {
      let action = 'view';
      if (billMeta.editable) {
        action = 'make';
      }
      const pathname = `/clearance/${ietype}/manifest/${action}/${billMeta.bill_seq_no}`;
      this.context.router.push({ pathname });
    } else {
      const pathname = `/clearance/${ietype}/customs/${billMeta.bill_seq_no}/${ev.key}`;
      this.context.router.push({ pathname });
    }
  }
  handleEntryHeadSave = () => {
    const entryNo = this.props.form.getFieldsValue().entry_id;
    const { head } = this.props;
    this.props.fillEntryId({ entryNo, entryHeadId: head.id,
      billSeqNo: head.bill_seq_no, delgNo: head.delg_no }).then((result) => {
        if (result.error) {
          message.error(result.error.message);
        }
      });
  }
  render() {
    const { ietype, form, head, bodies, billMeta } = this.props;
    const readonly = billMeta.editable;
    const manifestMenu = (<Menu onClick={this.handleManifestVisit}>
      {[<Menu.Item key="bill"><Icon type="book" />报关清单{billMeta.bill_seq_no}</Menu.Item>,
        <Menu.Divider key="divider" />].concat(
        billMeta.entries.map(bme => (<Menu.Item key={bme.pre_entry_seq_no}>
          <Icon type="file-text" />报关单{bme.entry_id || bme.pre_entry_seq_no}</Menu.Item>)
      ))}
    </Menu>);
    return (
      <QueueAnim type={['bottom', 'up']}>
        <header className="top-bar" key="header">
          <Breadcrumb>
            <Breadcrumb.Item>
              制单
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Dropdown overlay={manifestMenu}>
                <a style={{ fontSize: 14 }}>报关清单<Icon type="down" /></a>
              </Dropdown>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              报关单{head.entry_id || head.pre_entry_seq_no}
            </Breadcrumb.Item>
          </Breadcrumb>
          <RadioGroup onChange={this.handleDelegationFilter}>
            <RadioButton value="all"><Icon type="right-square-o" /></RadioButton>
            <RadioButton value="accept"><Icon type="left-square" /></RadioButton>
          </RadioGroup>
        </header>
        <div className="top-bar-tools">
          <Dropdown overlay={this.lockMenu}>
            <Button type="ghost">
              <Icon type="setting" /> <Icon type="down" />
            </Button>
          </Dropdown>
        </div>
        <div className="main-content">
          <div className="page-body tabbed fixed-height">
            <div className={`panel-body card-wrapper ${readonly ? 'readonly' : ''}`}>
              <SheetHeadPanel ietype={ietype} readonly={readonly} form={form} formData={head} type="entry" onSave={this.handleEntryHeadSave} />
              <SheetBodyPanel ietype={ietype} readonly={readonly} data={bodies}
                headNo={head.id} billSeqNo={head.bill_seq_no} type="entry"
              />
            </div>
          </div>
        </div>
        <ExtraDock visible={this.state.visible} />
      </QueueAnim>
    );
  }
}
