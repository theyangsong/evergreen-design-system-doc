import type { IconDisplayParams, IconRegistryEntry } from '@/icons/types';

type ZipFileEntry = {
  name: string;
  content: string;
};

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;

  for (let index = 0; index < bytes.length; index += 1) {
    crc ^= bytes[index];
    for (let bit = 0; bit < 8; bit += 1) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function u16(value: number): number[] {
  return [value & 0xff, (value >>> 8) & 0xff];
}

function u32(value: number): number[] {
  return [
    value & 0xff,
    (value >>> 8) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 24) & 0xff,
  ];
}

function encodeUtf8(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

function buildZipBlob(files: ZipFileEntry[]): Blob {
  const chunks: Uint8Array[] = [];
  const centralDirectory: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = encodeUtf8(file.name);
    const contentBytes = encodeUtf8(file.content);
    const crc = crc32(contentBytes);
    const localHeader = new Uint8Array([
      0x50, 0x4b, 0x03, 0x04,
      20, 0,
      0, 0,
      0, 0,
      ...u32(crc),
      ...u32(contentBytes.length),
      ...u32(contentBytes.length),
      ...u16(nameBytes.length),
      0,
      ...nameBytes,
    ]);

    chunks.push(localHeader, contentBytes);

    const centralHeader = new Uint8Array([
      0x50, 0x4b, 0x01, 0x02,
      20, 0,
      20, 0,
      0, 0,
      0, 0,
      ...u32(crc),
      ...u32(contentBytes.length),
      ...u32(contentBytes.length),
      ...u16(nameBytes.length),
      0, 0,
      0, 0,
      0, 0,
      ...u32(offset),
      ...nameBytes,
    ]);

    centralDirectory.push(centralHeader);
    offset += localHeader.length + contentBytes.length;
  }

  const centralBytes = new Uint8Array(
    centralDirectory.reduce((total, chunk) => total + chunk.length, 0),
  );
  let centralOffset = 0;
  for (const chunk of centralDirectory) {
    centralBytes.set(chunk, centralOffset);
    centralOffset += chunk.length;
  }

  const endRecord = new Uint8Array([
    0x50, 0x4b, 0x05, 0x06,
    0, 0,
    0, 0,
    ...u16(files.length),
    ...u16(files.length),
    ...u32(centralBytes.length),
    ...u32(offset),
    0, 0,
  ]);

  return new Blob(
    [...chunks, centralBytes, endRecord] as BlobPart[],
    { type: 'application/zip' },
  );
}

export function downloadSvgFile(name: string, svg: string) {
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${name}.svg`;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadIconsZip(
  entries: IconRegistryEntry[],
  params: IconDisplayParams,
  renderSvg: (entry: IconRegistryEntry, params: IconDisplayParams) => string,
  filename = 'evergreen-icons.zip',
) {
  const files = entries.map((entry) => ({
    name: `${entry.name}.svg`,
    content: renderSvg(entry, params),
  }));

  const blob = buildZipBlob(files);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
