import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Card, Form, Switch } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { loadHsCodeCategories } from 'common/reducers/cmsHsCode';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import MergeSplitForm from '../../form/mergeSplitRuleForm';

const formatMsg = format(messages);

const FormItem = Form.Item;

function fetchData({ state, dispatch }) {
  return dispatch(loadHsCodeCategories(state.account.tenantId));
}

function getFieldInits(formData) {
  const init = { ...formData, mergeOpt_arr: [], specialHsSortArr: [] };
  if (formData.merge_byhscode) {
    init.mergeOpt_arr.push('byHsCode');
  }
  if (formData.merge_bygname) {
    init.mergeOpt_arr.push('byGName');
  }
  if (formData.merge_bycurr) {
    init.mergeOpt_arr.push('byCurr');
  }
  if (formData.merge_bycountry) {
    init.mergeOpt_arr.push('byCountry');
  }
  if (formData.merge_bycopgno) {
    init.mergeOpt_arr.push('byCopGNo');
  }
  if (formData.merge_byengno) {
    init.mergeOpt_arr.push('byEmGNo');
  }
  if (formData.split_spl_category) {
    const splArr = formData.split_spl_category.split(',');
    splArr.forEach((data) => {
      const numData = Number(data);
      init.specialHsSortArr.push(numData);
    });
  }
  init.split_percount = formData.split_percount ? formData.split_percount.toString() : '20';
  return init;
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    isCustomRegisted: !!state.cmsManifest.billHead.manual_no,
    hscodeCategories: state.cmsHsCode.hscodeCategories,
    fieldInits: getFieldInits(state.cmsManifest.formData),
  })
)

export default class MergeSplitModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    isCustomRegisted: PropTypes.bool.isRequired,
    hscodeCategories: PropTypes.array.isRequired,
    form: PropTypes.object.isRequired,
    formData: PropTypes.object.isRequired,
  }
  state = {
    mergeSplit: true,
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  handleOnChange = (checked) => {
    this.setState({ mergeSplit: checked });
  }
  render() {
    const { mergeSplit } = this.state;
    const { form, form: { getFieldDecorator }, fieldInits } = this.props;
    return (
      <div className="pane">
        <div className="panel-header">
          <FormItem>{getFieldDecorator('set_merge_split')(
            <Switch checked={mergeSplit} onChange={this.handleOnChange} checkedChildren={'启用'} unCheckedChildren={'关闭'} />)}
          </FormItem>
        </div>
        <div className="pane-content">
          <Card bodyStyle={{ padding: 0 }}>
            <MergeSplitForm form={form} formData={fieldInits} />
          </Card>
        </div>
      </div>
    );
  }
}
