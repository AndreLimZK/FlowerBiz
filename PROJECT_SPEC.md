# Handmade Pipe-Cleaner Bouquet Customiser — Project Specification

## 1. Project overview

Build a desktop-first website for a business selling handmade pipe-cleaner (chenille-stem) flower bouquets. Customers can choose individual flowers, arrange them freely in a real-time 3D preview, rotate the bouquet to inspect it, customise approved options, and submit the design for business review.

The preview should represent the real product as faithfully as practical. It is a configuration and communication tool, not a guarantee that every arrangement is manufacturable exactly as shown. The business reviews every submitted design before confirming the order and final price.

### Confirmed decisions

- **Preview:** freely rotatable 3D bouquet.
- **Device priority:** desktop-first; mobile adaptation later.
- **Arrangement:** customers can freely arrange individual flowers.
- **Order handling:** business reviews each submitted design.
- **Visual direction:** realistic representation using prepared 3D assets.
- **Submission data:** save both the structured configuration and a rendered preview image.

### Initial release exclusions

Customer accounts, saved design libraries, automated payments, live inventory synchronisation, AI-generated product imagery, physically accurate simulation of flexible materials, and automated manufacturability checks. Add these only if the core customiser proves useful.

## 2. Recommended technology stack

| Area | Technology | Purpose |
|---|---|---|
| Framework | Next.js App Router | Website and application structure |
| Language | TypeScript | Typed application and configuration data |
| Styling | Tailwind CSS | Layout and responsive styling |
| UI components | shadcn/ui, where useful | Accessible controls and dialogs |
| 3D rendering | Three.js + React Three Fiber | Interactive 3D scene |
| 3D helpers | Drei | Orbit controls, loaders, environment helpers |
| State | Zustand | Shared bouquet and editor state |
| Backend | Supabase | Database, submissions, later authentication |
| Asset storage | Supabase Storage initially | Models, textures and preview images |
| Hosting | Vercel | Deployment |
| Coding assistant | Cursor | AI-assisted implementation |
| Version control | Git + GitHub | Checkpoints and history |

Use React Three Fiber (R3F) as the React renderer for Three.js, with Drei for common utilities. Do not implement the core experience as a 2D canvas that merely pretends to rotate in 3D. A single flat front-facing flower image will look flat when viewed from the side or rear. Free rotation requires actual 3D geometry or a suitable 3D representation.

### Asset formats and preparation

- Prefer `.glb` / `.gltf` for flower models and other 3D objects.
- Use PNG or WebP textures where appropriate.
- Keep original high-quality assets separate from optimised web versions.
- Use consistent real-world scale, origins and pivots.
- Keep stable asset IDs so catalogue data can refer to models reliably.
- Test one representative flower model before commissioning or preparing the full catalogue.

## 3. Application routes and source structure

Initial routes:

- `/` — landing page and introduction.
- `/customise` — bouquet customiser; highest priority.
- `/submitted` — submission confirmation.

Suggested source structure (adjust as the project evolves; do not create abstractions prematurely):

```text
src/
├── app/
│   ├── page.tsx
│   ├── customise/page.tsx
│   ├── submitted/page.tsx
│   └── layout.tsx
├── components/
│   ├── editor/
│   │   ├── BouquetEditor.tsx
│   │   ├── BouquetScene.tsx
│   │   ├── FlowerLibrary.tsx
│   │   ├── SelectedFlowerPanel.tsx
│   │   ├── BouquetOptionsPanel.tsx
│   │   ├── EditorToolbar.tsx
│   │   └── PriceSummary.tsx
│   └── ui/
├── data/
│   ├── flowers.ts
│   └── options.ts
├── stores/bouquetStore.ts
├── lib/
│   ├── supabase.ts
│   ├── pricing.ts
│   └── validation.ts
└── types/
    ├── flower.ts
    ├── bouquet.ts
    └── order.ts
```

## 4. Customer experience and editor layout

