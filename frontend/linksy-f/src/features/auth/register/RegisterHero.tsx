const communityColors = ["#f4b6a6", "#b6d3ff", "#f2d185", "#c4b5fd"];
const communityInitials = ["J", "M", "A", "S"];

export default function RegisterHero() {
  return (
    <aside className="relative hidden overflow-hidden bg-indigo-700 px-12 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
      <div className="absolute -right-28 top-1/4 h-96 w-96 rounded-full bg-indigo-500/40 blur-3xl" />
      <div className="absolute -bottom-44 -left-24 h-96 w-96 rounded-full bg-violet-400/30 blur-3xl" />
      <a
        href="/"
        className="relative flex items-center gap-3 text-xl font-bold tracking-tight"
      >
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 text-xl">
          ↗
        </span>{" "}
        linksy
      </a>
      <div className="relative max-w-xl py-10">
        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-medium text-indigo-50">
          <span className="h-2 w-2 rounded-full bg-emerald-300" /> A little
          closer, wherever you are
        </div>
        <h1 className="text-5xl font-semibold leading-[1.12] tracking-tight xl:text-6xl">
          Good conversations start here.
        </h1>
        <p className="mt-6 max-w-md text-lg leading-8 text-indigo-100">
          Make space for the people who make your day. Connect, share, and stay
          in the loop.
        </p>
        <div className="mt-12 flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
          <div className="flex -space-x-3">
            {communityColors.map((color, index) => (
              <div
                key={color}
                className="grid h-10 w-10 place-items-center rounded-full border-2 border-indigo-700 text-xs font-bold text-indigo-900"
                style={{ backgroundColor: color }}
              >
                {communityInitials[index]}
              </div>
            ))}
          </div>
          <p className="text-sm text-indigo-50">
            Your next favorite conversation is one hello away.
          </p>
        </div>
      </div>
      <p className="relative text-xs text-indigo-200">
        © 2026 Linksy · Made for meaningful connections
      </p>
    </aside>
  );
}
