import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, UserRound, X } from 'lucide-react'
import { useGameStore } from '../store/useGameStore'
import { useTranslation } from '../i18n'
import { formatTime } from '../utils/format'
import { LanguageSwitcher } from './LanguageSwitcher'

export function ProfileModal({ onClose, onSelect, onCreate, required = false }) {
  const { t } = useTranslation()
  const { profiles, activeProfileId, addProfile, selectProfile, deleteProfile } = useGameStore()
  const [name, setName] = useState('')
  const [profileToDelete, setProfileToDelete] = useState(null)
  const choose = (id) => { selectProfile(id); onSelect?.(id); onClose?.() }
  const submit = (event) => {
    event.preventDefault()
    if (!name.trim()) return
    if (onCreate) onCreate(name.trim())
    else addProfile(name)
    setName('')
    if (!required) onClose?.()
  }
  return <div className={`modal-backdrop ${required ? 'profile-entry' : ''}`} onMouseDown={required ? undefined : onClose}>
    <motion.section className="modal" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} onMouseDown={(e) => e.stopPropagation()} aria-label={t('profiles')}>
      <div className="modal-heading"><div><span className="eyebrow">{t('localPlayers')}</span><h2>{required ? t('chooseProfile') : t('profiles')}</h2></div><div className="profile-heading-actions">{required && <LanguageSwitcher />}{!required && <button className="icon-button" onClick={onClose} aria-label={t('cancel')}><X /></button>}</div></div>
      {required && <p className="profile-entry-copy">{profiles.length ? t('chooseSavedProfile') : t('createFirstProfile')}</p>}
      <div className="profile-list">{profiles.map((profile) => <div key={profile.id} className={`profile-row ${activeProfileId === profile.id ? 'active' : ''}`}>
        <button className="profile-select" onClick={() => choose(profile.id)}>
          <span className="avatar"><UserRound size={20} /></span><span className="profile-data"><strong>{profile.name}</strong><small>{profile.completedSizes.length} {t('completed')} · {formatTime(profile.totalTime)}</small></span>
        </button>
        {profiles.length > 1 && <button className="delete-action" onClick={() => setProfileToDelete(profile)} title={t('delete')} aria-label={`${t('delete')}: ${profile.name}`}><Trash2 size={17} /></button>}
      </div>)}</div>
      {profileToDelete && <div className="delete-confirmation" role="alertdialog" aria-modal="true" aria-labelledby="delete-profile-title">
        <div><strong id="delete-profile-title">{t('deleteConfirmTitle')}</strong><p>{t('deleteConfirmText')}</p><b className="delete-profile-name">{profileToDelete.name}</b></div>
        <div className="delete-confirmation-actions"><button className="secondary-button" onClick={() => setProfileToDelete(null)}>{t('cancel')}</button><button className="danger-button" onClick={() => { deleteProfile(profileToDelete.id); setProfileToDelete(null) }}>{t('confirmDelete')}</button></div>
      </div>}
      <form className="profile-form" onSubmit={submit}><input value={name} onChange={(e) => setName(e.target.value)} maxLength={24} placeholder={t('username')} autoFocus={required} /><button className="primary-button" disabled={!name.trim()}><Plus size={18} /> {t('add')}</button></form>
    </motion.section>
  </div>
}
