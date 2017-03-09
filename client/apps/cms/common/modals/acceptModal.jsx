import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Form, Mention, message } from 'antd';
import { closeAcceptModal, acceptDelg, loadDelgOperators, setOpetaor } from 'common/reducers/cmsDelegation';
import { setPreviewStatus, loadCustPanel, loadDeclCiqPanel } from 'common/reducers/cmsDelgInfoHub';

const FormItem = Form.Item;
const Nav = Mention.Nav;
const getMentions = Mention.getMentions;
@injectIntl
@connect(
  state => ({
    visible: state.cmsDelegation.acceptModal.visible,
    tenantId: state.cmsDelegation.acceptModal.tenantId,
    type: state.cmsDelegation.acceptModal.type,
    opt: state.cmsDelegation.acceptModal.opt,
    delgDispIds: state.cmsDelegation.acceptModal.dispatchIds,
    delg_no: state.cmsDelegation.acceptModal.delg_no,
    delgOperators: state.cmsDelegation.acceptModal.operators,
  }),
  { closeAcceptModal, acceptDelg, loadDelgOperators, setPreviewStatus,
    setOpetaor, loadCustPanel, loadDeclCiqPanel }
)
@Form.create()
export default class DelgAcceptModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    type: PropTypes.oneOf(['delg', 'ciq']),
    opt: PropTypes.oneOf(['accept', 'operator']),
    tenantId: PropTypes.number.isRequired,
    delgDispIds: PropTypes.arrayOf(PropTypes.number),
    delgOperators: PropTypes.arrayOf(PropTypes.shape({
      lid: PropTypes.number,
      name: PropTypes.string,
    })),
    closeAcceptModal: PropTypes.func.isRequired,
    acceptDelg: PropTypes.func.isRequired,
    loadDelgOperators: PropTypes.func.isRequired,
  }
  state = {
    suggestions: [],
  }
  componentDidMount() {
    if (this.props.tenantId) {
      this.props.loadDelgOperators(this.props.tenantId);
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.tenantId && nextProps.tenantId !== this.props.tenantId) {
      nextProps.loadDelgOperators(nextProps.tenantId);
    }
  }
  handleAccept = () => {
    this.props.form.validateFields((errors) => {
      if (!errors) {
        const name = Mention.getMentions(this.props.form.getFieldValue('operator'))[0].slice(1);
        const operator = this.props.delgOperators.filter(dop => dop.name === name)[0];
        if (this.props.opt === 'accept') {
          this.props.acceptDelg(
            operator.lid, operator.name, this.props.delgDispIds, this.props.delg_no
          ).then((result) => {
            if (result.error) {
              message.error(result.error.message);
            } else {
              if (this.props.type === 'delg') {
                this.props.setPreviewStatus({ preStatus: 'accepted' });
              } else if (this.props.type === 'ciq') {
                this.props.setPreviewStatus({ preStatus: 'ciqaccepted' });
              }
              this.props.closeAcceptModal();
            }
          });
        } else if (this.props.opt === 'operator') {
          this.props.setOpetaor(
            operator.lid, operator.name, this.props.delgDispIds, this.props.delg_no
          ).then((result) => {
            if (result.error) {
              message.error(result.error.message);
            } else {
              if (this.props.type === 'delg') {
                this.props.loadCustPanel({
                  delgNo: this.props.delg_no, tenantId: this.props.tenantId,
                });
              } else if (this.props.type === 'ciq') {
                this.props.loadDeclCiqPanel(this.props.delg_no, this.props.tenantId);
              }
              this.props.closeAcceptModal();
            }
          });
        }
      }
    });
  }
  handleCancel = () => {
    this.props.closeAcceptModal();
  }
  handleSearch = (value) => {
    const searchValue = value.toLowerCase();
    const filtered = this.props.delgOperators.filter(item =>
        item.name.toLowerCase().indexOf(searchValue) !== -1
    );
    const suggestions = filtered.map(suggestion =>
      <Nav value={suggestion.name} data={suggestion}>
        <span>{suggestion.name}</span>
      </Nav>);
    this.setState({ suggestions });
  }
  checkMentionOperator = (rule, value, callback) => {
    const values = this.props.form.getFieldValue('operator');
    const mentions = getMentions(values);
    if (mentions.length !== 1 || mentions[0] === '@') {
      callback(new Error('请选择负责该笔业务的制单人'));
    } else {
      callback();
    }
  }
  render() {
    const { visible, form: { getFieldDecorator } } = this.props;
    return (
      <Modal title="接单" visible={visible} onOk={this.handleAccept}
        onCancel={this.handleCancel}
      >
        <Form layout="horizontal">
          <FormItem label="制单人" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
            {
              getFieldDecorator('operator', {
                rules: [{ validator: this.checkMentionOperator }],
              })(
                <Mention suggestions={this.state.suggestions}
                  onSearchChange={this.handleSearch} placeholder="@制单人"
                />
              )
            }
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
