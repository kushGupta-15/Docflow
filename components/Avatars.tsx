'use client'

import { useOthers, useSelf } from '@liveblocks/react/suspense'
import stringToColor from '@/lib/stringToColor'

function Avatars() {
  const others = useOthers()
  const self = useSelf()

  const allUsers = [
    ...(self ? [{ id: 'self', info: self.info, isSelf: true }] : []),
    ...others.map((other) => ({ id: other.connectionId.toString(), info: other.info, isSelf: false }))
  ]

  if (allUsers.length === 0) return null

  return (
    <div className="flex items-center gap-2">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:inline">
        Active Users ({allUsers.length}):
      </p>
      <div className="flex -space-x-2 overflow-hidden items-center">
        {allUsers.slice(0, 5).map((user) => {
          const name = user.info?.name || user.info?.email?.split('@')[0] || (user.isSelf ? 'You' : 'Anonymous')
          const email = user.info?.email || 'user'
          const color = stringToColor(email)
          const initials = name.slice(0, 2).toUpperCase()

          return (
            <div
              key={user.id}
              title={`${name} ${user.isSelf ? '(You)' : ''} - ${email}`}
              className="relative inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-white text-white text-xs font-bold shadow-sm transition-transform hover:scale-110 hover:z-10 cursor-pointer"
              style={{ backgroundColor: color }}
            >
              {user.info?.avatar ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={user.info.avatar}
                  alt={name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
          )
        })}

        {allUsers.length > 5 && (
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-white bg-gray-600 text-white text-xs font-bold shadow-sm">
            +{allUsers.length - 5}
          </div>
        )}
      </div>
    </div>
  )
}

export default Avatars
