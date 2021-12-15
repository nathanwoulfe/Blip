import { BlipEditorController } from './blip.editor.controller';
import { BlipSourcePropertyPrevalueController } from './blip.sourceproperty.prevalue.controller';
import { BlipBlockPickerOverlayController } from './blip.blockpicker.overlay.controller';

export const ControllersModule = angular
    .module('blip.controllers', [])
    .controller(BlipEditorController.controllerName, BlipEditorController)
    .controller(BlipSourcePropertyPrevalueController.controllerName, BlipSourcePropertyPrevalueController)
    .controller(BlipBlockPickerOverlayController.controllerName, BlipBlockPickerOverlayController)
    .name;