import { messageRecords } from '../models/messages.db';
let corp_io;

function initialize(io) {
	corp_io = io.of('/corp');
	corp_io.on('connection', (socket) => {
		socket.on('room', (data) => {
			socket.join(String(data.tenantId));
		});
	});
}

/*
	from:
	{
		tenant_id,
		login_id,
		name,
	}
	to:
	{
		tenant_id,
		login_ids:[]
	}
	msg:
	{
		content: '',
		logo: '',
		url: ''
	}
	
*/

function sendMessage(from, to, msg) {
	if (!from) {
		throw new Error('params [from] was lost!');
	}
	if (!to) {
		throw new Error('params [to] was lost!');
	}
	if (!to.login_ids) {
		throw new Error('params [to] was incorrect! need [to.login_ids]');
	}
	if(!msg) {
		throw new Error('params [msg] was lost!');
	}
	let data = {
		tenant_id: to.tenant_id,
		from_tenant_id: from.tenant_id,
		from_login_id: from.login_id,
		from_name: from.name,
    content: msg.content,
    logo: msg.logo,
    url: msg.url,
	}
	corp_io.to(String(to.tenant_id)).emit('message',data);
	for (let i = 0; i < to.login_ids.length; i++) {
		recordMessage({...data, login_id: to.login_ids[i], status: 0, time: new Date()});
	}
}

function recordMessage(data) {
	messageRecords.create(data)
}

module.exports.initialize = initialize;
module.exports.sendMessage = sendMessage;