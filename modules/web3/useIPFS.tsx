import axios from 'axios';
import { useState } from 'react';

export const useIPFS = () => {
	const [metadata, setMetadata] = useState();

	const getMetadata = async (uri: string) => {
		try {
			const res = await axios.get(
				`${
					process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://ipfs.io'
				}/ipfs/${uri}`
			);
			setMetadata(res.data);
		} catch (err) {
			console.log(err);
		}
	};

	return { metadata, getMetadata };
};

export default useIPFS;
