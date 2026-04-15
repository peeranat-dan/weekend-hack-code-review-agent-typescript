## About this repository

This repository is a single page application (SPA) built with

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Firebase](https://firebase.google.com/)
- [shadcn UI](https://ui.shadcn.com/)
- [Magic UI](https://magicui.design/)
- [React Hook Form](https://react-hook-form.com/)
- [zod](https://zod.dev/)
- [Tanstack Query](https://tanstack.com/query/latest)
- [Tanstack Table](https://tanstack.com/table/latest)
- [Tanstack Router](https://tanstack.com/router/latest)

## Architecture

This project follows a **Layered Architecture** to keep concerns separated and code maintainable.

### Layer Overview

| Layer         | Responsibility                                                           |
| ------------- | ------------------------------------------------------------------------ |
| **View**      | UI components – rendering data, user input, and interactions             |
| **Container** | Connects views with hooks and providers; handles UI logic and effects    |
| **Hook**      | Wraps React Query or side effects; bridges view with service/data layers |
| **Service**   | Business logic orchestration; handles use cases and validation           |
| **Domain**    | Pure business rules and validation logic, no side effects                |
| **Data**      | Talking to Firestore or external APIs (read/write/query)                 |
| **Shared**    | Utilities, constants, schemas used across layers                         |

### Folder Mapping

| Folder        | Layer                                         |
| ------------- | --------------------------------------------- |
| `components/` | View                                          |
| `containers/` | Container                                     |
| `hooks/`      | Hook                                          |
| `services/`   | Service                                       |
| `domain/`     | Domain                                        |
| `data/`       | Data                                          |
| `shared/`     | Shared                                        |
| `routes /`    | View                                          |
| `providers/`  | Context layer, often used in containers/pages |

### Where Should My Code Go?

Use these rules to decide where to contribute:

- ✅ Writing a UI component? → `components/`
- ✅ Calling Firestore or an API? → `data/`
- ✅ Writing business validation (e.g. "canVote")? → `domain/`
- ✅ Wrapping a mutation/query using React Query? → `hooks/`
- ✅ Creating a new flow or process (e.g. createSession)? → `services/`
- ✅ Adding common utility like date formatting? → `shared/`
- ✅ Adding a new route? → `routes/`

## Commit Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification for commit messages. Please follow the following format:

```
<type>(<scope>): <subject>
```

- `<type>`: The type of the commit. It can be one of the following:
  - `feat`: A new feature.
  - `fix`: A bug fix.
  - `docs`: Documentation only changes.
  - `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc).
  - `refactor`: A code change that neither fixes a bug nor adds a feature.
  - `perf`: A code change that improves performance.
  - `test`: Adding missing tests or correcting existing tests.
  - `chore`: Changes to the build process or auxiliary tools and libraries such as documentation generation.
  - `revert`: Reverts a previous commit.
- `<scope>`: The scope of the commit. It can be any word that describes the scope of the commit.
- `<subject>`: A brief description of the commit. It should be no longer than 50 characters.

If you are interested in the detailed specification you can visit https://www.conventionalcommits.org/.
