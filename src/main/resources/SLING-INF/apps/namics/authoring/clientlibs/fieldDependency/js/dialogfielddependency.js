/**
 * Extension for dialogs to enable dependencies between fields. Fields can be shown / hidden based on the selection of
 * other fields.
 *
 * How to use in AEM dialog definitions:
 *
 * Source field (field that contains the selected value):
 * - add attribute "fd-source-id". Value should be an identifier (string)
 * Target fields (fields that are shown / hidden depending on selected source field value):
 * - add attribute "fd-values-<identifier>" to each target field that should be shown/hidden. Replace "<identifier>" with the identifier you've chosen for the source field.
 *   You can add multiple values separated by space. If any of these values were selected by the source field, this field will be visible.
 */
(function (document, ns, $) {
    "use strict";

    $(document).on("dialog-ready", function () {
        $("[" + ns.AbstractDialogField.ATTR_ID + "]").each(function () {
            var dialogElem = this;
            waitForCoralElements(['.coral3-Panel'], this).then(function () {
                if ($(dialogElem).hasClass("coral-RadioGroup")) {
                    // handle radio group
                    new ns.DialogFieldRadio($(dialogElem));
                } else if ($(dialogElem).hasClass("coral-Select") || $(dialogElem).hasClass("coral3-Select")) {
                    // handle select
                    new ns.DialogFieldSelect($(dialogElem));
                } else if ($(dialogElem).hasClass("coral-Checkbox-input") || $(dialogElem).hasClass("coral3-Checkbox")) {
                    // handle checkbox for coral ui 2 and ui 3
                    new ns.DialogFieldCheckbox($(dialogElem));
                }
            });
        });
    });

    function waitForCoralElements(selectors, dialog){
        return Promise.all(selectors.map(function (selector) {
            return Promise.all($(selector,dialog).get().map(function (coralelem) {
                return new Promise(function (resolve) {
                    Coral.commons.ready(coralelem, resolve);
                })
            }))

        }))
    }

})(document, Namics.authoring, Granite.$);