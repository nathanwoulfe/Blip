export interface BlipBlockViewModel {
  key: string;
  contentTypeKey: string;
  label: string;
  icon: string;
  value: Array<{ alias: string; value?: unknown }> | undefined;
}
