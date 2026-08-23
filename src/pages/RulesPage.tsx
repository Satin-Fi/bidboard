import { useBidStore } from '../store/useBidStore'

export default function RulesPage() {
  const openModal = useBidStore((s) => s.openModal)

  const rules = [
    {
      title: '1. Position is Determined by Bid Amount',
      description:
        'The leaderboard ranks every website, app, or profile strictly by how much was paid. The highest bidder sits at #1, the second highest at #2, and so forth.',
    },
    {
      title: '2. Anyone Can Outbid Anyone',
      description:
        'If someone outbids your spot by at least $1, their product immediately takes the higher position, shifting other spots down by one.',
    },
    {
      title: '3. Permanent Placement',
      description:
        'Spots do not expire after a few hours or days. Your position remains on the public board indefinitely until higher bids place other competitors above you.',
    },
    {
      title: '4. Increasing Your Bid',
      description:
        'If your product is already on the leaderboard and has been outbid, simply enter your existing URL or @handle to increase your bid and climb back up.',
    },
    {
      title: '5. Guidelines & Acceptable Content',
      description:
        'All legitimate websites, startups, tools, social profiles, and apps are welcomed. Links containing malware, phishing, illegal material, or fraud will be removed without refund.',
    },
  ]

  const faqs = [
    {
      q: 'What is the minimum bid to get listed?',
      a: 'The minimum bid for a new spot is just $5. Your bid places you on the board at whatever rank that amount commands.',
    },
    {
      q: 'Do I get traffic and clicks from the leaderboard?',
      a: 'Yes! Every listing has a direct outbound link. Millions of visitors, founders, investors, and early adopters browse the leaderboard.',
    },
    {
      q: 'Can I edit my product title or description later?',
      a: 'Yes. Simply submit your URL again when upping your bid to refresh your title, description, or category.',
    },
  ]

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="text-center mb-12">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-coral-400">
          Transparency & Mechanics
        </span>
        <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-white mt-1">
          Rules of the Board
        </h1>
        <p className="text-sm text-neutral-400 mt-2">
          Simple, transparent, gamified attention marketplace.
        </p>
      </div>

      <div className="space-y-4 mb-12">
        {rules.map((r, i) => (
          <div key={i} className="p-5 sm:p-6 rounded-2xl bg-surface border border-white/[0.06]">
            <h3 className="font-display font-bold text-base sm:text-lg text-white mb-1.5">
              {r.title}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              {r.description}
            </p>
          </div>
        ))}
      </div>

      <div className="border-t border-white/[0.08] pt-10">
        <h2 className="font-display font-bold text-2xl text-white mb-6 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="p-4 rounded-xl bg-surface/50 border border-white/[0.05]">
              <div className="font-display font-semibold text-sm text-white">{f.q}</div>
              <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 text-center">
        <button
          onClick={() => openModal()}
          className="btn-accent !px-8 !py-3 !text-sm font-bold"
        >
          Claim Your Spot →
        </button>
      </div>
    </div>
  )
}
