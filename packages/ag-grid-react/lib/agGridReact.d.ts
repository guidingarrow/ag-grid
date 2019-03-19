// ag-grid-react v20.1.0
import * as React from "react";
import * as AgGrid from "ag-grid-community";
import { GridOptions } from "ag-grid-community";
import { AgReactComponent } from "./agReactComponent";
export interface AgGridReactProps extends GridOptions {
    gridOptions?: GridOptions;
}
export declare class AgGridReact extends React.Component<AgGridReactProps, {}> {
    props: any;
    state: any;
    static propTypes: any;
    destroyed: boolean;
    gridOptions: AgGrid.GridOptions;
    api: AgGrid.GridApi;
    columnApi: AgGrid.ColumnApi;
    portals: any[];
    hasPendingPortalUpdate: boolean;
    protected eGridDiv: HTMLElement;
    private static MAX_COMPONENT_CREATION_TIME;
    constructor(props: any, state: any);
    render(): React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)>) | (new (props: any) => React.Component<any, any, any>)>;
    createStyleForDiv(): any;
    componentDidMount(): void;
    shouldComponentUpdate(): boolean;
    waitForInstance(reactComponent: AgReactComponent, resolve: any, runningTime?: number): void;
    /**
     * Mounts a react portal for components registered under the componentFramework.
     * We do this because we want all portals to be in the same tree - in order to get
     * Context to work properly.
     */
    mountReactPortal(portal: any, reactComponent: any, resolve: any): void;
    batchUpdate(callback?: any): any;
    destroyPortal(portal: any): void;
    componentWillReceiveProps(nextProps: any): void;
    private skipPropertyCheck;
    componentWillUnmount(): void;
    static unwrapStringOrNumber(obj: any): any;
    copy(value: any): any;
    areEquivalent(a: any, b: any): boolean;
    static areEquivalent(a: any, b: any): boolean;
}
