-- Seed milestones for existing opportunities
-- Uses subqueries to find opportunity IDs by name

INSERT INTO milestones (opportunity_id, title, date, time, type, notes) VALUES
-- ETHGlobal Bangkok milestones
((SELECT id FROM opportunities WHERE name = 'ETHGlobal Bangkok'), 'Registration opens', '2026-04-01', NULL, 'announcement', NULL),
((SELECT id FROM opportunities WHERE name = 'ETHGlobal Bangkok'), 'Sponsor office hours', '2026-05-14', '10:00', 'office_hour', 'Meet with sponsors before the event'),
((SELECT id FROM opportunities WHERE name = 'ETHGlobal Bangkok'), 'Hacking starts', '2026-05-15', '09:00', 'checkpoint', NULL),
((SELECT id FROM opportunities WHERE name = 'ETHGlobal Bangkok'), 'Submission deadline', '2026-05-17', '09:00', 'deadline', 'Must submit on Devpost'),
((SELECT id FROM opportunities WHERE name = 'ETHGlobal Bangkok'), 'Results announced', '2026-05-17', '18:00', 'announcement', NULL),

-- Gitcoin GG21 milestones
((SELECT id FROM opportunities WHERE name = 'Gitcoin GG21'), 'Round opens', '2026-06-01', NULL, 'announcement', NULL),
((SELECT id FROM opportunities WHERE name = 'Gitcoin GG21'), 'Grant page review deadline', '2026-06-07', NULL, 'deadline', 'Finalize grant page with impact metrics'),
((SELECT id FROM opportunities WHERE name = 'Gitcoin GG21'), 'Community office hour', '2026-06-10', '14:00', 'office_hour', 'Gitcoin community call'),
((SELECT id FROM opportunities WHERE name = 'Gitcoin GG21'), 'Round closes', '2026-06-30', '23:59', 'deadline', NULL),

-- Sui Overflow milestones
((SELECT id FROM opportunities WHERE name = 'Sui Overflow'), 'Registration deadline', '2026-03-31', NULL, 'deadline', NULL),
((SELECT id FROM opportunities WHERE name = 'Sui Overflow'), 'Hacking starts', '2026-04-01', NULL, 'checkpoint', NULL),
((SELECT id FROM opportunities WHERE name = 'Sui Overflow'), 'Midpoint check-in', '2026-04-15', '10:00', 'office_hour', NULL),
((SELECT id FROM opportunities WHERE name = 'Sui Overflow'), 'Submission deadline', '2026-04-30', '23:59', 'deadline', NULL),

-- Ethereum Protocol Fellowship milestones
((SELECT id FROM opportunities WHERE name = 'Ethereum Protocol Fellowship'), 'Application deadline', '2026-04-15', NULL, 'deadline', NULL),
((SELECT id FROM opportunities WHERE name = 'Ethereum Protocol Fellowship'), 'Program starts', '2026-05-01', NULL, 'checkpoint', NULL),
((SELECT id FROM opportunities WHERE name = 'Ethereum Protocol Fellowship'), 'Mid-program review', '2026-06-30', NULL, 'checkpoint', NULL),

-- Sherlock Audit Contest milestones
((SELECT id FROM opportunities WHERE name = 'Sherlock Audit Contest — Morpho'), 'Contest starts', '2026-03-20', NULL, 'checkpoint', NULL),
((SELECT id FROM opportunities WHERE name = 'Sherlock Audit Contest — Morpho'), 'Submission deadline', '2026-04-03', '23:59', 'deadline', 'Submit all findings'),
((SELECT id FROM opportunities WHERE name = 'Sherlock Audit Contest — Morpho'), 'Results announced', '2026-04-15', NULL, 'announcement', NULL);

-- Sample calendar blocks
INSERT INTO calendar_blocks (opportunity_id, title, date, slot, hours, status, notes) VALUES
((SELECT id FROM opportunities WHERE name = 'Sui Overflow'), 'Sui Overflow - Build MVP', '2026-04-07', 'ALL_DAY', 8, 'planned', 'Focus on core smart contract'),
((SELECT id FROM opportunities WHERE name = 'Sui Overflow'), 'Sui Overflow - Frontend', '2026-04-08', 'AM', 4, 'planned', 'Build UI for demo'),
((SELECT id FROM opportunities WHERE name = 'Sherlock Audit Contest — Morpho'), 'Morpho Audit - Lending Logic', '2026-03-25', 'AM', 4, 'in_progress', 'Review lending pool logic'),
((SELECT id FROM opportunities WHERE name = 'Sherlock Audit Contest — Morpho'), 'Morpho Audit - Edge Cases', '2026-03-26', 'PM', 4, 'planned', 'Test liquidation edge cases'),
(NULL, 'Study: Move Language Basics', '2026-04-02', 'AM', 3, 'planned', 'Prep for Sui Overflow');

-- Sample proposal
INSERT INTO proposals (opportunity_id, content, status, submission_url) VALUES
((SELECT id FROM opportunities WHERE name = 'Gitcoin GG21'),
'# Weminal Labs — Crypto Opportunities Database

## Impact

We built an open-source database for tracking crypto hackathons, grants, fellowships, and bounties. Accessible via web UI and Claude MCP tools.

## What We Built

- REST API with full CRUD and filtering
- Notion-like web table with type badges
- MCP server for AI agent integration
- 28 curated opportunities across 4 types

## Why It Matters

Crypto opportunity tracking is fragmented across Notion, Discord, and Twitter. We unified it into one queryable database.',
'draft', NULL);
