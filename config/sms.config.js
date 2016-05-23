const SmsConfig = {
  formatSmsMsg(code) {
	  return `尊敬的用户,你的验证码为${code},感谢您使用[趣摩云物流]`;
  },
	cloopen: {
		url : "https://app.cloopen.com",
		port : "8883",
		ver : "2013-12-26",
		templateId : "1110",
		templateId_vie: "9238",
		accountSid:"ff8080813e4458bb013e779e0e890173",
		authToken:"7b9cc308e53a41e0b037abeeabf62ee8",
		subAccountSid:"ff8080813e445bb6013e779fd9ec0122",
		subToken:"06b62b8ab96a41fab6534d9f4350f8d5",
		appid:"ff8080813f5039eb013f5576757c02ba"
	}
}
export default SmsConfig;
