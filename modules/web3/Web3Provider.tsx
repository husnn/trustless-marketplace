import React, { useEffect, useRef, useState } from 'react';

import { ethers } from 'ethers';
import { WrongNetwork } from '../../components/WrongNetwork';
import { getNetworkParams, preferredChainId } from '../../utils/network';

type Web3ContextProps = {
	ethereum: React.RefObject<ethers.providers.Web3Provider | undefined>;
	chainId: number;
};

export const Web3Context = React.createContext<Web3ContextProps | undefined>(
	undefined
);

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
	const ethereum = useRef<ethers.providers.Web3Provider>();

	const [chainId, setChainId] = useState<number>(-1);

	useEffect(() => {
		if (ethereum.current) return;
		if (typeof (window as any).ethereum === 'undefined') return;

		ethereum.current = new ethers.providers.Web3Provider(
			(window as any).ethereum,
			'any'
		);

		function handleChainChange(id: number) {
			setChainId(id);
			console.log('Chain set to: ' + id);
		}

		(ethereum.current?.provider as any)?.on('chainChanged', (id: string) =>
			handleChainChange(parseInt(id, 16))
		);

		ethereum.current
			.getNetwork()
			.then((net) => handleChainChange(net.chainId))
			.catch((err) => console.log(err));
	}, []);

	const addNetwork = (chainId: number) => {
		const params = getNetworkParams(chainId);

		if (!ethereum.current?.provider?.request) return;

		ethereum.current?.provider.request({
			method: 'wallet_addEthereumChain',
			params: [
				{
					...params,
					chainId: ethers.utils.hexValue(chainId)
				}
			]
		});
	};

	const switchNetwork = (chainId: number) => {
		if (!ethereum.current?.provider?.request) return;

		ethereum.current?.provider
			.request({
				method: 'wallet_switchEthereumChain',
				params: [
					{
						chainId: ethers.utils.hexValue(chainId)
					}
				]
			})
			.catch((err) => {
				if (err.code == 4902) addNetwork(chainId);
			});
	};

	return (
		<Web3Context.Provider value={{ ethereum, chainId }}>
			{chainId > -1 && (
				<WrongNetwork
					preferred={preferredChainId}
					actual={chainId}
					onSwitch={switchNetwork}
				/>
			)}
			{children}
		</Web3Context.Provider>
	);
};
