import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css';
import { Web3Provider } from '../modules/web3/Web3Provider';
import WalletInfo from '../components/WalletInfo';

function App({ Component, pageProps }: AppProps) {
	return (
		<>
			<Head>
				<title>Welcome!</title>
			</Head>
			<main className="app w-full h-full absolute bg-gray-50">
				<Web3Provider>
					<WalletInfo />
					<Component {...pageProps} />
				</Web3Provider>
			</main>
		</>
	);
}

export default App;
