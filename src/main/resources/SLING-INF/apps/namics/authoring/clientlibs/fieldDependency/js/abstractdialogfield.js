/**
 * @class Namics.authoring.AbstractDialogField
 * <p>This class is the base class that gets extended by specific dialog fields.</p>
 * @constructor
 * Creates a new instance and binds it to the DOM element.
 * @param {DOM element} el DOM element of the field
 */
(function (ns, $) {
    "use strict";

    ns.AbstractDialogField = class {

        static get CSS_CLASS_HIDE() {
            return "hide";
        }

        static get ATTR_ID() {
            return "data-fd-source-id";
        }

        static get ATTR_PREFIX_VALUE() {
            return "data-fd-values-";
        }

        static get ATTR_REQUIRED() {
            return "data-fd-required";
        }

        static get DATA_ATTR_VISIBLE() {
            return "fd-target-visible";
        }

        constructor(el) {
            if (new.target === ns.AbstractDialogField) {
                throw new TypeError("Cannot instantiate AbstractDialogField");
            }

            if (!el) {
                throw new Error("Element must be defined")
            }
            if (!$.isFunction(this.getValue)) {
                throw new Error("Function 'getValue' is missing in DialogField object");
            }
            if (!$.isFunction(this.registerEvents)) {
                throw new Error("Function 'registerEvents' is missing in DialogField object");
            }

            var id = $(el).attr(ns.AbstractDialogField.ATTR_ID);
            this.sourceElements = {};
            this.sourceElements[id] = {
                id: id,
                $el: $(el),
                targetElements: []
            };

            this.initTargetElements(this.sourceElements[id]);
            this.registerEvents(this.sourceElements[id]);
            this.handleVisibility(this.sourceElements[id]);
        }

        /**
         * Retrieves all DOM elements of target fields for the current source field
         *
         * @param sourceElement The source element object for which to get target elements
         */
        initTargetElements(sourceElement) {
            sourceElement.$targetElements = $("[" + ns.AbstractDialogField.ATTR_PREFIX_VALUE + sourceElement.id + "]")
                .not("[" + ns.AbstractDialogField.ATTR_ID + "='" + sourceElement.id + "']");
        }

        /**
         * Handles the visibility of the display elements to be shown or hidden
         *
         * @param sourceElement The source element object for which to handle visibility
         * @param event Event that was triggered. Can be undefined if function is executed directly without an event.
         */
        handleVisibility(sourceElement, event) {
            var ctrl = this,
                value = this.getValue(sourceElement);

            sourceElement.$targetElements.each(function () {
                var $el = $(this),
                    visibleElementsSelector = "[" + ns.AbstractDialogField.ATTR_PREFIX_VALUE + sourceElement.id + "~='" + value + "']";

                if (ctrl.isPane($el)) {
                    ctrl.handleVisibilityForPane($el, sourceElement.id, value);
                    return;
                }

                // save if field was required into separate data attribute
                if (!$el.attr(ns.AbstractDialogField.ATTR_REQUIRED)) {
                    $el.attr(ns.AbstractDialogField.ATTR_REQUIRED, $el.attr("aria-required"));
                }

                // show or hide target element
                var sourceVisibilities = $el.data(ns.AbstractDialogField.DATA_ATTR_VISIBLE) || [];
                if ($el.find(visibleElementsSelector).addBack(visibleElementsSelector).length) {
                    // add id of source element to visible attribute
                    var filteredSourceVisibilities = sourceVisibilities.filter(e => e !== sourceElement.id);
                    filteredSourceVisibilities.push(sourceElement.id);
                    $el.data(ns.AbstractDialogField.DATA_ATTR_VISIBLE, filteredSourceVisibilities);
                    // call function to show element
                    ctrl.show($el);
                    // set original "aria-required" attribute if target element is being shown
                    $el.attr("aria-required", $el.attr(ns.AbstractDialogField.ATTR_REQUIRED));
                } else {
                    // remove id of source element from visible attribute
                    var filteredSourceVisibilities = sourceVisibilities.filter(e => e !== sourceElement.id);
                    $el.data(ns.AbstractDialogField.DATA_ATTR_VISIBLE, filteredSourceVisibilities);
                    if (!filteredSourceVisibilities.length) {
                        // call function to hide element
                        ctrl.hide($el);
                        // remove original "aria-required" attribute if target element is being hidden
                        $el.attr("aria-required", false);
                    }
                }
                // trigger validation after setting or removing the "aria-required" attribute
                $el.checkValidity();
            });
        }

        /**
         * Handles the visibility for a pane
         *
         * @param $paneTargetElement The pane target element for which to handle visibility
         * @param value Value of source element
         */
        handleVisibilityForPane($paneTargetElement, sourceElementId, value) {
            var ctrl = this, $fields = $('.coral-Form-field', $paneTargetElement),
                visibleElementsSelector = "[" + ns.AbstractDialogField.ATTR_PREFIX_VALUE + sourceElementId + "~='" + value + "']",
                isPaneVisible = $paneTargetElement.find(visibleElementsSelector).addBack(visibleElementsSelector).length > 0;

            // show / hide tab itself
            var sourceVisibilities = $paneTargetElement.data(ns.AbstractDialogField.DATA_ATTR_VISIBLE) || [];
            var filteredSourceVisibilities = sourceVisibilities.filter(e => e !== sourceElementId);

            // show / hide fields within the tab
            $fields.each(function () {
                var $el = $(this);
                // save if field was required into separate data attribute
                if (!$el.attr(ns.AbstractDialogField.ATTR_REQUIRED)) {
                    $el.attr(ns.AbstractDialogField.ATTR_REQUIRED, $el.attr("aria-required"));
                }

                // show or hide target element
                if (isPaneVisible) {
                    ctrl.show($el);
                    // set original "aria-required" attribute if target element is being shown
                    $el.attr("aria-required", $el.attr(ns.AbstractDialogField.ATTR_REQUIRED));
                } else {
                    if (!filteredSourceVisibilities.length) {
                        ctrl.hide($el);
                        // remove original "aria-required" attribute if target element is being hidden
                        $el.attr("aria-required", false);
                    }
                }
                // trigger validation after setting or removing the "aria-required" attribute
                $el.checkValidity();
            });

            if (isPaneVisible) {
                // add id of source element to visible attribute
                var filteredSourceVisibilities = sourceVisibilities.filter(e => e !== sourceElementId);
                filteredSourceVisibilities.push(sourceElementId);
                $paneTargetElement.data(ns.AbstractDialogField.DATA_ATTR_VISIBLE, filteredSourceVisibilities);
                // show tab pane
                ctrl.show($paneTargetElement);
            } else {
                // remove id of source element from visible attribute
                var filteredSourceVisibilities = sourceVisibilities.filter(e => e !== sourceElementId);
                $paneTargetElement.data(ns.AbstractDialogField.DATA_ATTR_VISIBLE, filteredSourceVisibilities);
                if (!filteredSourceVisibilities.length) {
                    // hide tab pane
                    ctrl.hide($paneTargetElement);
                }
            }
        }

        /**
         * Shows the display elements based on the DOM element of target field
         *
         * @param $targetElement The jQuery target element to show
         */
        show($targetElement) {
            var $displayElements = this.retrieveDisplayElements($targetElement);
            $displayElements.removeClass(ns.AbstractDialogField.CSS_CLASS_HIDE);
        }

        /**
         * Hides the display elements based on the DOM element of target field
         *
         * @param $targetElement The jQuery target element to hide
         */
        hide($targetElement) {
            var $displayElements = this.retrieveDisplayElements($targetElement);
            $displayElements.addClass(ns.AbstractDialogField.CSS_CLASS_HIDE);
        }

        /**
         * Retrieves all display elements that will be shown or hidden
         *
         * @param $targetElement The jQuery target element for which to retrieve display elements
         * @returns Display elements to show or hide
         */
        retrieveDisplayElements($targetElement) {
            if (this.isPane($targetElement)) {
                return this.retrieveDisplayElementForDialogPane($targetElement);
            }

            // return field wrapper of target element if it exists
            var $fieldWrapper = $targetElement.closest(".coral-Form-fieldwrapper");
            if ($fieldWrapper.length) {
                return $fieldWrapper;
            }
            // default is to return field wrapper of target element
            return $targetElement;
        }

        /**
         * Retrieves the display elements in case of target field being a dialog pane
         *
         * @param $pane The jQuery pane element for which to retrieve display elements
         */
        retrieveDisplayElementForDialogPane($pane) {
            // target is a dialog panel -> also hide the tab on top
            var tabId = $pane.attr('id'),
                $tab = $('.coral-Dialog-content nav .coral-TabPanel-tab[aria-controls=' + tabId + ']'),
                $displayElements = $().add($pane);
            if ($tab) {
                return $displayElements.add($tab);
            }
            return $displayElements;
        }

        /**
         * @param $element The jQuery element
         * @return True, if the element is a pane. False, otherwise.
         */
        isPane($element) {
            return $element && $element.hasClass("coral-TabPanel-pane");
        }
    }

})(Namics.authoring, Granite.$);