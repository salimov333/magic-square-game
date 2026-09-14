export function Logo({ compact = false }) {
  return (
    <div className={`logo ${compact ? 'logo-compact' : ''}`} aria-hidden="true">
      {[8, 1, 6, 3, 5, 7, 4, 9, 2].map((number) => <span key={number}>{number}</span>)}
    </div>
  )
}