### Desktop-first layout

Use three main areas:

1. **Flower library (left):** available flower types and variants. Selecting an item adds an instance to the bouquet.
2. **3D preview (centre):** largest area; freely orbit, zoom and inspect the bouquet.
3. **Customisation and summary (right):** selected-flower controls, wrapping/stem/ribbon options, item count and estimated price.

A toolbar can contain undo, redo, reset, camera-view shortcuts and submit-design actions.

### Core interactions

- Add a flower from the library.
- Select a flower instance in the scene or from an object list.
- Move, rotate and scale the selected flower within sensible limits.
- Duplicate and delete a selected flower.
- Change a flower's approved colour or variant.
- Change wrapping, stem and ribbon options.
- Orbit the camera freely and zoom in/out.
- Reset the camera to a useful default view.
- Undo and redo edits.
- Reset the bouquet after confirmation.
- See item count and estimated price.
- Submit the design for business review.

### Interaction design requirements

- Clearly distinguish camera rotation from moving or rotating an individual flower.
- Use an explicit selection state and transform controls; avoid making every object draggable at all times if that conflicts with camera navigation.
- Provide visible selection feedback.
- Keep common actions discoverable with labels or tooltips.
- Prevent accidental deletion/reset through undo or confirmation.
- Apply sensible scale and position limits.
- Provide an empty state explaining how to add the first flower.

### Mobile later

Do not compromise the desktop editor to optimise mobile in the first release. Still, keep panels modular, ensure the 3D scene resizes with its container, avoid hover-only interactions, and use pointer/touch-capable controls where practical so mobile adaptation is not blocked by early architecture choices.

## 5. 3D scene and asset strategy

### Real 3D assets are the critical dependency

A 3D engine cannot turn one flat photograph into a convincing flower from every angle. The business should ideally provide physical samples of each flower and bouquet component for modelling or reference. Each supported flower type and variant needs a prepared 3D model or a deliberate 3D representation.

Potential asset-production approaches:

1. **Custom modelling:** best control over geometry and materials, but requires modelling effort.
2. **Photogrammetry / 3D scanning:** may capture real objects, but fuzzy chenille texture and thin stems can be difficult to scan cleanly.
3. **Hybrid modelling:** model flower heads, stems and leaves as geometry, then use textures/materials to suggest chenille texture. This is a practical approach to test.

Do not assume scanning automatically produces clean, lightweight, web-ready models. Prototype one flower and evaluate it from all angles first.

### Model organisation

Where practical, keep flower models composed of identifiable parts: flower head, stem, leaves and optional centre/detail components. This can make approved variants easier to support. If arbitrary material recolouring looks unlike the real product, use separate approved model/material variants instead.

### Scene composition

- Neutral, studio-like background.
- Consistent lighting that reveals the chenille texture.
- Optional ground plane and subtle shadow.
- Wrapping cone/paper assembly, ribbon/bow, stems, leaves and flower heads as separate scene elements where useful.
- Multiple independently transformed flower instances.
- Consistent unit scale and documented coordinate convention (for example, Y is up and bouquet base is near the origin).

Treat wrapping and ribbon as separate configurable elements. Some choices may be material changes; others may require different geometry or model variants. Only expose colours and materials the business can actually supply.

### Performance

Optimise polygon counts and textures for browser rendering; load only required assets where possible; show loading states; handle missing assets; and test on a typical laptop rather than only a high-end development machine.

## 6. Data model

Keep the bouquet configuration independent of the 3D renderer. It must be serialisable and usable for saving, validation, pricing and business review without a live Three.js scene.

Example starting types:

