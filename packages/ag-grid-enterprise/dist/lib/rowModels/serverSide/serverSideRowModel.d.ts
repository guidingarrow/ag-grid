import { BeanStub, IServerSideDatasource, IServerSideRowModel, RowBounds, RowNode } from "ag-grid-community";
export declare class ServerSideRowModel extends BeanStub implements IServerSideRowModel {
    private gridOptionsWrapper;
    private eventService;
    private context;
    private columnController;
    private filterManager;
    private sortController;
    private gridApi;
    private columnApi;
    private rootNode;
    private datasource;
    private rowHeight;
    private cacheParams;
    private logger;
    private rowNodeBlockLoader;
    private postConstruct;
    destroy(): void;
    private destroyDatasource;
    private setBeans;
    private addEventListeners;
    setDatasource(datasource: IServerSideDatasource): void;
    isLastRowFound(): boolean;
    private onColumnEverything;
    private onFilterChanged;
    private findChangedColumnsInSort;
    private onSortChanged;
    private onValueChanged;
    private onColumnRowGroupChanged;
    private onColumnPivotChanged;
    private onPivotModeChanged;
    private onRowGroupOpened;
    private reset;
    private createNewRowNodeBlockLoader;
    private destroyRowNodeBlockLoader;
    private toValueObjects;
    private createCacheParams;
    private createNodeCache;
    private onCacheUpdated;
    updateRowIndexesAndBounds(): void;
    private setDisplayIndexes;
    private resetRowTops;
    getRow(index: number): RowNode | null;
    getPageFirstRow(): number;
    getPageLastRow(): number;
    getRowCount(): number;
    getRowBounds(index: number): RowBounds;
    getRowIndexAtPixel(pixel: number): number;
    getCurrentPageHeight(): number;
    isEmpty(): boolean;
    isRowsToRender(): boolean;
    getType(): string;
    forEachNode(callback: (rowNode: RowNode, index: number) => void): void;
    private executeOnCache;
    purgeCache(route?: string[]): void;
    removeFromCache(route: string[], items: any[]): void;
    addToCache(route: string[], items: any[], index: number): void;
    getNodesInRangeForSelection(firstInRange: RowNode, lastInRange: RowNode): RowNode[];
    getRowNode(id: string): RowNode | null;
    getBlockState(): any;
    isRowPresent(rowNode: RowNode): boolean;
    private extractSortModel;
    private isSortingWithValueColumn;
    private isSortingWithSecondaryColumn;
    private cacheExists;
    private createDetailNode;
}
