import { ContractReceipt } from 'ethers';
import { randomNumericString } from './random';

export const isProduction = process.env.NODE_ENV === 'production';

export const truncateAddress = (
	address?: string,
	start = 8,
	end = 4
): string => {
	if (!address) return '';
	if (address.length <= start + end) return address;

	return (
		address.substring(0, start) + '...' + address.substr(address.length - end)
	);
};

export const currencySymbol = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'MOCK';

export const HOUR_MS = 60 * 60 * 1000;

export const metadataUploadMessage = (salt?: string, expiry?: number) => {
	const msg: {
		message: string;
		salt: string;
		expiry: number;
	} = {
		message: `Sign this message to upload trade metadata.`,
		salt: salt || randomNumericString(),
		expiry: 0
	};

	if (expiry) {
		msg.expiry = expiry;
	} else {
		const now = new Date();
		msg.expiry = now.setTime(now.getTime() + 1000 * 60);
	}

	return msg;
};

export const getEventData = (name: string, receipt: ContractReceipt) => {
	return receipt.events?.find((e) => e.event === name)?.args;
};
