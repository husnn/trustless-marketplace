import deployed from '../contracts/deployed.json';

export const preferredChainId = parseInt(
	process.env.NEXT_PUBLIC_CHAIN_ID || '1337'
);

export const getContractAddress = (chainId: number, name: string) =>
	process.env.NEXT_PUBLIC_ERC20_ADDRESS ||
	(deployed as any)[chainId.toString()]?.[name];

export const getNetworkParams = (
	chainId: number
): {
	chainId: number;
	chainName?: string;
	rpcUrls?: string[];
	nativeCurrency?: {
		name: string;
		symbol: string;
		decimals: number;
	};
	blockExplorerUrls?: string[];
} => {
	switch (chainId) {
		case 137:
			return {
				chainId,
				chainName: 'Polygon Mainnet',
				rpcUrls: ['https://polygon-rpc.com/'],
				blockExplorerUrls: ['https://polygonscan.com/'],
				nativeCurrency: {
					name: 'Polygon',
					symbol: 'MATIC',
					decimals: 18
				}
			};
		case 80001:
			return {
				chainId,
				chainName: 'Polygon Mumbai',
				rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
				blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
				nativeCurrency: {
					name: 'Polygon',
					symbol: 'MATIC',
					decimals: 18
				}
			};
		default:
			return { chainId };
	}
};
