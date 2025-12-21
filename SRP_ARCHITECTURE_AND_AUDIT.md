# Amazon-Style SRP Architecture & Data Audit (vasuzex-v2)

## 1. Conversation Overview
- **Primary Objectives:**
  - Confirm slug helper in vasuzex-v2
  - Refactor customer `searchProducts` to match admin (single query, primary photo, no patching)
  - Design Amazon-style SRP: dynamic filters, multi-store logic, no assumptions/patching
- **Session Context:**
  - Started with a helper query, escalated to strict, enterprise-grade requirements
- **Intent Evolution:**
  - From helper to full DB/data audit and robust SRP architecture

## 2. Technical Foundation
- **vasuzex-v2:**
  - Has `generateSlug` helper
  - Uses GuruORM models, BaseService patterns
- **GuruORM:**
  - Eager loading, scopes, relationships
- **Redux:**
  - For search state management
- **PostgreSQL:**
  - Backing DB, schema audited via migrations/models
- **Constraints:**
  - No patching, no assumptions, no fallback logic

## 3. Codebase Status
- **ProductService.js (customer):**
  - Refactored `searchProducts` to use `BaseService.getList`, return only primary photo, fixed async bug
- **ProductService.js (admin):**
  - Used as reference for single-query, robust search
- **Models/Migrations Audited:**
  - Product, ProductVariant, StoreInventory, Brand, Category, Rating, Unit, Packaging, Store
- **No dead code left behind**

## 4. Problem Resolution
- **Issues:**
  - N+1 in `searchProducts`, async mapping bug, unclear filter dimensions
- **Solutions:**
  - Refactored to single-query, fixed async bug, full DB/data audit
- **Debugging:**
  - No patching, fallback, partials, or assumptions
- **Lessons:**
  - Filters must be DB-driven, multi-store logic is critical, code must be robust/reusable

## 5. Progress Tracking
- **Completed:**
  - Slug helper confirmed
  - `searchProducts` refactored and bugfixed
  - DB/data audit and filter matrix produced
- **Partially Complete:**
  - Awaiting user answers to critical questions before SRP/filter implementation
- **Validated:**
  - All code changes tested for single-query, primary photo, async correctness

## 6. Active Work State
- **Current Focus:**
  - DB/data audit, filter matrix, SRP architecture, multi-store rules
- **Recent Context:**
  - Reading models, migrations, services to map filterable fields and multi-store logic
- **Working Code:**
  - `ProductService.js` `searchProducts` (single-query, primary photo, Promise.all fix)
- **Immediate Context:**
  - Producing architecture and question list for user confirmation

## 7. Recent Operations
- **Last Agent Commands:**
  - file_search, read_file, grep_search, apply_patch, multi_tool_use.parallel
- **Tool Results:**
  - Models/migrations read for filterable fields
  - `ProductService.js` refactored and bugfixed
  - Filter matrix and architecture produced
- **Pre-Summary State:**
  - Finalizing DB/data audit and architecture document for Amazon-style SRP
- **Operation Context:**
  - All recent commands directly supported robust, DB-driven, multi-store search/filter system

## 8. Business Rules & Planning (Updated)

### Confirmed Business Rules
- **Price Management:** Store manages inventory, inventory has pricing. MRP is always present for every product/variant.
- **Variant Display:** Config-driven via `store.show_all_products` (boolean, public). System must respect this setting globally.
- **Related Searches:** Strictly DB-driven. Static suggestions are not production-ready.
- **Sponsored Products:** Full admin-driven workflow required (like Amazon/Flipkart). See detailed architecture below.
- **Store Ratings:** Recommend global aggregation for multi-store, with per-store support for analytics and A/B testing.

### Actionable Implementation Plan

#### Phase 1: Database Schema & Migrations
1. **Sponsored Products Schema:**
   - Add to `products` table:
     - `is_sponsored` (boolean, default false)
     - `sponsored_rank` (integer, nullable, for ordering)
     - `sponsored_start_date` (timestamp, nullable)
     - `sponsored_end_date` (timestamp, nullable)
     - `sponsored_store_id` (uuid, nullable, FK to stores - null = global)
     - `sponsored_budget` (decimal, nullable, for future bidding)
     - `sponsored_clicks` (integer, default 0, for analytics)
     - `sponsored_impressions` (integer, default 0, for analytics)
   - Indexes: `is_sponsored`, `sponsored_rank`, `sponsored_start_date`, `sponsored_end_date`, `sponsored_store_id`

