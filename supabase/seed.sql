-- Seed data: 28 opportunities across all 4 types
-- 8 hackathons, 8 grants, 5 fellowships, 7 bounties

INSERT INTO opportunities (name, type, description, status, organization, website_url, start_date, end_date, reward_amount, reward_currency, reward_token, blockchains, tags, links, notes) VALUES

-- HACKATHONS (8)
('ETHGlobal Bangkok', 'hackathon', 'Build the future of Ethereum at ETHGlobal Bangkok. 36-hour hackathon with workshops, mentors, and prizes.', 'discovered', 'ETHGlobal', 'https://ethglobal.com/events/bangkok', '2026-05-15', '2026-05-17', 500000.00, 'USD', NULL, ARRAY['Ethereum', 'Polygon', 'Arbitrum', 'Optimism'], ARRAY['defi', 'infrastructure', 'social'], '[{"label": "Discord", "url": "https://discord.gg/ethglobal"}, {"label": "Twitter", "url": "https://x.com/ETHGlobal"}]'::jsonb, 'High-profile event, good for networking'),

('Solana Breakpoint Hack', 'hackathon', 'Build on Solana during Breakpoint conference. Focus on DePIN, DeFi, and consumer apps.', 'evaluating', 'Solana Foundation', 'https://solana.com/breakpoint', '2026-06-10', '2026-06-12', 250000.00, 'USD', 'SOL', ARRAY['Solana'], ARRAY['depin', 'defi', 'consumer'], '[{"label": "Website", "url": "https://solana.com/breakpoint"}]'::jsonb, 'Consider DePIN track'),

('ETHDenver 2027', 'hackathon', 'The largest Web3 hackathon in the world. BUIDLathon with multiple tracks and sponsor prizes.', 'discovered', 'ETHDenver', 'https://ethdenver.com', '2027-02-23', '2027-03-02', 1000000.00, 'USD', NULL, ARRAY['Ethereum', 'Polygon', 'Base', 'Arbitrum'], ARRAY['defi', 'dao', 'social', 'infrastructure'], '[{"label": "Apply", "url": "https://ethdenver.com/apply"}]'::jsonb, NULL),

('Sui Overflow', 'hackathon', 'Sui global hackathon with tracks for DeFi, Gaming, and Infrastructure.', 'applying', 'Sui Foundation', 'https://sui.io/overflow', '2026-04-01', '2026-04-30', 300000.00, 'USD', 'SUI', ARRAY['Sui'], ARRAY['defi', 'gaming', 'infrastructure'], '[{"label": "Register", "url": "https://sui.io/overflow/register"}]'::jsonb, 'Online-only, 1 month duration'),

('Aptos Global Hack', 'hackathon', 'Build on Move. Multiple bounties from ecosystem partners.', 'completed', 'Aptos Foundation', 'https://aptos.dev/hack', '2026-01-15', '2026-02-15', 150000.00, 'USD', 'APT', ARRAY['Aptos'], ARRAY['move', 'defi', 'nft'], '[]'::jsonb, 'Won 3rd place in DeFi track'),

('Chainlink Constellation', 'hackathon', 'Build hybrid smart contracts using Chainlink oracles, CCIP, and Functions.', 'discovered', 'Chainlink', 'https://chain.link/hackathon', '2026-07-01', '2026-08-15', 400000.00, 'USD', 'LINK', ARRAY['Ethereum', 'Polygon', 'Arbitrum', 'Avalanche'], ARRAY['oracles', 'cross-chain', 'defi'], '[{"label": "DevPost", "url": "https://chainlink-constellation.devpost.com"}]'::jsonb, NULL),

('Polkadot Prodigy', 'hackathon', 'Build the next generation of parachains and dApps on Polkadot.', 'evaluating', 'Web3 Foundation', 'https://polkadot.network/prodigy', '2026-05-01', '2026-06-30', 200000.00, 'USD', 'DOT', ARRAY['Polkadot'], ARRAY['parachain', 'defi', 'identity'], '[]'::jsonb, 'Substrate experience needed'),

('Base Onchain Summer Build', 'hackathon', 'Coinbase Base ecosystem hackathon focused on bringing the next billion users onchain.', 'discovered', 'Base', 'https://base.org/buildathon', '2026-06-01', '2026-06-30', 350000.00, 'USD', 'ETH', ARRAY['Base', 'Ethereum'], ARRAY['consumer', 'social', 'payments'], '[{"label": "Register", "url": "https://base.org/buildathon/register"}]'::jsonb, 'Consumer focus aligns well with our work'),

-- GRANTS (8)
('Gitcoin GG21', 'grant', 'Gitcoin Grants Round 21 — public goods funding for Ethereum ecosystem projects.', 'evaluating', 'Gitcoin', 'https://gitcoin.co/grants', '2026-06-01', '2026-06-30', 50000.00, 'USD', 'USDC', ARRAY['Ethereum'], ARRAY['public-goods', 'infrastructure', 'education'], '[{"label": "Apply", "url": "https://gitcoin.co/grants/apply"}]'::jsonb, 'Need to prepare grant page with impact metrics'),

