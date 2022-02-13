require('dotenv').config();

import * as ping from 'ping';
import devices from './devices';
import axios, { AxiosInstance, AxiosResponse } from 'axios';

const axiosInstance: AxiosInstance = axios.create({
	headers: {
		'Connection': 'keep-alive',
		'Accept-Encoding': 'gzip, deflate, br'
	}
});
const PING_TIMES: number = parseInt(process.env.PING_TIMES);
console.log(PING_TIMES);
async function main() {
	const promises: Array<Promise<string>> = Object.keys(devices).map(async (name) => {
		let count = 0;

		try {
			for (let i = 0; i < PING_TIMES; i++) {
				let pingResponse: ping.PingResponse = await ping.promise.probe(devices[name]);
				console.log(name, i, pingResponse.alive);
				if(pingResponse.alive){
					count++;
				}
			}
			console.log(name, count);

			if(count < PING_TIMES / 2) {
				return `${name} is down`;
			}
		} catch(reason) {
			return JSON.stringify(reason);
		}
	});

	console.log(new Date().toLocaleString());
	let data: Array<string> = await Promise.all(promises);

	data = data.filter(item => item !== undefined);
	console.log(data);

	try {
		const response: AxiosResponse = await axiosInstance.post(process.env.ALIVE_URL, {
				userId: process.env.LINE_USER_ID,
				data: data
			})
		console.log(response.data);
	}catch(error) {
			console.log(error);
	}

	setTimeout(main, parseInt(process.env.WAIT_TIMEOUT_MIN) * 60000);
}

main()