```ts
export type FlowerProduct = {
  id: string;
  name: string;
  description?: string;
  modelUrl: string;
  thumbnailUrl: string;
  availableColours: string[];
  basePrice: number;
  enabled: boolean;
};

export type BouquetFlower = {
  instanceId: string;
  productId: string;
  colourId: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
};

export type BouquetConfiguration = {
  schemaVersion: 1;
  flowers: BouquetFlower[];
  wrappingId: string;
  stemOptionId: string;
  ribbonId: string;
  createdAt?: string;
  updatedAt?: string;
};

export type BouquetSubmission = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerMessage?: string;
  configuration: BouquetConfiguration;
  previewImageUrl?: string;
  estimatedPrice: number;
  status: "pending_review" | "accepted" | "changes_requested" | "rejected";
  createdAt: string;
};
```

These are initial shapes, not final migrations. Refine them after confirming the product catalogue and business process.

### Data rules

- Every placed flower has a unique `instanceId`, even when multiple instances use the same product.
- `productId` identifies a catalogue product, not a placed instance.
- Save each instance's position, rotation and scale.
- Save stable option IDs, not only display labels or colour names.
- Include `schemaVersion` so saved configurations can be migrated later.
- Save both structured configuration and rendered preview image.
- Never rely on the preview image as the only record of a design.
- Validate product and option IDs against the current approved catalogue on the server.

## 7. State management

Use Zustand for shared editor state. It should manage the current configuration, selected instance, editor UI state, undo/redo history, and actions to add/update/duplicate/remove flowers and change bouquet options.

Keep transient Three.js objects, renderer references and other runtime internals out of the persisted configuration. The configuration should remain plain serialisable JSON. A simple snapshot-based undo/redo history is acceptable initially because bouquets are expected to contain a modest number of objects; optimise only if testing reveals a problem.

## 8. Pricing

Centralise pricing in `lib/pricing.ts`; do not calculate prices independently in UI components. A provisional formula may sum each flower instance's base price, wrapping and ribbon adjustments, and any fixed assembly/customisation fee. The business must confirm actual pricing rules. Until then, use clearly labelled development placeholder prices. Display the result as an estimate, subject to business review and confirmation.

## 9. Submission and business review workflow

1. Customer completes a bouquet design.
2. Customer enters required contact details and an optional note.
3. Application validates the configuration.
4. Application saves the structured configuration and a preview image.
5. Submission is created with status `pending_review`.
6. Customer sees a confirmation page.
7. Business reviews and accepts, requests changes to, or rejects the design.
8. Business confirms final price and next steps. This can initially happen outside the automated website workflow.

The business review record should include customer details, preview, reopenable configuration, flower types/variants/quantities, wrapping/stem/ribbon choices, note, estimated price, submission date and status. A full review dashboard can be a later milestone; during early testing, submissions may be inspected through the Supabase dashboard.

### Submission safeguards

- Never silently discard a design if saving fails.
- Show loading and success/error states.
- Allow retry after failure.
- Prevent accidental duplicate submissions from repeated clicks.
- Validate submitted data server-side.
- Never expose Supabase service-role credentials in browser code.

## 10. Supabase backend

Likely initial tables:

### `flowers`
- `id`, `name`, `description`, `model_url`, `thumbnail_url`, `base_price`, `enabled`

### `flower_colours`
- `id`, `flower_id`, `name`, `material_key` or model-variant reference, `enabled`

### `bouquet_options`
- `id`, `category` (wrapping, stem, ribbon), `name`, `price_adjustment`, `asset_or_material_key`, `enabled`

### `submissions`
- `id`, `customer_name`, `customer_email`, `customer_message`, `configuration` (JSONB), `preview_image_url`, `estimated_price`, `status`, `created_at`

Use Row Level Security and carefully scoped policies. Public customers should only read enabled catalogue options and create valid submissions. They must not read other customers' submissions or change review statuses. Business-only review actions require authenticated and authorised business users. Do not use permissive policies simply to make a prototype work; keep secrets server-side.

## 11. Development phases and completion criteria

### Phase 0 — project setup
- Create Next.js TypeScript application.
- Set up Tailwind and chosen UI component approach.
- Add React Three Fiber, Three.js, Drei and Zustand.
- Set up Git and local development.
- Create the initial page and editor layout.

