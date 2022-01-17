interface UmbNode {
    id: number;
    variants: Array<UmbVariant>;
    allowedActions: Array<string>;
}

interface UmbVariant {
    active?: boolean;
    language: UmbLanguage;
    publishDate?: string;
}

interface UmbBlock {
    contentElementTypeKey: string;
    settingsElementTypeKey?: string;
    backgroundColor?: string;
    contentTypeName: string;
    editorSize: string;
    forceHideContenteditorInOverlay: boolean;
    iconColor?: string;
    label: string;
    stylesheet?: string;
    view?: string;
    thumbnail?: string;
}