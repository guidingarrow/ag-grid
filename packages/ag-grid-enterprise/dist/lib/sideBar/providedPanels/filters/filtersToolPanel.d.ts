// ag-grid-enterprise v20.0.0
import { Component, IToolPanelComp } from "ag-grid-community";
export declare class FiltersToolPanel extends Component implements IToolPanelComp {
    private static TEMPLATE;
    private columnApi;
    private context;
    private gridOptionsWrapper;
    private gridApi;
    private eventService;
    private columnController;
    private rowModel;
    private componentResolver;
    private valueService;
    private $scope;
    private columnTree;
    private initialised;
    constructor();
    init(): void;
    onColumnsChanged(): void;
    refresh(): void;
    setVisible(visible: boolean): void;
    private recursivelyAddComps;
    private recursivelyAddColumnComps;
}
