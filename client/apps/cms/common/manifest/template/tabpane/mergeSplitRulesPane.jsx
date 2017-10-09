import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Card, Form, Switch } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { loadHsCodeCategories } from 'common/reducers/cmsHsCode';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import MergeSplitForm from '../../form/mergeSplitRuleForm';

const formatMsg = format(messages);

const FormItem = Form.Item;

function fetchData({ state, dispatch }) {
  return dispatch(loadHsCodeCategories(state.account.tenantId));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    isCustomRegisted: !!state.cmsManifest.billHead.manual_no,
    hscodeCategories: state.cmsHsCode.hscodeCategories,
  })
)

export default class MergeSplitRulesPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    isCustomRegisted: PropTypes.bool.isRequired,
    hscodeCategories: PropTypes.array.isRequired,
    form: PropTypes.object.isRequired,
    formData: PropTypes.object.isRequired,
  }
  state = {
    mergeSplit: this.props.formData.set_merge_split,
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  handleOnChange = (checked) => {
    this.setState({ mergeSplit: checked });
  }
  render() {
    const { mergeSplit } = this.state;
    const { form, form: { getFieldDecorator }, formData } = this.props;
    return (
      <div className="pane">
        <div className="panel-header">
          <FormItem>{getFieldDecorator('set_merge_split')(
            <Switch checked={mergeSplit} onChange={this.handleOnChange} checkedChildren={'启用'} unCheckedChildren={'关闭'} />)}
          </FormItem>
        </div>
        <div className="pane-content">
          <Card bodyStyle={{ padding: 0 }} noHovering>
            <MergeSplitForm form={form} formData={formData} />
          </Card>
        </div>
      </div>
    );
  }
}