2. **Related Searches Schema:**
   - Create `search_queries` table:
     - `id` (uuid, PK)
     - `query` (string, indexed)
     - `result_count` (integer)
     - `click_count` (integer)
     - `created_at`, `updated_at`
   - Create `related_searches` table:
     - `id` (uuid, PK)
     - `search_query_id` (uuid, FK)
     - `related_query_id` (uuid, FK)
     - `relevance_score` (decimal)

3. **Store Ratings Enhancement:**
   - Add to `ratings` table (if not exists):
     - `store_id` (uuid, nullable, FK to stores)
   - Indexes: `product_id`, `store_id`, `rating`

#### Phase 2: Backend Search API
1. **Endpoint:** `GET /api/search/products`
2. **Query Parameters:**
   - `q` (string, search query)
   - `category_id` (uuid[])
   - `brand_id` (uuid[])
   - `price_min`, `price_max` (decimal)
   - `rating_min` (decimal)
   - `store_id` (uuid[])
   - `in_stock` (boolean)
   - `attributes` (json, e.g., `{"color": ["red", "blue"]}`) 
   - `page`, `limit` (integer)
   - `sort` (string: price_asc, price_desc, rating_desc, relevance)
3. **Response:**
   ```json
   {
     "products": [],
     "filters": {
       "categories": [{"id": "", "name": "", "count": 0}],
       "brands": [{"id": "", "name": "", "count": 0}],
       "price_range": {"min": 0, "max": 0},
       "attributes": {"color": [{"value": "red", "count": 5}]}
     },
     "sponsored": [],
     "related_searches": [],
     "pagination": {"page": 1, "total": 100}
   }
   ```
4. **Business Logic:**
   - Single-query with joins: products, variants, inventory, brands, categories, ratings
   - Filter sponsored products separately (display at top or interspersed)
   - Respect `store.show_all_products` config for variant filtering
   - Aggregate ratings globally by default, support per-store filter
   - Generate dynamic filters based on search results (no hardcoding)
   - Track search query for related searches analytics

#### Phase 3: Admin Panel - Sponsored Products
1. **UI Components:**
   - Product list with "Sponsor" action button
   - Sponsored product management page:
     - Schedule form (start/end dates)
     - Rank input (ordering)
     - Store targeting (global or specific stores)
     - Budget allocation (future)
     - Analytics dashboard (impressions, clicks, CTR)
2. **API Endpoints:**
   - `POST /api/admin/products/:id/sponsor`
   - `PUT /api/admin/products/:id/sponsor`
   - `DELETE /api/admin/products/:id/sponsor`
   - `GET /api/admin/sponsored-products` (list with filters)
   - `GET /api/admin/sponsored-products/analytics`
3. **Validation:**
   - Start date < end date
   - Rank must be unique per store (or global)
   - Budget > 0 (if provided)
4. **Audit Trail:**
   - Log all sponsored product changes (who, when, what)
   - Track performance metrics for reporting

#### Phase 4: Frontend - SRP UI
1. **Components:**
   - `SearchResultsPage` (container)
   - `FilterSidebar` (dynamic filters)
   - `ProductGrid` (results display)
   - `SponsoredProductCard` (highlighted)
   - `RelatedSearches` (horizontal list)
   - `Pagination`
2. **Redux State:**
   ```javascript
   search: {
     query: '',
     filters: {},
     results: [],
     sponsored: [],
     relatedSearches: [],
     filterMetadata: {},
     loading: false,
     error: null,
     pagination: {}
   }
   ```
3. **Routing:**
   - `/search?q=laptop&category=electronics&price_min=500&price_max=1000`
4. **Features:**
   - Real-time filter updates (debounced)
   - Sponsored product highlighting (badge, border)
   - Variant display per store config
   - Store aggregation (show all stores with inventory)
   - Global ratings with per-store toggle (A/B test)

