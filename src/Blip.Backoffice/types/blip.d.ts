interface IBlipBlock {
    contentTypeKey: string;
    settingsTypeKey?: string;
    layout: any;
    udi: string;
    id: number;

    _label: string;
    _view: string;
    _stylesheet: string;
    _selected: boolean;
    _icon: string;
    _iconRaw: string;
    _iconColor: string;
}