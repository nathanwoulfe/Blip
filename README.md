# Blip - a Block List Item Picker for Umbraco CMS.

One of the great promises that came with Umbraco's Block List property editor was the concept of reusable blocks - define a block once, and use it in multiple places.

This is yet to come to fruition in the core Backoffice, but that doesn't mean it can't be done. Enter Blip (cue applause). While not as elegant as storing blocks in the content tree, Blip provides access to Block List properties on a different content nodes - for example, a site config node with different Block Lists storing USPs, testimonials, or banner images.

By way of a custom content retrieval API, Blip allows readonly blocks for cases where the editor does not have permission to update the source node, and a full infinite-editing experience for editors with update permission. Blip loves custom block views, and will use these when rendering blocks in lists and overlays. As much as possible, Blip aims to feel and behave just like the native Block List editor, only without block creation.

Blip stores a reference to the selected node(s) and provides a frontend-friendly strongly typed model, using the familiar BlockListModel type, so rendering Blip data is exactly the same as rendering the native Block List.

## Getting started

Blip supports Umbraco 8 and 9, and is installable via Nuget:

```
> Install-Package Blip.Umbraco
```

Blip ships separate Web and Backoffice projects, both installed as dependencies of the main Blip.Umbraco package.

Installing adds the Blip property editor which can then be used to create a new data type. The Blip data type has a simple config, with optional validation rules:

![image](https://user-images.githubusercontent.com/3248070/158706556-693fc577-6770-4119-b5f2-8bf7c8a3f85c.png)

After selecting a source node, the source property config field will present only valid Block List properties. Set the desired source property to restrict the data type to blocks stored on the property.

