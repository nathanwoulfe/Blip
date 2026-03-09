import { property, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { UMB_PROPERTY_CONTEXT } from "@umbraco-cms/backoffice/property";
import {
  extractJsonQueryProps,
  UMB_VALIDATION_EMPTY_LOCALIZATION_KEY,
  UmbFormControlMixin,
  UmbValidationContext,
} from "@umbraco-cms/backoffice/validation";
import {
  BlipBlockEntriesContext,
  BlipBlockListManagerContext,
} from "../context";

export abstract class BlipEditorElementBase extends UmbFormControlMixin<
  Array<string> | undefined,
  typeof UmbLitElement,
  undefined
>(UmbLitElement) {
  protected readonly validationContext = new UmbValidationContext(this);
  protected readonly managerContext = new BlipBlockListManagerContext(this);
  protected readonly entriesContext = new BlipBlockEntriesContext(this);

  @property({ type: Boolean })
  mandatory?: boolean;

  @property({ type: String })
  mandatoryMessage?: string | undefined;

  @state() protected _limitMin?: number;
  @state() protected _limitMax?: number;

  constructor() {
    super();

    this.consumeContext(UMB_PROPERTY_CONTEXT, (context) => {
      this.observe(context?.dataPath, (dataPath) => {
        if (dataPath) {
          // Set the data path for the local validation context:
          this.validationContext.setDataPath(dataPath);
          this.validationContext.autoReport();
        }
      });
    });

    this.addValidator(
      "rangeUnderflow",
      () =>
        this.localize.term(
          "validation_entriesShort",
          this._limitMin,
          (this._limitMin ?? 0) - this.entriesContext.getLength(),
        ),
      () =>
        !!this._limitMin && this.entriesContext.getLength() < this._limitMin,
    );

    this.addValidator(
      "rangeOverflow",
      () =>
        this.localize.term(
          "validation_entriesExceed",
          this._limitMax,
          this.entriesContext.getLength() - (this._limitMax || 0),
        ),
      () =>
        !!this._limitMax && this.entriesContext.getLength() > this._limitMax,
    );

    this.addValidator(
      "valueMissing",
      () => this.mandatoryMessage ?? UMB_VALIDATION_EMPTY_LOCALIZATION_KEY,
      () => {
        if (!this.mandatory) return false;
        return (this.value?.length ?? 0) === 0;
      },
    );

    this.observe(
      this.managerContext.layouts,
      (layouts) => {
        const validationMessagesToRemove: string[] = [];
        const contentKeys = layouts.map((x) => x.contentKey);
        this.validationContext.messages
          .getMessagesOfPathAndDescendant("$.contentData")
          .forEach((message) => {
            const key = extractJsonQueryProps(message.path).key;
            if (key && contentKeys.indexOf(key) === -1) {
              validationMessagesToRemove.push(message.key);
            }
          });

        const settingsKeys = layouts
          .map((x) => x.settingsKey)
          .filter((x) => x !== undefined) as string[];

        this.validationContext.messages
          .getMessagesOfPathAndDescendant("$.settingsData")
          .forEach((message) => {
            const key = extractJsonQueryProps(message.path).key;
            if (key && settingsKeys.indexOf(key) === -1) {
              validationMessagesToRemove.push(message.key);
            }
          });

        this.validationContext.messages.removeMessageByKeys(
          validationMessagesToRemove,
        );
      },
      null,
    );
  }
}