#### Phase 5: Analytics & Market Study
1. **Store Ratings Research:**
   - Study Amazon, Flipkart, Walmart, Alibaba
   - Key questions:
     - How do they display ratings in multi-vendor scenarios?
     - Do they show per-seller ratings or global?
     - How do they handle rating aggregation?
   - Implement both global and per-store, track user engagement
   - A/B test: 50% users see global, 50% see per-store
   - Measure: CTR, conversion rate, user feedback
2. **Sponsored Products Analytics:**
   - Track impressions, clicks, conversions per sponsored product
   - ROI calculation for future bidding system
   - Admin dashboard with charts (daily/weekly/monthly)
3. **Related Searches Analytics:**
   - Track query popularity, click-through from related searches
   - Use for refining search algorithm and suggestions

#### Phase 6: Testing & Validation
1. **Unit Tests:**
   - Search service logic
   - Filter generation
   - Sponsored product ranking
2. **Integration Tests:**
   - Search API with all filters
   - Admin sponsored product workflow
   - Multi-store inventory aggregation
3. **E2E Tests:**
   - Complete search flow
   - Filter interactions
   - Sponsored product display
4. **Performance Tests:**
   - Search query performance (target < 200ms)
   - Large result set handling (10k+ products)
   - Concurrent user load testing

---

## Filter Matrix & Data Audit (Summary)

| Filter/Dimension   | Source Table/Model      | Notes/Constraints                  |
|--------------------|------------------------|------------------------------------|
| Category           | categories             | Hierarchical, DB-driven            |
| Brand              | brands                 | DB-driven                          |
| Price (MRP, Sale)  | product_variants, store_inventory | Multi-store, per-variant, no fallback |
| Rating             | ratings                | Aggregate, store-specific?         |
| Unit/Packaging     | units, packaging       | Variant-level                      |
| Store              | stores, store_inventory| Multi-store, must aggregate        |
| Stock/Availability | store_inventory        | Per-store, per-variant             |
| Attributes         | product_variants       | Color, size, etc.                  |
| ...                | ...                    | ...                                |

- **All filters must be DB-driven, no hardcoding.**
- **Multi-store logic:**
  - Aggregate inventory, price, and availability per store
  - No patching or fallback if data missing

---

## SRP Architecture (Detailed)

### Backend Architecture
- **Single Search API:**
  - Endpoint: `GET /api/search/products`
  - Single-query execution with optimized joins
  - DB-driven filters, no hardcoding
  - Multi-store aggregation at query level
  - Sponsored product injection (separate query or CTE)
- **Service Layer:**
  - `SearchService.search(query, filters, pagination)`
  - `FilterService.generateFilters(searchResults)`
  - `SponsoredService.getSponsoredProducts(query, storeId)`
  - `RelatedSearchService.getRelatedSearches(query)`
- **Data Flow:**
  1. Receive search query and filters
  2. Build dynamic SQL with filters (GuruORM query builder)
  3. Execute single query with joins: products → variants → inventory → brands → categories → ratings
  4. Fetch sponsored products (time-based filtering, ranking)
  5. Generate dynamic filters from result set
  6. Fetch related searches from analytics
  7. Return unified response
- **Performance:**
  - Database indexes on all filterable fields
  - Query caching (Redis) for popular searches
  - Pagination with cursor-based approach for large result sets
  - Target response time: < 200ms

### Frontend Architecture
- **Component Structure:**
  ```
  SearchResultsPage
  ├── SearchBar (header)
  ├── FilterSidebar
  │   ├── CategoryFilter (hierarchical)
  │   ├── BrandFilter (checkbox list)
  │   ├── PriceRangeFilter (slider)
  │   ├── RatingFilter (stars)
  │   ├── StoreFilter (multi-select)
  │   ├── AttributeFilter (dynamic, per-category)
  │   └── AppliedFilters (removable chips)
  ├── SearchResults
  │   ├── SponsoredProducts (highlighted grid)
  │   ├── ProductGrid
  │   │   └── ProductCard (with store aggregation)
  │   └── Pagination
  └── RelatedSearches (horizontal list)
  ```
