/** This is a Divider Menu Item */
export interface CTXMDivider {
	isDivider: true
}
/**
 * This is a heading item which displays a text and optionally shows a tooltip when hovering over it.
 *
 * NOTE: _All other menu items (except the divider item) derive from this and have at least these two properties_
 */
export interface CTXMHeading {
	/** The text of the Context Menu Item */
	text: string
	/** The tooltip of the Context Menu Item */
	tooltip?: string
}
export interface CTXMInteractive extends CTXMHeading {
	/** Whether the Context Menu Item is disabled or not. Defaults to `false` */
	disabled?: boolean
}
/** This is an interactive item which will execute a given javascript function when clicked. */
export interface CTXMAction extends CTXMInteractive {
	/** A function that is called when the Action Item is clicked. Takes a `MouseEvent` as parameter. */
	action: (ev: MouseEvent) => void
}
/** This is an interactive item which implements an anchor tag (`<a>`) and will redirect to a given URL (`href`). */
export interface CTXMAnchor extends CTXMInteractive {
	/** Contains a URL or a URL fragment that the hyperlink points to. */
	href: string
	/** Specifies where to display the linked URL. (e.g. `"_blank"` to open it in a new tab) */
	target?: string
}
/** This is an interactive item which holds a menu definition. You can create infinitely deep nested submenus. */
export interface CTXMSubMenu extends CTXMInteractive {
	/** The menu definition for the nested menu */
	subMenu: CTXMenu
}
export type CTXMItem = CTXMAnchor | CTXMAction | CTXMHeading | CTXMDivider | CTXMSubMenu
/**
 * This is a Menu Definition. In fact, it's just an array of Context Menu Items
 */
export type CTXMenu = CTXMItem[]
/**
 * A function that is called before the context menu is opened.
 * It is passed the menu definition and the MouseEvent.
 * Can be used to manipulate the menu based on the Event. (e.g. Cursor Position)
 * Needs to return a menu definition.
 */
export type BeforeRenderFN = (menu: CTXMenu, e: MouseEvent) => CTXMenu
export interface CTXMenuSingleton {
	/**
	 * The attach method is used to bind a context menu to any DOM Node and takes the following arguments:
	 * @param target A selector string to define the target node (eg `'body'`, or `'#someID'`)
	 * @param ctxMenu An array of objects defining the menu layout.
	 * @param beforeRender An optional callback function that is called before the context menu is opened.
	 * It is passed two arguments:
	 * `menu` - the menu definition,
	 * `event` - the MouseEvent.
	 * `beforeRender` needs to return a new menu definition which will be used.
	 */
	attach(target: string, ctxMenu: CTXMenu, beforeRender?: BeforeRenderFN): void
	/**
	 * The update method is used to update an existing context menu.
	 * You can update each the menu definition or beforeRender function only by passing undefined for the other argument.
	 * If you try to update a menu which does not exist, it will silently be attached instead.
	 * @param target A selector string to define the target node (eg `'body'`, or `'#someID'`)
	 * @param ctxMenu An array of objects defining the updated menu layout. _(might be undefined when only updating beforeRender)_
	 * @param beforeRender The updated callback function that is called before the context menu is opened.
	 * It is passed two arguments:
	 * `menu` - the menu definition,
	 * `event` - the MouseEvent.
	 * `beforeRender` needs to return a new menu definition which will be used.
	 */
	update(target: string, ctxMenu?: CTXMenu, beforeRender?: BeforeRenderFN): void
	/**
	 * The delete method is used to delete a context menu
	 * @param target A selector string to define the target node (eg `'body'`, or `'#someID'`)
	 */
	delete(target: string): void

	invoke(target: string, mouseEvent: MouseEvent, ctxMenu?: CTXMenu, beforeRender?: BeforeRenderFN): void
}
export const ctxmenu: CTXMenuSingleton
