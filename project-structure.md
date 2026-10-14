# Project Structure

Generated on: 10/14/2026, 5:35:33 PM
Root: d:\Daneshgoh\Master\Term 1\Advance Data Base\Tamrin\Project\uber_data_platform
Excluded: .git, .kombai, backend/node_modules, frontend/dist, frontend/node_modules, screenshots

```
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── sqlAssistantController.js
│   │   │   ├── tripAnalyticsController.js
│   │   │   └── tripController.js
│   │   ├── models/
│   │   │   └── db.js
│   │   ├── routes/
│   │   │   ├── analytics.js
│   │   │   ├── sqlAssistant.js
│   │   │   └── trips.js
│   │   ├── scripts/
│   │   │   ├── gold_etl.js
│   │   │   ├── import_bronze.js
│   │   │   └── silver_etl.js
│   │   ├── heavy_query.sql
│   │   ├── index.js
│   │   └── usefull_reports_queries.sql
│   ├── .gitignore
│   ├── Dockerfile
│   ├── package-lock.json
│   └── package.json
├── database/
│   ├── init/
│   │   └── 01_bronze_schema.sql
│   └── original_dataset.csv
├── frontend/
│   ├── public/
│   │   └── vite.svg
│   ├── src/
│   │   ├── assets/
│   │   │   ├── images/
│   │   │   └── react.svg
│   │   ├── components/
│   │   │   ├── Charts/
│   │   │   │   ├── CancellationPieChart.tsx
│   │   │   │   ├── HourlyLineChart.tsx
│   │   │   │   ├── PaymentPieChart.tsx
│   │   │   │   └── VehicleBarChart.tsx
│   │   │   ├── Dashboard/
│   │   │   │   ├── CancellationPieChart.tsx
│   │   │   │   ├── DashboardFilters.tsx
│   │   │   │   ├── KPICards.tsx
│   │   │   │   ├── PaymentPieChart.tsx
│   │   │   │   ├── PeakHoursChart.tsx
│   │   │   │   ├── VehiclePieChart.tsx
│   │   │   │   └── WeekdayChart.tsx
│   │   │   ├── SQLAssistant/
│   │   │   │   ├── ExampleQuestions.tsx
│   │   │   │   ├── GeneratedSQL.tsx
│   │   │   │   ├── SchemaInfo.tsx
│   │   │   │   ├── SQLAssistantHeader.tsx
│   │   │   │   ├── SQLMessageBlock.tsx
│   │   │   │   ├── SQLQueryDisplay.tsx
│   │   │   │   └── TipsCard.tsx
│   │   │   ├── Table/
│   │   │   ├── Trips/
│   │   │   │   ├── trip-list-footer.tsx
│   │   │   │   ├── trip-list-header.tsx
│   │   │   │   └── trip-list.tsx
│   │   │   ├── ui/
│   │   │   │   ├── alert-dialog.tsx
│   │   │   │   ├── alert.tsx
│   │   │   │   ├── badge.tsx
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── dropdown-menu.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── label.tsx
│   │   │   │   ├── scroll-area.tsx
│   │   │   │   ├── select.tsx
│   │   │   │   ├── skeleton.tsx
│   │   │   │   ├── table.tsx
│   │   │   │   ├── tabs.tsx
│   │   │   │   └── textarea.tsx
│   │   │   ├── CreateTripForm.tsx
│   │   │   ├── KPICards.tsx
│   │   │   ├── TripFilters.tsx
│   │   │   └── TripsTable.tsx
│   │   ├── contexts/
│   │   ├── core/
│   │   │   └── http-service.ts
│   │   ├── hooks/
│   │   │   ├── index.ts
│   │   │   ├── use-analytics.ts
│   │   │   ├── use-sql-assitance.ts
│   │   │   └── use-trips.ts
│   │   ├── lib/
│   │   │   ├── analytics-types.ts
│   │   │   ├── api.ts
│   │   │   ├── query-keys.ts
│   │   │   ├── react-query.ts
│   │   │   ├── types.ts
│   │   │   └── utils.ts
│   │   ├── pages/
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── NotfoundPage.tsx
│   │   │   ├── SQLAssistantPage.tsx
│   │   │   └── TripsPage.tsx
│   │   ├── providers/
│   │   │   └── react-qurey-provider.tsx
│   │   ├── utils/
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── .dockerignore
│   ├── .gitignore
│   ├── components.json
│   ├── Dockerfile
│   ├── eslint.config.js
│   ├── index.html
│   ├── nginx.conf
│   ├── package-lock.json
│   ├── package.json
│   ├── README.md
│   ├── tsconfig.app.json
│   └── vite.config.ts
├── .dockerignore
├── .env.example
├── .gitignore
├── .hintrc
├── docker-compose.yml
├── README.md
└── User Data Platform Report.pdf
```