('Optimism RetroPGF Round 5', 'grant', 'Retroactive public goods funding for projects that have made a positive impact on the Optimism Collective.', 'discovered', 'Optimism Foundation', 'https://optimism.io/retropgf', '2026-04-01', '2026-05-15', 30000000.00, 'USD', 'OP', ARRAY['Optimism', 'Ethereum'], ARRAY['public-goods', 'tooling', 'education'], '[{"label": "Documentation", "url": "https://community.optimism.io/docs/governance/retropgf"}]'::jsonb, 'Large pool, highly competitive'),

('Uniswap Foundation Grants', 'grant', 'Grants for projects building on or extending the Uniswap protocol ecosystem.', 'applying', 'Uniswap Foundation', 'https://uniswapfoundation.mirror.xyz', NULL, '2026-12-31', 100000.00, 'USD', 'UNI', ARRAY['Ethereum', 'Polygon', 'Arbitrum', 'Base'], ARRAY['defi', 'amm', 'tooling'], '[{"label": "Apply", "url": "https://uniswapfoundation.org/apply"}]'::jsonb, 'Rolling applications'),

('Solana Foundation Grants', 'grant', 'Ecosystem grants for teams building infrastructure, DeFi, and consumer apps on Solana.', 'discovered', 'Solana Foundation', 'https://solana.org/grants', NULL, NULL, 75000.00, 'USD', 'SOL', ARRAY['Solana'], ARRAY['infrastructure', 'defi', 'consumer'], '[]'::jsonb, 'No fixed deadline — rolling'),

('Filecoin Dev Grants', 'grant', 'Grants for developers building on Filecoin and IPFS for decentralized storage solutions.', 'evaluating', 'Protocol Labs', 'https://grants.filecoin.io', NULL, '2026-09-30', 50000.00, 'USD', 'FIL', ARRAY['Filecoin'], ARRAY['storage', 'infrastructure', 'tooling'], '[{"label": "GitHub", "url": "https://github.com/filecoin-project/devgrants"}]'::jsonb, NULL),

('Starknet Seed Grants', 'grant', 'Seed-stage funding for early-stage projects building on Starknet.', 'discovered', 'Starknet Foundation', 'https://starknet.io/grants', '2026-03-01', '2026-06-30', 25000.00, 'USD', 'STRK', ARRAY['Starknet', 'Ethereum'], ARRAY['zk-proofs', 'defi', 'gaming'], '[]'::jsonb, 'ZK expertise required'),

('Arbitrum STIP Round 2', 'grant', 'Short-Term Incentive Program for protocols on Arbitrum to drive adoption and TVL.', 'rejected', 'Arbitrum DAO', 'https://arbitrum.foundation/stip', '2026-01-01', '2026-03-31', 200000.00, 'USD', 'ARB', ARRAY['Arbitrum', 'Ethereum'], ARRAY['defi', 'tvl', 'incentives'], '[]'::jsonb, 'Rejected — reapply next round with stronger metrics'),

('Polygon Village Grants', 'grant', 'Community grants for builders on Polygon ecosystem including zkEVM and PoS.', 'accepted', 'Polygon Labs', 'https://polygon.technology/village', NULL, NULL, 30000.00, 'USD', 'POL', ARRAY['Polygon', 'Ethereum'], ARRAY['defi', 'gaming', 'social'], '[{"label": "Dashboard", "url": "https://polygon.technology/village/dashboard"}]'::jsonb, 'Accepted! Milestone-based disbursement'),

-- FELLOWSHIPS (5)
('a16z Crypto Startup School', 'fellowship', '12-week program for crypto founders. Covers product, engineering, GTM, and fundraising.', 'discovered', 'a16z Crypto', 'https://a16zcrypto.com/css', '2026-09-01', '2026-11-30', 100000.00, 'USD', NULL, ARRAY['Ethereum', 'Solana', 'Base'], ARRAY['founders', 'education', 'startup'], '[{"label": "Apply", "url": "https://a16zcrypto.com/css/apply"}]'::jsonb, 'Highly selective — need strong team pitch'),

('Solana Fellowship', 'fellowship', 'Intensive 6-month program for developers building full-time on Solana.', 'evaluating', 'Solana Foundation', 'https://solana.com/fellowship', '2026-07-01', '2026-12-31', 60000.00, 'USD', 'SOL', ARRAY['Solana'], ARRAY['developers', 'education', 'ecosystem'], '[]'::jsonb, 'Requires relocation to NYC'),

