import React, { PropTypes } from 'react';
import { Radio } from 'ant-ui';
import ToInviteList from './ToInviteList';
import ReceiveInvitationList from './ReceiveInvitationList';
import SendInvitationList from './SendInvitationList';

const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

export default function InvitationList(props) {
  const { invitationType, onInvitationTypeChange, toInvites, sendInvitations,
    receiveInvitations, onInviteBtnClick, onCancelInviteBtnClick,
    onAcceptBtnClick, onRejectBtnClick
  } = props;
  const components = [
    <ToInviteList toInvites={toInvites} onInviteBtnClick={onInviteBtnClick}/>,
    <ReceiveInvitationList receiveInvitations={receiveInvitations}
    onAcceptBtnClick={onAcceptBtnClick} onRejectBtnClick={onRejectBtnClick}
    />,
    <SendInvitationList sendInvitations={sendInvitations}
    onCancelInviteBtnClick={onCancelInviteBtnClick}
    />,
  ];
  const content = components[invitationType];

  function handleInvitationTypeChange(e) {
    onInvitationTypeChange(e.target.value);
  }

  return (
    <div className="main-content">
      <div className="page-header">
        <RadioGroup defaultValue={invitationType} onChange={handleInvitationTypeChange}>
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
  toInvites: PropTypes.array.isRequired,              // 待邀请的列表数组
  sendInvitations: PropTypes.array.isRequired,        // 发送的邀请的列表数组
  receiveInvitations: PropTypes.array.isRequired,     // 收到的邀请
  onInviteBtnClick: PropTypes.func.isRequired,        // 邀请加入按钮点击时执行的回调函数
  onCancelInviteBtnClick: PropTypes.func.isRequired,  // 取消邀请按钮点击后执行的回调函数
  onRejectBtnClick: PropTypes.func.isRequired,
  onAcceptBtnClick: PropTypes.func.isRequired
};