- **Redux State Management:**
  ```javascript
  search: {
    query: string,
    filters: {
      categories: string[],
      brands: string[],
      priceRange: { min: number, max: number },
      rating: number,
      stores: string[],
      attributes: Record<string, string[]>,
      inStock: boolean
    },
    results: Product[],
    sponsored: Product[],
    relatedSearches: string[],
    filterMetadata: {
      categories: { id: string, name: string, count: number }[],
      brands: { id: string, name: string, count: number }[],
      priceRange: { min: number, max: number },
      attributes: Record<string, { value: string, count: number }[]>
    },
    loading: boolean,
    error: string | null,
    pagination: { page: number, total: number, limit: number }
  }
  ```
- **Actions:**
  - `searchProducts(query, filters, page)`
  - `applyFilter(filterType, value)`
  - `removeFilter(filterType, value)`
  - `clearFilters()`
  - `sortResults(sortType)`
- **Routing:**
  - `/search?q=laptop&category=electronics&brand=dell&price_min=500&price_max=1000&page=1`
  - URL sync with Redux state
  - Browser back/forward support

### Multi-Store Logic
- **Display Strategy:**
  - Show all stores with inventory for each product/variant
  - Group by product, display available stores with prices
  - Highlight best price across stores
- **Price Aggregation:**
  - Show price range if varies across stores
  - Display individual store prices on hover/expand
- **Stock Aggregation:**
  - Respect `store.show_all_products` config
  - If true: show all variants regardless of stock
  - If false: show only in-stock variants
- **No Fallback:**
  - If store data missing, don't display the product for that store
  - No patching, no assumptions

### Sponsored Products Logic
- **Display Strategy:**
  - Top 3-5 sponsored products at page top (clearly marked)
  - Intersperse 1 sponsored product every 10 organic results
  - Clear "Sponsored" badge on each
- **Ranking Algorithm:**
  - Sort by `sponsored_rank` (admin-defined)
  - Filter by date range (active sponsorships only)
  - Respect store targeting (if `sponsored_store_id` is set)
- **Analytics Tracking:**
  - Track impressions on render
  - Track clicks on product card click
  - Send to analytics service (async)

### Variant Display Logic
- **Config-Driven:**
  - Fetch `store.show_all_products` from settings/config
  - Apply globally across search, category pages, product lists
- **Implementation:**
  - If true: `SELECT * FROM products JOIN variants ...`
  - If false: `SELECT * FROM products JOIN variants ... WHERE stock > 0`

### Store Ratings Logic
- **Default: Global Aggregation**
  - `AVG(ratings.rating) FROM ratings WHERE product_id = ?`
  - Display as product's overall rating
- **Optional: Per-Store Filter**
  - `AVG(ratings.rating) FROM ratings WHERE product_id = ? AND store_id = ?`
  - Show when user filters by specific store
- **A/B Testing:**
  - 50% users see global ratings
  - 50% users see per-store ratings (when filtered)
  - Track CTR, conversion, user engagement
  - Decide final implementation based on data

---

## Sponsored Products: Complete Workflow

### Amazon/Flipkart-Style Sponsorship Model

#### Admin Workflow
1. **Product Selection:**
   - Admin navigates to Products list
   - Selects product(s) to sponsor
   - Clicks "Sponsor Product" button

2. **Sponsorship Configuration:**
   - **Duration:** Start date & end date (with timezone)
   - **Targeting:** Global or specific store(s)
   - **Ranking:** Priority/position (1-100, lower = higher priority)
   - **Budget:** (Optional, for future bidding system)
   - **Display Settings:**
     - Show in search results (yes/no)
     - Show in category pages (yes/no)
     - Show on homepage (yes/no)

3. **Approval & Activation:**
   - Preview sponsored product display
   - Confirm and activate
   - Sponsorship goes live at start_date

4. **Monitoring & Analytics:**
   - Real-time dashboard with:
     - Impressions (how many times displayed)
     - Clicks (how many users clicked)
     - CTR (click-through rate)
     - Conversions (if user purchased)
     - Spend (if budget-based)
   - Export reports (CSV, PDF)

