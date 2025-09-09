
export enum Mode {
  Create = 'create',
  Edit = 'edit',
}

export enum CreateFunction {
  Free = 'free',
  Sticker = 'sticker',
  Text = 'text',
  Comic = 'comic',
}

export enum EditFunction {
  AddRemove = 'add-remove',
  Retouch = 'retouch',
  Style = 'style',
  Compose = 'compose',
}

export interface UploadedImage {
  file: File;
  base64: string;
  mimeType: string;
}
