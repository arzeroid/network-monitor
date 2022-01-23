import * as express from 'express';
import {Express} from 'express-serve-static-core';
import * as ping from 'ping';
import * as http from 'http';
import * as bodyParser from 'body-parser';
import { RequestBody, ResponseBody } from './interfaces';

const app: Express = express();

app.use(bodyParser.json());

app.post('/', (req, res) => {

	try{
		const body: RequestBody = <RequestBody> req.body;
		console.log(body);

		const promises: Array<Promise<ping.PingResponse>> = [];
		body.ping_urls.forEach(function (url) {
			promises.push(ping.promise.probe(url));
		});

		Promise.all(promises).then(pingResponse => {
			console.log(pingResponse);
			const response: Array<ResponseBody> = pingResponse.map(element => {
				return {
					host: element.host,
					alive: element.alive,
					time: element.time,
				};
			});

			res.json(response);
		});
	}catch(error){
		console.log(error);
		res.json(error);
	}
});

const httpServer: http.Server = http.createServer(app);
httpServer.listen(3000, () => {
	console.log('HTTP Server running on port 3000');
});