5. **Management:**
   - Pause/resume sponsorship
   - Edit dates, ranking, targeting
   - End sponsorship early
   - Clone sponsorship for new campaign

#### Database Schema

**Migration: `add_sponsored_products_fields.js`**
```javascript
// Add to products table
table.boolean('is_sponsored').defaultTo(false).index();
table.integer('sponsored_rank').nullable().index();
table.timestamp('sponsored_start_date').nullable().index();
table.timestamp('sponsored_end_date').nullable().index();
table.uuid('sponsored_store_id').nullable().references('id').inTable('stores').index();
table.decimal('sponsored_budget', 10, 2).nullable();
table.decimal('sponsored_spent', 10, 2).defaultTo(0);
table.integer('sponsored_impressions').defaultTo(0);
table.integer('sponsored_clicks').defaultTo(0);
table.boolean('sponsored_show_in_search').defaultTo(true);
table.boolean('sponsored_show_in_category').defaultTo(true);
table.boolean('sponsored_show_in_homepage').defaultTo(false);
```

**New Table: `sponsored_product_logs`**
```javascript
table.uuid('id').primary();
table.uuid('product_id').references('id').inTable('products');
table.enum('event_type', ['impression', 'click', 'conversion']);
table.uuid('user_id').nullable().references('id').inTable('users');
table.uuid('store_id').nullable().references('id').inTable('stores');
table.string('search_query').nullable();
table.string('page_url').nullable();
table.jsonb('metadata').nullable(); // IP, user agent, etc.
table.timestamps();

// Indexes
table.index(['product_id', 'event_type', 'created_at']);
table.index(['product_id', 'store_id']);
```

**New Table: `search_queries` (for related searches)**
```javascript
table.uuid('id').primary();
table.string('query').index();
table.integer('search_count').defaultTo(0);
table.integer('result_count').defaultTo(0);
table.integer('click_count').defaultTo(0);
table.decimal('avg_position_clicked', 5, 2).nullable();
table.timestamps();
```

**New Table: `related_searches`**
```javascript
table.uuid('id').primary();
table.uuid('search_query_id').references('id').inTable('search_queries');
table.uuid('related_query_id').references('id').inTable('search_queries');
table.decimal('relevance_score', 5, 4); // 0.0 to 1.0
table.integer('click_through_count').defaultTo(0);
table.timestamps();

// Indexes
table.index(['search_query_id', 'relevance_score']);
```

#### API Endpoints

**Admin API:**
- `POST /api/admin/products/:id/sponsor` - Create sponsorship
- `PUT /api/admin/products/:id/sponsor` - Update sponsorship
- `DELETE /api/admin/products/:id/sponsor` - End sponsorship
- `GET /api/admin/sponsored-products` - List all sponsored products
- `GET /api/admin/sponsored-products/:id/analytics` - Get analytics
- `POST /api/admin/sponsored-products/:id/pause` - Pause
- `POST /api/admin/sponsored-products/:id/resume` - Resume

**Customer API:**
- `POST /api/analytics/sponsored/impression` - Track impression
- `POST /api/analytics/sponsored/click` - Track click

#### Frontend Components

**Admin Panel:**
- `SponsoredProductsPage` - List and manage
- `SponsorProductModal` - Create/edit form
- `SponsoredAnalyticsDashboard` - Charts and metrics
- `SponsoredProductCard` - Preview card

**Customer App:**
- `SponsoredProductBadge` - "Sponsored" label
- `SponsoredProductCard` - Highlighted card with tracking
- Update `ProductCard` to handle sponsored flag

#### Business Logic

**Fetching Sponsored Products:**
```javascript
const now = new Date();
const sponsoredProducts = await Product.query()
  .where('is_sponsored', true)
  .where('sponsored_start_date', '<=', now)
  .where('sponsored_end_date', '>=', now)
  .where(builder => {
    builder
      .whereNull('sponsored_store_id') // Global
      .orWhere('sponsored_store_id', currentStoreId); // Or specific store
  })
  .where('sponsored_show_in_search', true)
  .orderBy('sponsored_rank', 'asc')
  .limit(20);
```

**Ranking & Display:**
- Top 3 sponsored: positions 1-3 in results (above organic)
- Interspersed: 1 sponsored every 10 organic results
- Clear visual distinction (border, badge, background color)

