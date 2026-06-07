Aethera
A full-stack web application for TTRPG world-building and campaign management, built using Clean Architecture principles, .NET 8, and React.

The primary goal of this repository is to demonstrate production-grade backend architecture, strict separation of concerns, and asynchronous task processing.

Tech Stack & Architecture
The solution implements Clean Architecture combined with the CQRS pattern to decouple business logic from external frameworks and data layers.

Presentation: .NET 8 Minimal APIs. Handles HTTP requests, JWT authentication, and maps responses using structured middleware for standardized error handling.

Application: Domain use cases orchestrated via MediatR. Includes request pipeline behaviors for automatic request validation via FluentValidation.

Domain: Rich enterprise model containing entities, value objects, and core business rules. Free of external dependencies.

Infrastructure: Data persistence using EF Core and PostgreSQL. Handles complex mappings, including optimized indexing and self-referencing relationships for hierarchical lore structures.

Background Processing: Hangfire is utilized for asynchronous background jobs, offloading heavy processing tasks and recurring operations from the web server thread pool.

Frontend: A component-driven SPA built with React and TypeScript.
