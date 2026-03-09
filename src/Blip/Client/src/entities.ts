export interface BlipBlockViewModel {
  key: string;
  contentTypeKey: string;
  label: string;
  icon: string;
  value: Array<BlipBlockValueModel> | undefined;
}

export interface BlipBlockValueModel {
  alias: string;
  value?: unknown;
}
