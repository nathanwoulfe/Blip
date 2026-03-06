import { BLIP_BLOCK_LIST_PROPERTY_EDITOR_SCHEMA_ALIAS, BLIP_BLOCK_LIST_PROPERTY_EDITOR_UI_ALIAS } from './constants.js';
import type { ManifestPropertyEditorSchema } from '@umbraco-cms/backoffice/property-editor';

export const manifest: ManifestPropertyEditorSchema = {
	type: 'propertyEditorSchema',
	name: 'Block List Item Picker',
	alias: BLIP_BLOCK_LIST_PROPERTY_EDITOR_SCHEMA_ALIAS,
	meta: {
		defaultPropertyEditorUiAlias: BLIP_BLOCK_LIST_PROPERTY_EDITOR_UI_ALIAS,
		settings: {
      defaultData: [
        { alias: "minNumber", value: 0 },
        { alias: "maxNumber", value: 0 },
      ],
			properties: [
				{
					alias: 'sourceNode',
					label: 'Source Node',
					description: 'Select the content node containing the Block List.',
					propertyEditorUiAlias: 'Umb.PropertyEditorUi.DocumentPicker',
				},
				{
					alias: 'sourceProperty',
					label: 'Source Property',
					description: 'The alias of the Block List property on the source node.',
					propertyEditorUiAlias: 'Umb.PropertyEditorUi.TextBox',
				},
				{
					alias: 'minNumber',
					label: 'Minimum Items',
					description: 'Minimum number of items required.',
					propertyEditorUiAlias: 'Umb.PropertyEditorUi.Integer',
				},
				{
					alias: 'maxNumber',
					label: 'Maximum Items',
					description: 'Maximum number of items allowed. Use 1 for single picker.',
					propertyEditorUiAlias: 'Umb.PropertyEditorUi.Integer',
				},
			],
		},
	},
};
