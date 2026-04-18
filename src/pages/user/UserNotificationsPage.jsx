import { useState, useEffect } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { notificationService } from '../../services/notificationService'
import { Button, Badge, toast } from '../../components/ui'
import { SectionLoader } from '../../components/ui/Spinner'
import { useTranslation } from '../../i18n'

export default function UserNotificationsPage() {
  const { t } = useTranslation()
  const { team } = useAuthStore()
  const teamId = team?.id

  const [isLoading, setIsLoading] = useState(true)
  const [notifications, setNotifications] = useState([])
  const [markingRead, setMarkingRead] = useState(false)

  const fetchNotifications = async () => {
    setIsLoading(true)
    try {
      const fetchedNotifications = await notificationService.getNotifications(teamId)
      setNotifications(fetchedNotifications || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast.error('Failed to load notifications')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (teamId) {
      fetchNotifications()
    } else {
      setIsLoading(false)
    }
  }, [teamId])

  const handleMarkAsRead = async (notif) => {
    if (notif.is_read) return;
    setNotifications(notifs => notifs.map(n => n.id === notif.id ? { ...n, is_read: true } : n))
    try {
      await notificationService.markAsRead(notif)
    } catch (error) {
      console.warn('Failed to mark read', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    setMarkingRead(true)
    setNotifications(notifs => notifs.map(n => ({ ...n, is_read: true })))
    try {
      await notificationService.markAllAsRead(teamId)
    } catch (error) {
      console.warn('Failed to mark all read', error)
    } finally {
      setMarkingRead(false)
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  if (isLoading) {
    return <SectionLoader message="Loading updates..." />
  }

  return (
    <div className="py-8 md:py-12 px-4 md:px-8 max-w-4xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-primary mb-2 block">Updates</span>
          <h1 className="text-3xl md:text-4xl font-black tracking-[-0.03em] text-on-surface mb-2">Notifications</h1>
          <p className="text-on-surface-variant leading-relaxed max-w-xl">
            Stay up to date with your upcoming matches, results, and important tournament announcements.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            type="button"
            variant="ghost"
            onClick={handleMarkAllAsRead}
            disabled={markingRead}
            icon="done_all"
          >
            Mark all as read
          </Button>
        )}
      </header>

      <div className="bg-surface-container-low rounded-[2rem] p-4 md:p-8 whisper-shadow min-h-[400px]">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-6xl text-outline mb-4">notifications_off</span>
            <h3 className="text-xl font-bold text-on-surface mb-2">No Updates Yet</h3>
            <p className="text-on-surface-variant max-w-sm">
              You're all caught up! When there are new announcements or match updates, they will appear here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {notifications.map(notif => (
              <div 
                key={notif.id} 
                onClick={() => handleMarkAsRead(notif)}
                className={`flex gap-4 p-5 rounded-[1.5rem] transition-colors border border-outline-variant/10 ${
                  notif.is_read 
                    ? 'bg-surface-container-lowest' 
                    : 'bg-primary-container/20 hover:bg-primary-container/30 cursor-pointer'
                }`}
              >
                <div className="pt-1">
                  <span className={`material-symbols-outlined text-xl p-2 rounded-xl bg-surface-container-highest/50 ${
                    notif.type === 'important' ? 'text-error' : 
                    notif.type === 'result' ? 'text-tertiary' : 
                    'text-primary'
                  }`}>
                    {notif.type === 'important' ? 'warning' : notif.type === 'result' ? 'emoji_events' : 'info'}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${notif.is_read ? 'text-outline' : 'text-primary'}`}>
                      {notif.type === 'important' ? 'Alert' : notif.type === 'result' ? 'Match Result' : 'General'}
                    </span>
                    <span className="text-xs text-on-surface-variant tabular-nums">
                      {new Date(notif.created_at).toLocaleDateString('en-IN', { 
                        month: 'short', day: 'numeric', 
                        hour: '2-digit', minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  
                  <p className={`text-base leading-relaxed mt-1 ${notif.is_read ? 'text-on-surface-variant' : 'text-on-surface font-semibold'}`}>
                    {notif.message}
                  </p>
                </div>

                {!notif.is_read && (
                  <div className="flex flex-col items-center justify-center pl-2">
                    <span className="w-2.5 h-2.5 bg-primary rounded-full" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
