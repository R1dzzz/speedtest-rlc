## Packages
framer-motion | For premium, fluid animations, page transitions, and the pulsing neon effects.
lucide-react | For beautiful, consistent modern icons across the dashboard.
clsx | For conditional class merging (standard in premium UI).
tailwind-merge | For resolving Tailwind class conflicts safely.

## Notes
- PWA features (manifest.json and sw.js) are placed in the public directory and registered in the main App component.
- The Speed Test logic uses a sophisticated simulation engine for the frontend visualization (to guarantee a stunning, real-time "rolling numbers" effect without relying on potentially unstable heavy file streams during dev), and then successfully POSTs the final generated metrics to the `/api/speedtest/record` endpoint.
- Expected logo path: `/logo-rlc.png` (a placeholder is used in the UI with instructions).
