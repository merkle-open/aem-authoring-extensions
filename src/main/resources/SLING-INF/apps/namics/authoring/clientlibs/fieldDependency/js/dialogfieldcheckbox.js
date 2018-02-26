/**
 * @class Namics.authoring.DialogFieldCheckbox
 * <p>This class is an implementation of a dialog checkbox field and extends {@link Namics.authoring.AbstractDialogField}.</p>
 * <p>It register checkbox specific onChange events and provides a function to retrieve the selected value.</p>
 */
(function (ns, $) {
    "use strict";

    ns.DialogFieldCheckbox = class extends ns.AbstractDialogField {
        /**
         * Register listener for relevant events
         *
         * @param sourceElement The source element object for which to register events
         */
        registerEvents(sourceElement) {
            var ctrl = this;
            sourceElement.$el.on("change", function (event) {
                ctrl.handleVisibility(sourceElement, event);
            });
        }

        /**
         * @param sourceElement The source element object for which to get its value
         * @returns Value of the source element
         */
        getValue(sourceElement) {
            return sourceElement.$el.is(":checked");
        }
    }

})(Namics.authoring, Granite.$);