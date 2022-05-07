import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import Container from '../../components/Container';
import useMarket, { State } from '../../modules/web3/useMarket';
import { ethers } from 'ethers';
import useWallet from '../../modules/web3/useWallet';
import Button from '../../components/Button';
import { currencySymbol } from '../../utils';
import useERC20 from '../../modules/web3/useERC20';
import Head from 'next/head';

export const TradePage = () => {
	console.log('TradePage: Render');

	const { account } = useWallet();
	const { contract: marketContract, trade, metadata, getTrade } = useMarket();
	const { contract: erc20Contract, balance } = useERC20();

	const router = useRouter();

	const id = parseInt(router.query['id'] as string);

	const isSeller = account === trade?.seller;
	const active = trade?.status == State.ACTIVE;
	const expired =
		trade && new Date() >= new Date(trade.expiry.toNumber() * 1000);
	const unlocked =
		trade && new Date() >= new Date(trade.unlocks.toNumber() * 1000);

	const totalAmount = trade?.amount.mul(2);
	const insufficientBalance = totalAmount ? balance?.lt(totalAmount) : true;

	const [approved, setApproved] = useState(false);
	const [committed, setCommitted] = useState(false);
	const [voided, setVoided] = useState(false);
	const [sent, setSent] = useState(false);
	const [received, setReceived] = useState(false);
	const [disputed, setDisputed] = useState(false);
	const [disputeClosed, setDisputeClosed] = useState(false);
	const [closed, setClosed] = useState(false);

	useEffect(() => {
		getTrade(id);
	}, [marketContract, router.query, getTrade, committed]);

	const initialRef = useRef(true);
	useEffect(() => {
		if (!initialRef.current) return;

		if (trade) {
			initialRef.current = false;
		}

		console.log(trade);
	});

	useEffect(() => {
		if (
			!erc20Contract.current ||
			!account ||
			!marketContract.current ||
			!totalAmount
		)
			return;
		erc20Contract.current
			.allowance(account, marketContract.current.address)
			.then((allowance) => {
				setApproved(allowance.gte(totalAmount));
			})
			.catch((err) => console.log(err));
	}, [totalAmount]);

	const commit = () => {
		marketContract.current
			?.commit(id)
			.then(() => setCommitted(true))
			.catch((err) => console.log(err));
	};

	const approveDeposit = () => {
		if (!marketContract.current) return;
		erc20Contract.current
			?.approve(marketContract.current.address, totalAmount!.toString())
			.then(() => setApproved(true));
	};

	const voidTrade = () => {
		marketContract.current
			?.void(id)
			.then(() => setVoided(true))
			.catch((err) => console.log(err));
	};

	const markSent = () => {
		marketContract.current
			?.sent(id)
			.then(() => setSent(true))
			.catch((err) => console.log(err));
	};

	const markReceived = () => {
		marketContract.current
			?.received(id)
			.then(() => setReceived(true))
			.catch((err) => console.log(err));
	};

	const disputeTrade = () => {
		marketContract.current
			?.dispute(id)
			.then(() => setDisputed(true))
			.catch((err) => console.log(err));
	};

	const acceptDispute = () => {
		marketContract.current
			?.accept(id)
			.then(() => setDisputeClosed(true))
			.catch((err) => console.log(err));
	};

	const rejectDispute = () => {
		marketContract.current
			?.reject(id)
			.then(() => setDisputeClosed(true))
			.catch((err) => console.log(err));
	};

	const closeTrade = () => {
		marketContract.current
			?.close(id)
			.then(() => setClosed(true))
			.catch((err) => console.log(err));
	};

	return (
		<Container>
			<Head>
				<title>{metadata?.['name'] || 'Trade details'}</title>
			</Head>
			{trade && trade.seller !== ethers.constants.AddressZero && (
				<div className="flex flex-col gap-y-4">
					<h1>{!isSeller ? 'Buy' : 'Details'}</h1>
					<div className="break-all">
						{expired && <p>Expired</p>}
						{metadata && (
							<>
								<p>{metadata['condition']}</p>
								<p>{metadata['name']}</p>
								<p>{metadata['description']}</p>
							</>
						)}
						<p>Seller: {trade.seller}</p>
						<p>Currency: {trade.currency}</p>
						<p>
							Amount: {currencySymbol} {ethers.utils.formatEther(trade.amount)}
						</p>
					</div>
					<div className="mt-4 flex flex-col">
						{!isSeller && active && !committed && (
							<Button
								onClick={approved ? commit : approveDeposit}
								disabled={insufficientBalance}
							>
								{insufficientBalance
									? 'Insufficient balance'
									: approved
									? 'Commit'
									: `Approve deposit of ${currencySymbol} ${ethers.utils.formatEther(
											totalAmount!.toString()
									  )}`}
							</Button>
						)}
						{isSeller && trade.status === State.COMMITTED && !sent && (
							<Button onClick={markSent}>Mark sent</Button>
						)}
						{account === trade.buyer &&
							(trade.status === State.COMMITTED ||
								trade.status === State.SENT) &&
							!received && (
								<Button onClick={markReceived}>Mark received</Button>
							)}
						{trade.status == State.COMMITTED &&
							trade.voider != account &&
							!voided &&
							!received &&
							!disputed && (
								<Button className="mt-2" onClick={voidTrade}>
									{trade.voider == ethers.constants.AddressZero
										? 'Request voidance'
										: 'Void trade'}
								</Button>
							)}
						{trade.status === State.RECEIVED && !closed && (
							<>
								{trade.buyer == account && !unlocked && !disputed && (
									<Button className="mb-2" onClick={disputeTrade}>
										Dispute trade
									</Button>
								)}
								{(account == trade.buyer || unlocked) && (
									<Button onClick={closeTrade}>Close trade</Button>
								)}
							</>
						)}
						{trade.status === State.DISPUTED &&
							!disputeClosed &&
							trade.seller == account && (
								<div className="flex flex-row gap-x-2">
									<Button onClick={acceptDispute}>Accept dispute</Button>
									<Button onClick={rejectDispute}>Reject dispute</Button>
								</div>
							)}
					</div>
				</div>
			)}
		</Container>
	);
};

export default TradePage;
