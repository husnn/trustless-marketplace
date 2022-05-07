import { create } from 'ipfs-http-client';
import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';

const auth =
	'Basic ' +
	Buffer.from(
		process.env.INFURA_IPFS_PROJECT_ID +
			':' +
			process.env.INFURA_IPFS_PROJECT_SECRET
	).toString('base64');

const client = create({
	host: 'ipfs.infura.io',
	port: 5001,
	apiPath: 'api/v0',
	protocol: 'https',
	headers: {
		authorization: auth
	}
});

const handler = nc<NextApiRequest, NextApiResponse>({
	onError: (err, req, res, next) => {
		console.error(err.stack);
		res.status(500).end('Something broke!');
	},
	onNoMatch: (req, res) => {
		res.status(404).end('Page is not found');
	}
}).post((req, res) => {
	const { condition, name, description } = req.body;

	client
		.add(Buffer.from(JSON.stringify({ condition, name, description })))
		.then((pin) => res.send(pin.path));
});

export default handler;