**Done when:** app runs locally and displays the empty editor layout.

### Phase 1 — 3D proof of concept
- Create a basic scene, camera, lighting and neutral background.
- Add orbit and zoom controls.
- Load one temporary test flower model.
- Inspect the model from all sides and confirm scene resizing.

**Done when:** user can freely rotate and zoom around one test flower in a stable browser scene.

### Phase 2 — bouquet composition
- Add a temporary wrapping model.
- Add multiple flower instances, stems and leaves.
- Position and rotate instances independently.
- Establish selection and transform limits.

**Done when:** user can compose a simple multi-flower bouquet in 3D.

### Phase 3 — editor interactions
- Build flower library and selected-flower controls.
- Implement select, move, rotate, scale, duplicate and delete.
- Add wrapping, stem and ribbon options.
- Add undo, redo and reset.
- Connect controls to Zustand.

**Done when:** editor can create and modify a bouquet without a backend.

### Phase 4 — catalogue and pricing
- Replace temporary assets with approved product assets.
- Define available flower and colour variants.
- Implement central pricing logic.
- Display item count and estimated price.

**Done when:** editor only offers valid business-approved options and displays a consistent estimate.

### Phase 5 — save and submit
- Set up Supabase schema and security policies.
- Add customer details and submission validation.
- Export a preview image from the 3D scene.
- Save configuration and preview.
- Add confirmation page.

**Done when:** customer can submit a design and the business can inspect the saved data.

### Phase 6 — review workflow and launch readiness
- Add a basic business review interface or secure interim process.
- Test failed submissions and retries.
- Test unavailable options and catalogue changes.
- Optimise model loading and rendering.
- Test multiple desktop browsers and typical laptop performance.
- Deploy to Vercel.

**Done when:** business can reliably review incoming designs and the customer flow works end-to-end.

### Phase 7 — mobile adaptation
- Rework editor layout for smaller screens.
- Add touch-friendly selection and controls.
- Test camera gestures against page scrolling.
- Optimise mobile performance.

## 12. Cursor working method

Treat Cursor as a coding assistant, not an autonomous project owner.

1. Open the project folder in Cursor and keep this file at the project root.
2. Ask Cursor to inspect the existing project before editing.
3. Work on one milestone or small feature at a time.
4. Ask it to explain which files it plans to change and why.
5. Review diffs before accepting broad changes.
6. Run the app and test after each feature.
7. Fix errors before proceeding.
8. Commit working milestones to Git.
9. Update this specification when decisions change.

Do not ask Cursor to build the entire production website in one prompt. Start with setup and the 3D proof of concept. The biggest early risk is whether the available 3D flower assets can deliver the desired realism.

## 13. Initial prototype acceptance criteria

- Project starts locally without errors.
- Customiser has a desktop-first three-area layout.
- Central 3D scene renders reliably.
- Camera can orbit freely and zoom.
- At least one flower model loads and can be viewed from all sides.
- Multiple flower instances can be added.
- Each instance can be selected and transformed independently.
- Editor state is serialisable configuration data.
- Resetting or changing state does not leave orphaned 3D objects.
- No single flat image is used to pretend a flower is a fully 3D object.

## 14. Business questions to resolve before launch

- Which flower types and colours are available?
- Are flower heads, stems and leaves separate components?
- Which wrapping papers, stem colours and ribbons can be supplied?
- Can every flower type be made in every listed colour?
- Are there minimum/maximum flower quantities or bouquet dimensions?
- How much freedom should customers have over placement?
- Which designs incur extra labour or price adjustments?
- What customer contact details are required?
- How will acceptance, requested changes and final pricing be communicated?
- Who is authorised to review submissions?
- Can the business provide physical samples for modelling or scanning?

**Recommended immediate next step:** prove the 3D approach with one representative flower before preparing the full catalogue. Model quality and material treatment will determine whether free 3D rotation is a good fit for this product.
