export interface BlipBlockViewModel {
  udi: string;
  contentTypeKey: string;
  label: string;
  icon: string;
  value: Array<{ alias: string; value?: unknown }> | undefined;
}
