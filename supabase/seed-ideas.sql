-- Seed: DEX CLI — Web3 Bloomberg Terminal
INSERT INTO ideas (
  slug, title, tagline, category, track, difficulty, tags, key_points, problem,
  market_signal, community_signal, build_guide,
  supported_chains, chain_overrides, source_type, is_featured, votes
) VALUES (
  'dex-cli-web3-bloomberg',
  'DEX CLI — Web3 Bloomberg Terminal',
  'Onchain research, alerts, and filters directly from your terminal',
  'tool',
  'dev-tools',
  'intermediate',
  ARRAY['cli', 'dex', 'trading', 'analytics', 'terminal', 'agents'],
  ARRAY[
    'Individual trading patterns are now queryable — the terminal is the new dashboard',
    'JSON schema output makes it composable for agents and other tools',
    'Caching + rate limiting layer enables production-grade usage',
    'Alert triage with threshold triggers for real-time monitoring',
    'Publishable as npm package with MCP tool wrapper'
  ],
  'The gap between reading raw chain data and actually understanding market dynamics is too wide. Builders need a terminal-native way to query, filter, and monitor onchain activity without context-switching to web dashboards.',
  '{
    "verdict": "strong",
    "reasoning": "The move toward agent-readable APIs and CLI-first tooling is accelerating across DeFi. Individual trading patterns are now queryable — the terminal is the new dashboard.",
    "signals": [
      {"type": "trend", "text": "CLI-first developer tools gaining significant traction across the industry"},
      {"type": "gap", "text": "No production-grade terminal interface exists for multi-chain DEX interaction"},
      {"type": "demand", "text": "DeFi power users regularly request terminal-based tooling on crypto Twitter and forums"}
    ]
  }'::jsonb,
  '{
    "verdict": "high",
    "reasoning": "Builders and agents need machine-readable market data. JSON schema + caching + rate limiting makes this composable across projects.",
    "signals": [
      {"type": "twitter", "text": "Having onchain research, alerts, and filters from the terminal is powerful for builders and agents"},
      {"type": "github", "text": "Existing partial solutions have 500+ stars despite being unmaintained"},
      {"type": "reddit", "text": "Multiple r/defi threads requesting CLI trading with 200+ upvotes"}
    ]
  }'::jsonb,
  '{
    "overview": "Build a Node.js/Bun CLI that connects to DEX aggregator APIs and onchain RPC endpoints. Start with read-only analytics (prices, pools, volume), then add swap execution.",
    "steps": [
      {"order": 1, "title": "Core data layer", "description": "Connect to DEX aggregator APIs (1inch, Jupiter, Paraswap) and index real-time price/volume data via WebSocket streams."},
      {"order": 2, "title": "TUI rendering", "description": "Build terminal UI with Ink (React for CLIs). Show price tables, sparkline charts, and order book depth."},
      {"order": 3, "title": "Alert triage", "description": "Add threshold triggers via WebSocket. Configurable alerts for price movements, liquidity changes, whale activity."},
      {"order": 4, "title": "JSON schema output", "description": "Define stable JSON schema for agent consumption. Add caching + rate limiting layer for production use."},
      {"order": 5, "title": "Publish", "description": "Publish as npm package. Add MCP tool wrapper so AI agents can call it directly."}
    ],
    "stack_suggestion": "Node.js/Bun + Ink + The Graph or Dune API + WebSockets",
    "time_estimate": "4-6 weeks for MVP",
    "hackathon_fit": "Strong fit for Dev Tools tracks. Judges love developer experience improvements with agent-ready JSON output."
  }'::jsonb,
  ARRAY['solana', 'ethereum', 'arbitrum', 'base'],
  '{
    "solana": {
      "note": "Use Jupiter aggregator API and Helius RPC for real-time data. Helius webhooks for alerts.",
      "stack_override": "Node.js/Bun + Ink + Jupiter SDK + Helius RPC"
    },
    "ethereum": {
      "note": "Use 1inch or 0x aggregator. Consider Flashbots for MEV protection on mainnet.",
      "stack_override": "Node.js/Bun + Ink + ethers.js + 1inch API"
    },
    "arbitrum": {
      "note": "Same as Ethereum stack but target Arbitrum RPC. Lower gas makes frequent rebalancing viable.",
      "stack_override": null
    },
    "base": {
      "note": "Coinbase-aligned ecosystem. Consider integrating Coinbase Wallet SDK for signing.",
      "stack_override": null
    }
  }'::jsonb,
  'manual',
  true,
  42
),
(
  'onchain-reputation-graph',
  'Onchain Reputation Graph',
  'Portable identity layer that aggregates wallet history into a composable trust score',
  'protocol',
  'infrastructure',
  'advanced',
  ARRAY['identity', 'reputation', 'zkp', 'soulbound', 'attestation'],
  ARRAY[
    'Wallet history across chains becomes a verifiable credential',
    'ZK proofs allow selective disclosure without revealing full history',
    'Protocol-agnostic: works with any dapp that needs trust signals',
    'Score is composable — other protocols can build on top'
  ],
  'DeFi protocols, DAOs, and NFT platforms need to know if a wallet is trustworthy without sacrificing user privacy. Centralized KYC defeats the point of crypto. Onchain history is public but unstructured.',
  '{
    "verdict": "strong",
    "reasoning": "Sybil resistance and reputation are unsolved problems across DeFi, DAOs, and gaming. Every airdrop and governance system needs this.",
    "signals": [
      {"type": "trend", "text": "Sybil-resistance is a top priority for airdrops post-Optimism and Arbitrum farming"},
      {"type": "gap", "text": "No standard cross-chain reputation primitive exists yet"},
      {"type": "demand", "text": "DAOs spending significant resources on voter qualification — a solved primitive would unlock this"}
    ]
  }'::jsonb,
  '{
    "verdict": "high",
    "reasoning": "Every DAO, lending protocol, and NFT launchpad has this problem. A composable solution would see rapid adoption.",
    "signals": [
      {"type": "project", "text": "Gitcoin Passport has millions of users solving this exact problem for grants"},
      {"type": "twitter", "text": "EAS (Ethereum Attestation Service) gaining traction as attestation primitive"},
      {"type": "grant", "text": "Multiple foundations actively funding reputation/identity projects"}
    ]
  }'::jsonb,
  '{
    "overview": "Build an attestation aggregator that reads onchain history, computes a reputation score, and issues ZK-verifiable credentials. Integrate with EAS for attestation storage.",
    "steps": [
      {"order": 1, "title": "Data aggregation", "description": "Index wallet history: transaction count, age, DeFi interactions, NFT activity, DAO votes across chains."},
      {"order": 2, "title": "Score computation", "description": "Define a composable score schema. Weight factors by category. Make weights configurable per use-case."},
      {"order": 3, "title": "ZK proof generation", "description": "Wrap score in a ZK proof (Noir or circom) so users can prove score > threshold without revealing full history."},
      {"order": 4, "title": "EAS attestation", "description": "Issue score as an EAS attestation. Protocols can verify on-chain without calling your API."},
      {"order": 5, "title": "SDK", "description": "Ship a JS SDK for dapp integration. One function call to check reputation before allowing action."}
    ],
    "stack_suggestion": "TypeScript + Viem + EAS SDK + Noir (ZK proofs)",
    "time_estimate": "8-12 weeks for MVP",
    "hackathon_fit": "Perfect for identity/infrastructure tracks. Strong ZK angle for ZK-specific tracks."
  }'::jsonb,
  ARRAY['ethereum', 'base', 'arbitrum'],
  '{
    "ethereum": {
      "note": "Use EAS mainnet for attestations. Deploy score contracts with Foundry. Target Arbitrum for cheaper proof verification.",
      "stack_override": "Solidity + Foundry + Viem + EAS + Noir"
    },
    "base": {
      "note": "Base has native Coinbase identity tools. Combine with onchain score for Coinbase ecosystem reputation.",
      "stack_override": null
    }
  }'::jsonb,
  'manual',
  false,
  28
),
(
  'ai-audit-assistant',
  'AI Smart Contract Audit Assistant',
  'Local AI that flags Solidity vulnerabilities before you ship to mainnet',
  'tool',
  'ai',
  'intermediate',
  ARRAY['security', 'solidity', 'ai', 'audit', 'static-analysis'],
  ARRAY[
    'Runs locally — no code ever leaves your machine',
    'Understands context better than regex-based scanners',
    'Explains vulnerabilities in plain English with fix suggestions',
    'Integrates into CI/CD as a pre-deploy gate'
  ],
  'Smart contract audits cost $50k-$500k and take weeks. Most teams skip them or rely on free tools that produce noisy, context-free results. Smaller teams need an accessible first-pass audit tool.',
  '{
    "verdict": "strong",
    "reasoning": "Security tooling is a permanent, high-value category. Every dev team building onchain needs this. LLMs are now good enough at Solidity pattern recognition to add real value beyond static analysis.",
    "signals": [
      {"type": "trend", "text": "$2B+ lost to smart contract hacks in 2023 alone — demand for tooling is clear"},
      {"type": "gap", "text": "Existing tools (Slither, MythX) are pure static analysis with no reasoning capability"},
      {"type": "trend", "text": "Local LLMs (Mistral, Llama 3) now capable enough for code review tasks"}
    ]
  }'::jsonb,
  '{
    "verdict": "high",
    "reasoning": "Security is a non-optional concern for every onchain project. Dev tools that reduce audit cost and time will see immediate adoption.",
    "signals": [
      {"type": "twitter", "text": "Constant developer requests for accessible audit tooling that doesn''t require a $100k budget"},
      {"type": "github", "text": "Slither has 5k+ stars — there is clear demand for free audit tooling"},
      {"type": "grant", "text": "Multiple foundations specifically fund security tooling and education"}
    ]
  }'::jsonb,
  '{
    "overview": "Build a CLI tool that takes a Solidity contract, runs it through a local LLM with a security-focused prompt, and returns structured vulnerability findings with severity ratings and fix suggestions.",
    "steps": [
      {"order": 1, "title": "LLM integration", "description": "Connect to Ollama (local) or Anthropic API. Build a system prompt optimized for Solidity security review using SWC taxonomy."},
      {"order": 2, "title": "Contract parser", "description": "Parse Solidity files. Split large contracts into chunks. Provide function-level context to the LLM."},
      {"order": 3, "title": "Structured output", "description": "Force JSON output: vulnerability type, severity (critical/high/medium/low), affected line range, explanation, suggested fix."},
      {"order": 4, "title": "CI integration", "description": "Add GitHub Action that runs on PR. Comment findings on the PR. Block merge on critical findings."},
      {"order": 5, "title": "Report generation", "description": "Generate a PDF/HTML audit report. Makes the tool useful for teams who need a shareable artifact."}
    ],
    "stack_suggestion": "TypeScript + Ollama (local LLM) + solidity-parser-antlr + GitHub Actions",
    "time_estimate": "3-5 weeks for MVP",
    "hackathon_fit": "Strong for AI + security tracks. Easy to demo — show it catch a real vulnerability in a live contract."
  }'::jsonb,
  ARRAY['ethereum', 'base', 'arbitrum', 'solana'],
  '{
    "solana": {
      "note": "Target Rust/Anchor programs instead of Solidity. Use tree-sitter for Rust parsing. Same LLM approach applies.",
      "stack_override": "TypeScript + Ollama + tree-sitter-rust + anchor-lang parser"
    }
  }'::jsonb,
  'manual',
  false,
  35
);