**Analytics Tracking:**
```javascript
// On product card render
trackImpression(productId, userId, searchQuery, storeId);

// On product card click
trackClick(productId, userId, searchQuery, storeId, pageUrl);

// On purchase
trackConversion(productId, userId, orderId, revenue);
```

#### Future Enhancements
1. **Bidding System:**
   - Stores/sellers bid for sponsorship slots
   - Automated ranking based on bid amount + relevance
   - Real-time budget tracking and pause when exhausted

2. **A/B Testing:**
   - Test different sponsored product positions
   - Test sponsored vs organic CTR
   - Optimize for user experience and revenue

3. **Advanced Analytics:**
   - Cohort analysis (users who clicked sponsored vs didn't)
   - Heatmaps (where users click most)
   - Conversion funnel (impression → click → add to cart → purchase)

4. **Machine Learning:**
   - Predict which products to sponsor based on trends
   - Personalized sponsored products per user
   - Optimize ranking algorithm based on historical data
---

## Store Ratings: Market Study & Recommendations

### Research Questions
1. **How do major marketplaces handle ratings in multi-vendor scenarios?**
   - Amazon: Shows seller rating separately from product rating
   - Flipkart: Shows overall product rating (aggregated across sellers)
   - eBay: Shows both product rating and seller rating side-by-side
   - Alibaba: Shows supplier rating prominently

2. **What's the user expectation?**
   - Users generally expect to see product quality ratings (global)
   - Users also want to know store/seller reliability (per-store)
   - Best practice: Show both, but emphasize product rating

3. **What drives conversion?**
   - Product rating is primary decision factor
   - Store rating is secondary (trust factor)
   - Combination of both maximizes trust and conversion

### Recommended Implementation

**Primary Display: Global Product Rating**
- Aggregate all ratings for a product across all stores
- Display prominently on product card and detail page
- Formula: `AVG(rating) FROM ratings WHERE product_id = ?`

**Secondary Display: Per-Store Rating (on hover/expand)**
- Show when user hovers over store name or price
- Display in store selection dropdown
- Formula: `AVG(rating) FROM ratings WHERE product_id = ? AND store_id = ?`

**Tertiary Display: Store/Seller Rating (separate)**
- Show store's overall rating (across all products)
- Display on store profile page and in search results (small badge)
- Formula: `AVG(rating) FROM ratings WHERE store_id = ?`

### A/B Testing Plan

**Test Groups:**
- **Group A (50%):** Global product rating only
- **Group B (50%):** Global product rating + per-store rating (on hover)

**Metrics to Track:**
- CTR (click-through rate)
- Conversion rate
- Time to purchase decision
- Cart abandonment rate
- User feedback/surveys

**Duration:** 4 weeks

**Success Criteria:**
- If Group B shows 5%+ higher conversion: implement per-store ratings
- If no significant difference: stick with global ratings (simpler UX)

### Implementation Timeline

**Week 1-2: Database & Backend**
- Implement search API with filters and sponsored products
- Add global rating aggregation
- Add per-store rating query (optional)

**Week 3-4: Frontend - SRP**
- Build search results page with dynamic filters
- Implement product cards with global ratings
- Add A/B test logic for per-store ratings

**Week 5-6: Admin Panel**
- Build sponsored products management UI
- Build analytics dashboard
- Implement sponsorship workflow

**Week 7-8: Testing & Analytics**
- Run A/B test for store ratings
- Monitor sponsored products performance
- Collect user feedback

**Week 9-10: Optimization**
- Analyze A/B test results
- Optimize search query performance
- Refine UI based on user feedback

---

## Critical Success Factors

1. **Performance:** Search must be fast (< 200ms)
2. **Accuracy:** Filters must reflect actual data, no patching
3. **Scalability:** Handle 10k+ products, 100+ concurrent users
4. **User Experience:** Intuitive filters, clear sponsored product marking
5. **Analytics:** Robust tracking for data-driven decisions
6. **Maintainability:** Clean code, well-documented, reusable components

---

*Prepared by GitHub Copilot, 21 December 2025.*
