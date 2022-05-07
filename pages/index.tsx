import type { NextPage } from 'next';
import React, { createRef, useCallback, useEffect, useState } from 'react';
import Button from '../components/Button';
import FormInput from '../components/FormInput';
import TextInput from '../components/TextInput';
import { currencySymbol, getEventData, HOUR_MS } from '../utils';
import { getContractAddress, preferredChainId } from '../utils/network';
import useERC20 from '../modules/web3/useERC20';
import { ethers, ContractReceipt, BigNumber } from 'ethers';
import useWallet from '../modules/web3/useWallet';
import useMarket from '../modules/web3/useMarket';
import Container from '../components/Container';
import TextArea from '../components/TextArea';
import axios from 'axios';
import RadioGroup from '../components/RadioGroup';
import Router from 'next/router';
import Head from 'next/head';

const marketAddress = getContractAddress(preferredChainId, 'Market');

const Home: NextPage = () => {
	const { account } = useWallet();

	const { contract: erc20Contract } = useERC20();
	const { contract: marketContract } = useMarket();

	const [approved, setApproved] = useState(true);

	const [condition, setCondition] = useState<string>();
	const [name, setName] = useState('');
	const [amount, setAmount] = useState(0);
	const [description, setDescription] = useState('');

	const imageFile = createRef<HTMLInputElement>();

	useEffect(() => {
		if (amount > 0) setApproved(false);
	}, [amount]);

	const approveContract = useCallback(async () => {
		if (!account || !erc20Contract.current) return;

		try {
			const allowance = await erc20Contract.current.allowance(
				account,
				marketAddress
			);
			const approved = ethers.utils
				.parseEther(amount.toString())
				.lte(allowance);

			setApproved(approved);

			if (approved) return;

			erc20Contract.current
				?.approve(marketAddress, ethers.utils.parseEther(amount.toString()))
				.then(() => setApproved(true));
		} catch (err) {
			console.log(err);
		}
	}, [account, amount, erc20Contract]);

	const getIDFromEvent = (receipt: ContractReceipt) => {
		return (getEventData('Wrap', receipt)?.['id'] as BigNumber)?.toString();
	};

	const createTrade = async () => {
		if (!marketContract.current || !erc20Contract.current) return;

		try {
			const cid = await axios.post('/api/metadata', {
				condition,
				name,
				description
			});

			const expiry = new Date();
			expiry.setTime(expiry.getTime() + HOUR_MS);

			const tx = await marketContract.current.wrap(
				cid.data,
				erc20Contract.current.address,
				ethers.utils.parseEther(amount.toString()),
				Math.floor(expiry.getTime() / 1000)
			);

			const receipt = await tx.wait();

			Router.push(`/trade/${getIDFromEvent(receipt)}`);
		} catch (err) {
			console.log(err);
		}
	};

	return (
		<Container>
			<Head>
				<title>Bought</title>
			</Head>
			<div className="flex flex-col gap-y-4">
				<h1 className="mb-2">Create trade</h1>
				<FormInput label="Condition">
					<RadioGroup
						category="condition"
						options={[
							{ id: 'new', label: 'New' },
							{ id: 'used', label: 'Used' },
							{ id: 'other', label: 'Other' }
						]}
						onSelect={(selected) => setCondition(selected.label)}
					/>
				</FormInput>
				<FormInput label="What are you selling?">
					<TextInput
						placeholder="iPhone 14 Pro, PS5, Lamborghini, etc."
						state={[name, setName]}
					/>
				</FormInput>
				<FormInput label="Price">
					<TextInput
						type="number"
						min={0}
						placeholder="500"
						state={[amount, setAmount]}
					/>
				</FormInput>
				<FormInput label="Description">
					<TextArea
						placeholder="What else should the buyer know about this item?"
						state={[description, setDescription]}
					/>
				</FormInput>
				<Button
					className="mt-4"
					onClick={!approved ? approveContract : createTrade}
				>
					{!approved
						? `Approve contract to deposit ${currencySymbol}`
						: 'Create trade'}
				</Button>
			</div>
		</Container>
	);
};

export default Home;
