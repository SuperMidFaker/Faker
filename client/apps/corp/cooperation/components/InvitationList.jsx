import React, { PropTypes } from 'react';
import { Radio } from 'ant-ui';
import ToInviteListContainer from '../containers/ToInviteListContainer';
import ReceiveInvitationListContainer from '../containers/ReceiveInvitationListContainer';
import SendInvitationListContainer from '../containers/SendInvitationListContainer';

const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

export default function InvitationList(props) {
  const { invitationType, onInvitationTypeChange } = props;
  const components = [
    <ToInviteListContainer />,
    <ReceiveInvitationListContainer />,
    <SendInvitationListContainer />,
  ];
  const content = components[invitationType];

  function handleInvitationTypeChange(e) {
    onInvitationTypeChange(e.target.value);
  }

  return (
    <div className="main-content">
      <div className="page-header">
        <RadioGroup defaultValue={invitationType} onChange={handleInvitationTypeChange} size="large">
          <RadioButton value="0">待邀请</RadioButton>
          <RadioButton value="1">收到的邀请</RadioButton>
          <RadioButton value="2">发出的邀请</RadioButton>
        </RadioGroup>
      </div>
      <div className="page-body">
        <div className="panel-header"></div>
        <div className="panel-body padding">
          {content}
        </div>
      </div>
    </div>
  );
}

InvitationList.propTypes = {
  invitationType: PropTypes.string.isRequired,        // 邀请的类型,'0', '1', '2'依次对应['待邀请', '发出的邀请', '收到的邀请']
};
