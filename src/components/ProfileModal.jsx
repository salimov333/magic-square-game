import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, UserRound, X } from 'lucide-react'
import { useGameStore } from '../store/useGameStore'
import { useTranslation } from '../i18n'
import { formatTime } from '../utils/format'

export function ProfileModal({ onClose }) {
  const { t } = useTranslation()
  const { profiles, activeProfileId, addProfile, selectProfile, deleteProfile } = useGameStore()
  const [name, setName] = useState('')
  const submit = (event) => { event.preventDefault(); if (name.trim()) { addProfile(name); setName('') } }
  return <div className="modal-backdrop" onMouseDown={onClose}>
    <motion.section className="modal" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} onMouseDown={(e) => e.stopPropagation()}>
      <div className="modal-heading"><div><span className="eyebrow">LOCAL PLAYERS</span><h2>{t('profiles')}</h2></div><button className="icon-button" onClick={onClose} aria-label={t('cancel')}><X /></button></div>
      <div className="profile-list">{profiles.map((profile) => <div key={profile.id} className={`profile-row ${activeProfileId === profile.id ? 'active' : ''}`}>
        <button className="profile-select" onClick={() => selectProfile(profile.id)}>
          <span className="avatar"><UserRound size={20} /></span><span className="profile-data"><strong>{profile.name}</strong><small>{profile.completedSizes.length} {t('completed')} · {formatTime(profile.totalTime)}</small></span>
        </button>
        {profiles.length > 1 && <button className="delete-action" onClick={() => deleteProfile(profile.id)} title={t('delete')} aria-label={`${t('delete')}: ${profile.name}`}><Trash2 size={17} /></button>}
      </div>)}</div>
      <form className="profile-form" onSubmit={submit}><input value={name} onChange={(e) => setName(e.target.value)} maxLength={24} placeholder={t('username')} /><button className="primary-button" disabled={!name.trim()}><Plus size={18} /> {t('add')}</button></form>
    </motion.section>
  </div>
}
