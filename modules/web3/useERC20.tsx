import { BigNumber } from 'ethers';
import { useContext, useEffect, useRef, useState } from 'react';
import { ERC20, ERC20__factory } from '../../contracts/typechain';
import { getContractAddress, preferredChainId } from '../../utils/network';
import useWallet from './useWallet';
import { Web3Context } from './Web3Provider';

export const useERC20 = () => {
	const web3 = useContext(Web3Context);
	const { account } = useWallet();

	const [balance, setBalance] = useState<BigNumber>();

	const contract = useRef<ERC20>();

	useEffect(() => {
		if (!web3?.ethereum.current || !account) return;
		if (web3.chainId !== preferredChainId) return;

		contract.current = ERC20__factory.connect(
			getContractAddress(web3.chainId, 'ERC20'),
			web3?.ethereum.current.getSigner()
		);

		contract.current
			.balanceOf(account)
			.then((bal) => setBalance(bal))
			.catch((err) => console.log(err));
	}, [web3?.ethereum, web3?.chainId, account]);

	return { contract, balance };
};

export default useERC20;
