require('dotenv').config();

import * as ping from 'ping';
import devices from './devices';
import lineBotClient from './line-bot-client';
import axios, { AxiosInstance, AxiosResponse } from 'axios';

const axiosInstance: AxiosInstance = axios.create({
	headers: {
		'Connection': 'keep-alive',
		'Accept-Encoding': 'gzip, deflate, br'
	}
});

function main() {
	Object.keys(devices).forEach(function (name) {
		ping.promise.probe(devices[name]).then((result: ping.PingResponse) => {
			if(!result.alive) {
				lineBotClient.pushMessage(process.env.LINE_USER_ID, `${name} is down`)
				.catch((error) => {
					console.log(`Line error: ${error}`);
				});
			}
		}).catch((error) => {
			console.log(`Ping error: ${error}`);
		});
	});

	axiosInstance.get(process.env.ALIVE_URL).catch(() => {});

	setTimeout(main, parseInt(process.env.WAIT_TIMEOUT_MIN) * 60000);
}

main()