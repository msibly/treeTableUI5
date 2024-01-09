sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/core/Fragment',
    'sap/m/MessageToast',
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Fragment, MessageToast, Filter, FilterOperator, JSONModel) {
        "use strict";

        return Controller.extend("project1.controller.View1", {
            onInit: function () {

                var oComponent = this.getOwnerComponent();
                var oModel = oComponent.getModel("myODataModel");
                let dataVal = oModel.getData().fRows;
                var statusesSet = new Set(); // Declare statusesSet

                findStatusRecursive(dataVal); //Initial resursive function calling

                function findStatusRecursive(obj) { // recursive function
                    if (obj.cat) {
                      obj.cat.forEach(function (category) {
                        findStatusRecursive(category);
                      });
                    } else {
                        statusesSet.add(obj.status);    // Adding to Set
                    }
                }
                  
                const statusesArray = Array.from(statusesSet); // Convert to Set
                
                const formattedStatuses = statusesArray.map((status, index) => ({ // converting to json strin in custom format
                    key: (index + 1).toString(),
                    text: `${status}`,
                }));

                oModel.setProperty('/tokensData', formattedStatuses);   // binding to datat model
            },

            onCollapseAll: function () {
                var oTreeTable = this.byId("TreeTableBasic");
                oTreeTable.collapseAll();
            },

            onCollapseSelection: function () {
                var oTreeTable = this.byId("TreeTableBasic");
                oTreeTable.collapse(oTreeTable.getSelectedIndices());
            },

            onExpandFirstLevel: function () {
                var oTreeTable = this.byId("TreeTableBasic");
                oTreeTable.expandToLevel(1);
            },

            onExpandSelection: function () {
                var oTreeTable = this.byId("TreeTableBasic");
                oTreeTable.expand(oTreeTable.getSelectedIndices());
            },

            handlePopoverPress: function (oEvent) {

                var oButton = oEvent.getSource(),
                    oView = this.getView();
                let SelectedText = oEvent.getSource().getText();
                var oModel = this.getView().getModel("myODataModel");
                oModel.setProperty('/SelectedText', SelectedText);

                // create popover
                if (!this._pPopover) {
                    this._pPopover = Fragment.load({
                        id: oView.getId(),
                        name: "project1.view.view1",
                        controller: this
                    }).then(function (oPopover) {
                        oView.addDependent(oPopover);
                        return oPopover;
                    });
                }
                this._pPopover.then(function (oPopover) {
                    oPopover.openBy(oButton);
                });
            },

            closeButtonPress: function () {
                this.getView().byId("myPopover").close();
            },

            onSearchTags: function (oEvent) {
                let sQuery = [];
                let that = this;

                const oTokens = oEvent.getParameter("addedTokens");
                oTokens.forEach((oToken) => {
                    sQuery.push(oToken.getText());
                });

                if (sQuery.length > 0) {
                    // Create an array of Filter objects for each status in sQuery
                    const aFilters = sQuery.map(function (status) {
                        return new Filter("status", FilterOperator.Contains, status);
                    });

                    // Combine filters with OR operator
                    const oCombinedFilter = new Filter({
                        filters: aFilters,
                        and: false // Combine with OR operator
                    });

                    // Apply the combined filter to the binding
                    const oTable = that.byId("TreeTableBasic");
                    const oBinding = oTable.getBinding("rows");
                    oBinding.filter(oCombinedFilter);
                } else {
                    // If no tokens are present, remove the filter
                    const oTable = that.byId("TreeTableBasic");
                    const oBinding = oTable.getBinding("rows");
                    oBinding.filter([]);
                }
            }
        });
    });
