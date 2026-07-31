export function formatIconDisplayName(name: string): string {
  return name.startsWith('eds-') ? name : `eds-${name}`;
}
