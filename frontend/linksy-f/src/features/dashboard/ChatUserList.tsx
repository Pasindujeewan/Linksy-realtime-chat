import { UsersRound } from "lucide-react";

export default function ChatUserList() {
  return (
    <section
      aria-labelledby="people-heading"
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2
            id="people-heading"
            className="text-lg font-semibold text-slate-900"
          >
            People to chat with
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Find someone and start a conversation.
          </p>
        </div>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
          <UsersRound aria-hidden="true" className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-8 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
        <UsersRound
          aria-hidden="true"
          className="mx-auto h-8 w-8 text-slate-400"
        />
        <h3 className="mt-3 text-sm font-semibold text-slate-800">
          The people directory is not available yet
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          Your backend currently provides profile lookup, but not an endpoint
          for discovering other users. Once that endpoint is available, people
          will appear here.
        </p>
      </div>
    </section>
  );
}
