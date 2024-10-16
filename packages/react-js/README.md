# SIWYS JS

TODO: Update me.

# Local Development

Uses [Vite](https://vite.dev/) for testing components locally.

1. Render the component(s) you want to test inside `src/demo/demo.tsx`
2. Run `yarn dev`
3. Test at http://localhost:5173

# Importing Icons as SVGs

Uses [SVGR](https://react-svgr.com/) to transform SVGs into React components.

1. Save the SVG in the `icons/` folder
2. Run `yarn generate-icons`
3. The associated React components will be generated inside `src/icons`
