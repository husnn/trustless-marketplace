import Modal from './Modal';
import { getNetworkParams } from '../utils/network';

export const WrongNetwork = ({
	actual,
	preferred: desired,
	onSwitch
}: {
	actual: number;
	preferred: number;
	onSwitch: (chainId: number) => void;
}) => {
	console.log('Rendered wrong network alert.');

	const net = getNetworkParams(desired);

	return (
		<Modal
			title="Wrong network"
			isOpen={actual != desired}
			onClose={() => null}
			ok="Switch network"
			onOkPressed={() => onSwitch(desired)}
		>
			<p>
				Switch your network to{' '}
				{net.chainName ? `${net.chainName} (${desired})` : desired} to continue
				using the app.
			</p>
		</Modal>
	);
};
