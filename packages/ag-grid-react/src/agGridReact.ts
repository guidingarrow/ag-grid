import * as React from "react";
import * as PropTypes from "prop-types";
import * as AgGrid from "ag-grid-community";
import {
    Autowired,
    BaseComponentWrapper,
    Bean,
    FrameworkComponentWrapper,
    GridOptions,
    IComponent,
    Promise,
    WrapableInterface
} from "ag-grid-community";

import { AgGridColumn } from "./agGridColumn";
import { AgReactComponent } from "./agReactComponent";

export interface AgGridReactProps extends GridOptions {
    gridOptions?: GridOptions;
}

export class AgGridReact extends React.Component<AgGridReactProps, {}> {
    static propTypes: any;

    destroyed: boolean = false;

    gridOptions: AgGrid.GridOptions;
    api: AgGrid.GridApi;
    columnApi: AgGrid.ColumnApi;
    portals = [];
    hasPendingPortalUpdate = false;

    protected eGridDiv: HTMLElement;

    private static MAX_COMPONENT_CREATION_TIME: number = 1000; // a second should be more than enough to instantiate a component

    constructor(public props: any, public state: any) {
        super(props, state);
    }

    render() {
        return React.createElement<any>("div", {
            style: this.createStyleForDiv(),
            ref: e => {
                this.eGridDiv = e;
            }
        }, this.portals);
    }

    createStyleForDiv() {
        const style: any = {height: "100%"};
        // allow user to override styles
        const containerStyle = this.props.containerStyle;
        if (containerStyle) {
            Object.keys(containerStyle).forEach(key => {
                style[key] = containerStyle[key];
            });
        }
        return style;
    }

    componentDidMount() {
        const gridParams = {
            seedBeanInstances: {
                agGridReact: this
            }
        };

        let gridOptions = this.props.gridOptions || {};
        if (AgGridColumn.hasChildColumns(this.props)) {
            gridOptions.columnDefs = AgGridColumn.mapChildColumnDefs(this.props);
        }

        this.gridOptions = AgGrid.ComponentUtil.copyAttributesToGridOptions(gridOptions, this.props);

        // don't need the return value
        new AgGrid.Grid(this.eGridDiv, this.gridOptions, gridParams);

        this.api = this.gridOptions.api;
        this.columnApi = this.gridOptions.columnApi;
    }

    shouldComponentUpdate() {
        // we want full control of the dom, as ag-Grid doesn't use React internally,
        // so for performance reasons we tell React we don't need render called after
        // property changes.
        return false;
    }

    waitForInstance(reactComponent: AgReactComponent, resolve, runningTime = 0) {
        if(reactComponent.getFrameworkComponentInstance()) {
            resolve(null);
        } else {
            if(runningTime >= AgGridReact.MAX_COMPONENT_CREATION_TIME) {
                console.error(`ag-Grid: React Component '${reactComponent.getReactComponentName()}' not created within ${AgGridReact.MAX_COMPONENT_CREATION_TIME}ms`);
                return;
            }
            window.setTimeout(() => this.waitForInstance(reactComponent, resolve, runningTime + 5), 5);
        }
    }

    /**
     * Mounts a react portal for components registered under the componentFramework.
     * We do this because we want all portals to be in the same tree - in order to get
     * Context to work properly.
     */
    mountReactPortal(portal, reactComponent, resolve) {
        this.portals = [...this.portals, portal];
        this.batchUpdate(this.waitForInstance(reactComponent,  resolve));
    }

    batchUpdate(callback?) {
        if (this.hasPendingPortalUpdate) {
            return callback && callback();
        }
        setTimeout(() => {
            if (this.api) { // destroyed?
                this.forceUpdate(() => {
                    callback && callback();
                    this.hasPendingPortalUpdate = false;
                });
            }
        });
        this.hasPendingPortalUpdate = true;
    }


    destroyPortal(portal) {
        this.portals = this.portals.filter(curPortal => curPortal !== portal);
        this.batchUpdate();
    }

    componentWillReceiveProps(nextProps: any) {
        let debugLogging = !!nextProps.debug;

        const changes = <any>{};
        const changedKeys = Object.keys(nextProps);
        changedKeys.forEach((propKey) => {
            if (AgGrid.ComponentUtil.ALL_PROPERTIES.indexOf(propKey) !== -1) {
                if (this.skipPropertyCheck(propKey) ||
                    !this.areEquivalent(this.props[propKey], nextProps[propKey])) {

                    if (debugLogging) {
                        console.log(`agGridReact: [${propKey}] property changed`);
                    }

                    changes[propKey] = {
                        previousValue: this.props[propKey],
                        currentValue: nextProps[propKey]
                    };
                }
            }
        });
        AgGrid.ComponentUtil.getEventCallbacks().forEach((funcName: string) => {
            if (this.props[funcName] !== nextProps[funcName]) {
                if (debugLogging) {
                    console.log(`agGridReact: [${funcName}] event callback changed`);
                }
                changes[funcName] = {
                    previousValue: this.props[funcName],
                    currentValue: nextProps[funcName]
                };
            }
        });


        AgGrid.ComponentUtil.processOnChange(changes, this.gridOptions, this.api, this.columnApi);
    }

    private skipPropertyCheck(propKey) {
        return this.props['deltaRowDataMode'] && propKey === 'rowData';
    }

    componentWillUnmount() {
        if (this.api) {
            this.api.destroy();
            this.api = null;
        }
    }

    /*
     * deeper object comparison - taken from https://stackoverflow.com/questions/1068834/object-comparison-in-javascript
     */
    static unwrapStringOrNumber(obj) {
        return obj instanceof Number || obj instanceof String ? obj.valueOf() : obj;
    }

