import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Form, Col, Button, Popconfirm, Row, message, Layout } from 'antd';
import { editDelegation } from 'common/reducers/cmsDelegation';
import connectNav from 'client/common/decorators/connect-nav';

import MainForm from './forms/mainForm';
import SiderForm from './forms/siderForm';
import UploadGroup from './forms/attachmentUpload';
import { formatMsg } from './message.i18n';


const { Header, Content } = Layout;

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
  moduleName: 'clearance',
})
@Form.create()
export default class EditDelegation extends Component {
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
  msg = formatMsg(this.props.intl)
  handleSave = ({ isAccepted }) => {
    this.props.form.validateFields((errors) => {
      if (!errors) {
        const { type, formData } = this.props;
        const { addedFiles, removedFiles } = this.state;
        const delegation = { ...formData, ...this.props.form.getFieldsValue() };
        this.props.editDelegation({
          delegation,
          addedFiles,
          removedFiles,
          patnershipType: 'CCB',
          accepted: isAccepted,
          ietype: type === 'import' ? 0 : 1,
        }).then((result) => {
          if (result.error) {
            message.error(result.error.message, 10);
          } else {
            this.context.router.push(`/clearance/${type}/`);
          }
        });
      }
    });
  }
  handleCancel = () => {
    this.context.router.push(`/clearance/${this.props.type}/`);
  }

  handleSave = () => {
    this.handleSave({ isAccepted: false });
  }
  handleSaveAccept = () => {
    this.handleSave({ isAccepted: true });
  }
  handleUploadFiles = (file) => {
    this.setState({
      addedFiles: [...this.state.addedFiles, file],
    });
  }
  handleFileRemove = (file) => {
    const filters = this.state.addedFiles.filter(af => af.uid !== file.uid);
    if (filters.length !== this.state.addedFiles.length && this.state.addedFiles.length > 0) {
      this.setState({ addedFiles: filters });
    } else {
      this.setState({ removedFiles: [...this.state.removedFiles, file] });
    }
  }
  render() {
    const { form, type, submitting } = this.props;
    return (
      <div>
        <Header className="page-header">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.props.ietype === 'import' ? this.msg('importClearance') : this.msg('exportClearance')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('delgManifest')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('modifyDelegation')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="page-header-tools">
            <Button type="ghost" onClick={this.handleCancel}>
              {this.msg('cancel')}
            </Button>
            <Button type="primary" onClick={this.handleSave} loading={submitting}>
              {this.msg('save')}
            </Button>
          </div>
        </Header>
        <Content className="main-content layout-fixed-width layout-fixed-width-lg">
          <Form layout="horizontal" form={form}>
            <Row gutter={16}>
              <Col sm={24} md={16}>
                <MainForm form={form} ieType={type} partnershipType="CCB" />
              </Col>
              <Col sm={24} md={8}>
                <SiderForm form={form} />
                <UploadGroup onFileListUpdate={this.handleUploadFiles} />
              </Col>
            </Row>
          </Form>
          <Row type="flex" className="bottom-bar">
            <Col className="col-flex-primary" />
            <Col className="col-flex-secondary">
              <Popconfirm title={this.msg('deleteConfirm')} onConfirm={() => this.handleDelgDel()}>
                <Button type="danger" ghost>删除</Button>
              </Popconfirm>
            </Col>
          </Row>
        </Content>
      </div>
    );
  }
}
