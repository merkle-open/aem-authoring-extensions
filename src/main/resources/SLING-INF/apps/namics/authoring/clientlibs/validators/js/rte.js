/**
 * Validates rich text editor (RTE) for maximum number of characters restriction. This validator only counts the text characters of
 * a rich text editor. HTML tags are ignored, leading/trailing spaces are counted as one character.
 *
 * Usage: set attribute "maxlength" with max. number of characters as value (e.g. maxlength="100")
 */

(function (window, $) {
    "use strict";

    /**
     * Performs the validation of the RTE
     */
    function performValidation(el) {
        var api = el.adaptTo("foundation-validation");
        if (api) {
            api.checkValidity();
            api.updateUI();
        }
    }

    // get global foundation registry
    var registry = $(window).adaptTo("foundation-registry");

    // register selector for rich text editor
    registry.register("foundation.validation.selector", {
        submittable: ".richtext-container input.coral-Textfield",
        candidate: ".richtext-container input.coral-Textfield:not([disabled]):not([data-renderreadonly=true])",
        exclusion: ".richtext-container input.coral-Textfield *"
    });

    // register validator for RTE
    registry.register("foundation.validation.validator", {
        selector: ".coral-RichText-editable",
        validate: function (el) {
            var $field = $(el).closest(".richtext-container").find("input.coral-Textfield"),
                $rteField = $(el), maxLength = $field.data("maxlength");

            // validate if maxLength restriction is met
            var textLength = $rteField.text().trim().length;
            if (maxLength && textLength > maxLength) {
                return Granite.I18n.get('Your text length is {0} but max. number of characters are {1}!', [textLength, maxLength]);
            }

            return null;
        }
    });

    // perform validation every time rich text editor changed
    $(document).on("change", ".coral-RichText-editable", function (e) {
        performValidation($(this));
    });

})(window, Granite.$);
