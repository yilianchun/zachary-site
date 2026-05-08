export function entrySlug(id: string) {
  return id.replace(/\/index\.mdx?$/, '').replace(/\.mdx?$/, '');
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}