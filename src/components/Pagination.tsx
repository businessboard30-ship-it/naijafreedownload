export default function Pagination({ page, pageCount, onChange }: { page: number; pageCount: number; onChange: (p: number) => void }) {
  if (pageCount <= 1) return null;
  const start = Math.max(1, Math.min(page - 2, pageCount - 4));
  const pages = Array.from({ length: Math.min(5, pageCount) }, (_, i) => start + i);
  return (
    <nav className="pagination" aria-label="Pagination">
      <button className="btn" disabled={page === 1} onClick={() => onChange(page - 1)}>Previous</button>
      {pages.map((p) => (
        <button key={p} className={`btn${p === page ? ' btn-current' : ''}`} aria-current={p === page ? 'page' : undefined} aria-label={`Page ${p}`} onClick={() => onChange(p)}>{p}</button>
      ))}
      <button className="btn" disabled={page === pageCount} onClick={() => onChange(page + 1)}>Next</button>
    </nav>
  );
}
