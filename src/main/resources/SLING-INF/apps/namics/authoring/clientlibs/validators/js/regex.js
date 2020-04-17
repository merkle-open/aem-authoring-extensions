/**
 * Use this validator to validate with a regular expression.
 * To use it add attributes "regex" and "regex-errormsg" to your field definition in the dialog.xml
 * E.g. for coral ui 2
 * regex="^#(\\w|\\d)+$"
 * regex-errormsg="Anchor Id must start with # and may only contain characters and digits"
 *
 * for coral ui 3 use the granit:data attribute.
 * https://helpx.adobe.com/experience-manager/6-5/sites/developing/using/reference-materials/granite-ui/api/jcr_root/libs/granite/ui/docs/server/commonattrs.html
 */
(function (window, $) {
    "use strict";

    $(window).adaptTo("foundation-registry").register("foundation.validation.validator", {
        selector: "[data-regex]",
        validate: function (el) {
            var $field = $(el).closest(".coral-Form-field"),
                regexp = new RegExp($field.data("regex")),
                errorMessage = $field.data("regex-errormsg");

            if ($field.val() && null == $field.val().match(regexp)) {
                if (errorMessage) {
                    return errorMessage;
                } else {
                    return Granite.I18n.get('The entered value does not meet the criteria ({0})', [regexp]);
                }
            }
        }
    });

})(window, Granite.$);