    // sigh, here for ie compatibility
    copy(value) {
        if (!value) {
            return value;
        }

        if (Array.isArray(value)) {
            // shallow copy the array - this will typically be either rowData or columnDefs
            const arrayCopy = [];
            for (let i = 0; i < value.length; i++) {
                arrayCopy.push(this.copy(value[i]));
            }
            return arrayCopy;
        }

        // for anything without keys (boolean, string etc).
        // Object.keys - chrome will swallow them, IE will fail (correctly, imho)
        if (typeof value !== "object") {
            return value;
        }

        return [{}, value].reduce((r, o) => {
            Object.keys(o).forEach(function(k) {
                r[k] = o[k];
            });
            return r;
        }, {});
    }

    areEquivalent(a, b) {
        return AgGridReact.areEquivalent(this.copy(a), this.copy(b));
    }

    /*
     * slightly modified, but taken from https://stackoverflow.com/questions/1068834/object-comparison-in-javascript
     *
     * What we're trying to do here is determine if the property being checked has changed in _value_, not just in reference
     *
     * For eg, if a user updates the columnDefs via property binding, but the actual columns defs are the same before and
     * after, then we don't want the grid to re-render
     */
    static areEquivalent(a, b) {
        a = AgGridReact.unwrapStringOrNumber(a);
        b = AgGridReact.unwrapStringOrNumber(b);
        if (a === b) return true; //e.g. a and b both null
        if (a === null || b === null || typeof a !== typeof b) return false;
        if (a instanceof Date) {
            return b instanceof Date && a.valueOf() === b.valueOf();
        }
        if (typeof a === "function") {
            return a.toString() === b.toString();
        }
        if (typeof a !== "object") {
            return a == b; //for boolean, number, string, function, xml
        }

        const newA = a.areEquivPropertyTracking === undefined,
            newB = b.areEquivPropertyTracking === undefined;
        try {
            let prop;
            if (newA) {
                a.areEquivPropertyTracking = [];
            } else if (
                a.areEquivPropertyTracking.some(function(other) {
                    return other === b;
                })
            )
                return true;
            if (newB) {
                b.areEquivPropertyTracking = [];
            } else if (b.areEquivPropertyTracking.some(other => other === a)) {
                return true;
            }
            a.areEquivPropertyTracking.push(b);
            b.areEquivPropertyTracking.push(a);

            const tmp = {};
            for (prop in a)
                if (prop != "areEquivPropertyTracking") {
                    tmp[prop] = null;
                }
            for (prop in b)
                if (prop != "areEquivPropertyTracking") {
                    tmp[prop] = null;
                }

            for (prop in tmp) {
                if (!this.areEquivalent(a[prop], b[prop])) {
                    return false;
                }
            }
            return true;
        } finally {
            if (newA) delete a.areEquivPropertyTracking;
            if (newB) delete b.areEquivPropertyTracking;
        }
    }
}

AgGridReact.propTypes = {
    gridOptions: PropTypes.object
};

addProperties(AgGrid.ComponentUtil.getEventCallbacks(), PropTypes.func);
addProperties(AgGrid.ComponentUtil.BOOLEAN_PROPERTIES, PropTypes.bool);
addProperties(AgGrid.ComponentUtil.STRING_PROPERTIES, PropTypes.string);
addProperties(AgGrid.ComponentUtil.OBJECT_PROPERTIES, PropTypes.object);
addProperties(AgGrid.ComponentUtil.ARRAY_PROPERTIES, PropTypes.array);
addProperties(AgGrid.ComponentUtil.NUMBER_PROPERTIES, PropTypes.number);
addProperties(AgGrid.ComponentUtil.FUNCTION_PROPERTIES, PropTypes.func);

function addProperties(listOfProps: string[], propType: any) {
    listOfProps.forEach((propKey: string) => {
        AgGridReact[propKey] = propType;
    });
}

@Bean("frameworkComponentWrapper")
class ReactFrameworkComponentWrapper extends BaseComponentWrapper<WrapableInterface> implements FrameworkComponentWrapper {
    @Autowired("agGridReact") private agGridReact: AgGridReact;

    createWrapper(ReactComponent: { new(): any }): WrapableInterface {
        let _self = this;

        class DynamicAgReactComponent extends AgReactComponent implements IComponent<any>, WrapableInterface {
            constructor() {
                super(ReactComponent, _self.agGridReact);
            }

            public init(params: any): Promise<void> {
                return super.init(<any>params);
            }

            hasMethod(name: string): boolean {
                let frameworkComponentInstance = wrapper.getFrameworkComponentInstance();
                if (frameworkComponentInstance == null) {
                    return false;
                }
                return frameworkComponentInstance[name] != null;
            }

            callMethod(name: string, args: IArguments): void {
                let frameworkComponentInstance = this.getFrameworkComponentInstance();

                // this should never happen now that AgGridReact.waitForInstance is in use
                if (frameworkComponentInstance == null) {
                    window.setTimeout(() => this.callMethod(name, args), 100);
                } else {
                    let method = wrapper.getFrameworkComponentInstance()[name];
                    if (method == null) return null;
                    return method.apply(frameworkComponentInstance, args);
                }
            }

            addMethod(name: string, callback: Function): void {
                wrapper[name] = callback;
            }
        }

        const wrapper: DynamicAgReactComponent = new DynamicAgReactComponent();
        return wrapper;
    }
}

AgGrid.Grid.setFrameworkBeans([ReactFrameworkComponentWrapper]);
