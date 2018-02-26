/**
 * @class Namics.authoring.DialogFieldSelect
 * <p>This class is an implementation of a dialog select field and extends {@link Namics.authoring.AbstractDialogField}.</p>
 * <p>It register select specific onChange events and provides a function to retrieve the selected value.</p>
 */
(function (ns, $) {
    "use strict";

    ns.DialogFieldSelect = class extends ns.AbstractDialogField {
        /**
         * Register listener for relevant events
         *
         * @param sourceElement The source element object for which to register events
         */
        registerEvents (sourceElement) {
            var ctrl = this;
            sourceElement.$el.on("selected", function (event) {
                ctrl.handleVisibility(sourceElement, event);
            });
        }

        /**
         * @param sourceElement The source element object for which to get its value
         * @returns Value of source field
         */
        getValue (sourceElement) {
            return sourceElement.$el.find(".coral-Select-select option:selected").val();
        }
    }

})(Namics.authoring, Granite.$);