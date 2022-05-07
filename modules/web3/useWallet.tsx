import { useContext, useEffect, useState } from 'react';
import { Web3Context } from './Web3Provider';

export const useWallet = () => {
	const web3 = useContext(Web3Context);
	const [account, setAccount] = useState<string>();

	useEffect(() => {
		web3?.ethereum.current
			?.listAccounts()
			.then((accounts) => handleAccountChange(accounts))
			.catch((err) => console.log(err));

		function handleAccountChange(accounts: string[]) {
			console.log(accounts);
			if (accounts.length > 0) setAccount(accounts[0]);
		}

		(web3?.ethereum?.current?.provider as any)?.on(
			'accountsChanged',
			handleAccountChange
		);

		return () => {
			(web3?.ethereum?.current?.provider as any)?.removeListener(
				'accountsChanged',
				handleAccountChange
			);
		};
	}, []);

	const init = () => {
		web3?.ethereum?.current
			?.send('eth_requestAccounts', [])
			.then((accounts) => {
				if (accounts.length > 0) setAccount(accounts[0]);
				return;
			})
			.catch((err) => console.log(err));
	};

	const signMessage = (msg: string): Promise<string> | undefined => {
		return web3?.ethereum.current?.getSigner().signMessage(msg);
	};

	return { init, account, signMessage };
};

export default useWallet;