('Ethereum Protocol Fellowship', 'fellowship', 'Work on Ethereum core protocol development with experienced mentors for 4 months.', 'applying', 'Ethereum Foundation', 'https://fellowship.ethereum.foundation', '2026-05-01', '2026-08-31', 40000.00, 'USD', 'ETH', ARRAY['Ethereum'], ARRAY['protocol', 'research', 'core-dev'], '[{"label": "Program Info", "url": "https://fellowship.ethereum.foundation/info"}]'::jsonb, 'Core protocol work — need strong systems background'),

('Polkadot Blockchain Academy', 'fellowship', 'Intensive education program on Substrate and Polkadot runtime development.', 'completed', 'Web3 Foundation', 'https://polkadot.network/academy', '2025-11-01', '2026-01-31', 5000.00, 'USD', 'DOT', ARRAY['Polkadot'], ARRAY['education', 'substrate', 'runtime'], '[]'::jsonb, 'Completed — great network built'),

('Near Protocol Builders Program', 'fellowship', '3-month intensive for teams building on NEAR with mentorship and funding.', 'discovered', 'NEAR Foundation', 'https://near.org/builders', '2026-08-01', '2026-10-31', 50000.00, 'USD', 'NEAR', ARRAY['Near'], ARRAY['builders', 'education', 'ecosystem'], '[]'::jsonb, NULL),

-- BOUNTIES (7)
('Immunefi Critical Bug Bounty — Aave', 'bounty', 'Find critical vulnerabilities in Aave V3 smart contracts. Up to $250K for critical findings.', 'discovered', 'Immunefi', 'https://immunefi.com/bounty/aave', NULL, NULL, 250000.00, 'USD', 'USDC', ARRAY['Ethereum', 'Polygon', 'Arbitrum', 'Optimism', 'Avalanche'], ARRAY['security', 'smart-contracts', 'defi'], '[{"label": "Bounty Page", "url": "https://immunefi.com/bounty/aave"}]'::jsonb, 'Ongoing — no deadline'),

('Layer3 Quest: Swap on Uniswap V4', 'bounty', 'Complete a quest to perform a swap on Uniswap V4 and earn rewards.', 'completed', 'Layer3', 'https://layer3.xyz/quests/uniswap-v4', NULL, '2026-03-15', 50.00, 'USD', 'USDC', ARRAY['Ethereum', 'Base'], ARRAY['quest', 'defi', 'education'], '[{"label": "Quest", "url": "https://layer3.xyz/quests/uniswap-v4"}]'::jsonb, 'Completed — small but good practice'),

('Sherlock Audit Contest — Morpho', 'bounty', 'Competitive audit contest for Morpho Blue lending protocol. Find bugs, earn rewards.', 'in_progress', 'Sherlock', 'https://audits.sherlock.xyz/morpho', '2026-03-20', '2026-04-03', 75000.00, 'USD', 'USDC', ARRAY['Ethereum'], ARRAY['security', 'audit', 'defi', 'lending'], '[{"label": "Contest", "url": "https://audits.sherlock.xyz/morpho"}]'::jsonb, 'Currently auditing — focus on lending logic'),

('Code4rena Contest — GMX V2', 'bounty', 'Competitive audit for GMX V2 perpetuals protocol on Arbitrum.', 'submitted', 'Code4rena', 'https://code4rena.com/contests/gmx-v2', '2026-02-15', '2026-03-01', 100000.00, 'USD', 'USDC', ARRAY['Arbitrum'], ARRAY['security', 'audit', 'perps', 'defi'], '[]'::jsonb, 'Submitted findings — awaiting results'),

('Immunefi Bug Bounty — Lido', 'bounty', 'Find vulnerabilities in Lido staking contracts. Critical: $250K, High: $50K.', 'discovered', 'Immunefi', 'https://immunefi.com/bounty/lido', NULL, NULL, 250000.00, 'USD', 'ETH', ARRAY['Ethereum'], ARRAY['security', 'staking', 'defi'], '[{"label": "Scope", "url": "https://immunefi.com/bounty/lido"}]'::jsonb, NULL),

('Hats Finance Audit — Velodrome V3', 'bounty', 'Decentralized audit competition for Velodrome V3 on Optimism.', 'evaluating', 'Hats Finance', 'https://hats.finance/velodrome-v3', '2026-04-01', '2026-04-14', 60000.00, 'USD', 'USDC', ARRAY['Optimism'], ARRAY['security', 'audit', 'dex', 'defi'], '[]'::jsonb, 'Good payout, reasonable scope'),

('Dune Analytics Bounty Board', 'bounty', 'Create Dune dashboards for various DeFi protocols. Bounties range from $100-$5000.', 'discovered', 'Dune Analytics', 'https://dune.com/bounties', NULL, NULL, 5000.00, 'USD', 'USDC', ARRAY['Ethereum', 'Polygon', 'Arbitrum', 'Optimism', 'Base'], ARRAY['analytics', 'dashboards', 'data'], '[{"label": "Bounties", "url": "https://dune.com/bounties"}]'::jsonb, 'Good for building public profile');
