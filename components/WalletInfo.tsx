import useERC20 from '../modules/web3/useERC20';
import useWallet from '../modules/web3/useWallet';
import { currencySymbol, isProduction, truncateAddress } from '../utils';
import Button from './Button';
import { ethers } from 'ethers';
import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk';
import { useContext } from 'react';
import { Web3Context } from '../modules/web3/Web3Provider';

export const WalletInfo = () => {
	const web3 = useContext(Web3Context);
	const { init, account } = useWallet();
	const { balance } = useERC20();

	const addFunds = () => {
		let swapAssetPrefix = '';
		switch (web3?.chainId) {
			case 137:
			case 80001:
				if (currencySymbol !== 'MATIC') swapAssetPrefix = 'MATIC_';
				break;
		}

		new RampInstantSDK({
			hostAppName: 'Bought',
			hostLogoUrl: 'https://docs.ramp.network/img/logo-1.svg',
			...(!isProduction && {
				url: 'https://ri-widget-staging.firebaseapp.com'
			}),
			userAddress: account,
			swapAsset: `${swapAssetPrefix ? swapAssetPrefix : ''}${currencySymbol}`,
			variant: window.innerWidth < 800 ? 'mobile' : 'desktop'
		}).show();
	};

	return (
		<div className="p-8 flex flex-row-reverse bg-slate-100 rounded-b-2xl">
			{account ? (
				<div className="w-full flex flex-row justify-between items-center">
					<div className="flex flex-col">
						<h3>{truncateAddress(account)}</h3>
						{balance && (
							<p>
								{currencySymbol} {ethers.utils.formatEther(balance.toString())}
							</p>
						)}
					</div>

					<Button onClick={addFunds}>Top up</Button>
				</div>
			) : (
				<Button onClick={init}>Connect MetaMask</Button>
			)}
		</div>
	);
};

export default WalletInfo;
