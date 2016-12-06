import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Form, Mention, message } from 'antd';
import { closeAcceptModal, acceptDelg, loadDelgOperators, setPreviewStatus } from 'common/reducers/cmsDelegation';

const FormItem = Form.Item;
const Nav = Mention.Nav;
const getMentions = Mention.getMentions;
@injectIntl
@connect(
  state => ({
    visible: state.cmsDelegation.acceptModal.visible,
    tenantId: state.cmsDelegation.acceptModal.tenantId,
    type: state.cmsDelegation.acceptModal.type,
    delgDispIds: state.cmsDelegation.acceptModal.dispatchIds,
    delgOperators: state.cmsDelegation.acceptModal.operators,
  }),
  { closeAcceptModal, acceptDelg, loadDelgOperators, setPreviewStatus }
)
@Form.create()
export default class DelgAcceptModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    type: PropTypes.oneOf(['delg', 'ciq']),
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
        this.props.acceptDelg(
          operator.lid, operator.name, this.props.delgDispIds
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
      callback(new Error('请选择一个操作员'));
    } else {
      callback();
    }
  }
  render() {
    const { visible, form: { getFieldDecorator } } = this.props;
    return (
      <Modal visible={visible} onOk={this.handleAccept}
        onCancel={this.handleCancel}
      >
        <Form horizontal>
          <FormItem label="操作员" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
            {
              getFieldDecorator('operator', {
                rules: [{ validator: this.checkMentionOperator }],
              })(
                <Mention suggestions={this.state.suggestions}
                  onSearchChange={this.handleSearch} placeholder="@操作员名称"
                />
              )
            }
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
