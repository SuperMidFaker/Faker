import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form, Col, Button, Row, Popconfirm, message } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import BasicForm from './forms/basicForm';
import SubForm from './forms/SubForm';
import UploadGroup from './forms/attachmentUpload';
import { editDelegation } from 'common/reducers/cmsDelegation';
import { intlShape, injectIntl } from 'react-intl';
import messages from './message.i18n';
import { format } from 'client/common/i18n/helpers';
const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    formData: state.cmsDelegation.formData,
    submitting: state.cmsDelegation.submitting,
  }),
  { editDelegation }
)
@connectNav({
  depth: 3,
  text: '委托信息修改',
  moduleName: 'clearance',
})
@Form.create()
export default class AcceptanceEdit extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    type: PropTypes.oneOf(['import', 'export']),
    form: PropTypes.object.isRequired,
    formData: PropTypes.object.isRequired,
    submitting: PropTypes.bool.isRequired,
    editDelegation: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    addedFiles: [],
    removedFiles: [],
  }
  msg = key => formatMsg(this.props.intl, key);
  handleSave = ({ isAccepted }) => {
    this.props.form.validateFields((errors) => {
      if (!errors) {
        const { type, formData } = this.props;
        const { addedFiles, removedFiles } = this.state;
        const formdatas = this.props.form.getFieldsValue();
        const subformArray = [];
        for (const i of formdatas.keys) {
          subformArray.push({
            decl_way_code: formdatas[`decl_way_code_${i}`],
            manual_no: formdatas[`manual_no_${i}`],
            pack_count: formdatas[`pack_count_${i}`],
            gross_wt: formdatas[`gross_wt_${i}`],
          });
        }
        const delegation = { ...formData, ...this.props.form.getFieldsValue() };
        delegation.subforms = subformArray;
        this.props.editDelegation({
          delegation, addedFiles, removedFiles, patnershipType: 'CCB',
          accepted: isAccepted, ietype: type === 'import' ? 0 : 1,
        }).then((result) => {
          if (result.error) {
            message.error(result.error.message);
          } else {
            this.context.router.push(`/clearance/${type}/`);
          }
        });
      }
    });
  }
  handleSaveBtnClick = () => {
    this.handleSave({ isAccepted: false });
  }
  handleSaveAccept = () => {
    this.handleSave({ isAccepted: true });
  }
  handleUploadedFile = (file) => {
    this.setState({
      addedFiles: [...this.state.addedFiles, file],
    });
  }
  handleFileRemove = (file) => {
    const filters = this.state.addedFiles.filter(af => af.uid !== file.uid);
    if (filters.length !== this.state.addedFiles.length) {
      this.setState({ addedFiles: filters });
    } else {
      this.setState({ removedFiles: [...this.state.removedFiles, file] });
    }
  }
  render() {
    const { form, type, submitting } = this.props;
    return (
      <div>
        <header className="top-bar">
          <span>修改委托</span>
        </header>
        <div className="top-bar-tools">
          <Button size="large" type="primary"
            onClick={this.handleSaveBtnClick} loading={submitting}
          >
            {this.msg('save')}
          </Button>
        </div>
        <div className="main-content">
          <div className="page-body card-wrapper">
            <Form horizontal form={form}>
              <Row gutter={16}>
                <Col sm={18}>
                  <BasicForm form={form} ieType={type} partnershipType="CCB" />
                  <SubForm form={form} ietype={type} />
                </Col>
                <Col sm={6}>
                  <UploadGroup onFileListUpdate={this.handleUploadFiles} onFileRemove={this.handleFileRemove} />
                </Col>
              </Row>
            </Form>
          </div>
        </div>
      </div>
    );
  }
}
