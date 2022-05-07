import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Market, Market__factory } from '../../contracts/typechain';
import { Web3Context } from './Web3Provider';
import { BigNumber } from 'ethers';
import { getContractAddress, preferredChainId } from '../../utils/network';
import useIPFS from './useIPFS';

export enum State {
	ACTIVE,
	COMMITTED,
	VOID,
	SENT,
	RECEIVED,
	DISPUTED,
	CLOSED
}

export type Trade = {
	status: State;
	seller: string;
	currency: string;
	amount: BigNumber;
	expiry: BigNumber;
	buyer: string;
	voider: string;
	unlocks: BigNumber;
};

export const useMarket = () => {
	const web3 = useContext(Web3Context);

	const contract = useRef<Market>();

	const [trade, setTrade] = useState<Trade>();

	const { metadata, getMetadata } = useIPFS();

	useEffect(() => {
		if (!web3?.ethereum.current) return;
		if (web3.chainId !== preferredChainId) return;

		contract.current = Market__factory.connect(
			getContractAddress(web3.chainId, 'Market'),
			web3?.ethereum.current.getSigner()
		);
	}, [web3]);

	const getTrade = useCallback(
		async (id: number): Promise<Trade | undefined> => {
			if (!contract.current) return;
			try {
				const trade = await contract.current.get(id);
				setTrade(trade);
				getMetadata(trade.uri);
			} catch (err) {
				console.log(err);
			}
		},
		[web3, contract]
	);

	return { contract, trade, metadata, getTrade };
};

export default useMarket;
