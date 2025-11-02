# Blog Posts Directory Structure

This directory supports **nested folder organization** for blog posts. Folders are treated as **blog groups** with automatic routing support.

## Structure

```
content/posts/
├── system-design/          # System Design articles
├── tutorials/              # Tutorial articles  
├── architecture/           # Architecture articles
├── test/                   # Test articles
└── *.md                    # Uncategorized posts (root level)
```

## How it Works

### Folder Organization
- **Subfolders** = Blog groups (e.g., `system-design`, `tutorials`)
- Files in subfolders are automatically grouped on the homepage
- You can nest folders to any depth

### Routing Examples

| File Path | URL |
|-----------|-----|
| `posts/my-post.md` | `/blog/my-post` |
| `posts/tutorials/getting-started.md` | `/blog/tutorials/getting-started` |
| `posts/system-design/caching.md` | `/blog/system-design/caching` |
| `posts/a/b/c/deep.md` | `/blog/a/b/c/deep` |

### Creating New Posts

#### Root Level Post (Uncategorized)
```bash
# Create: content/posts/my-new-post.md
# URL: /blog/my-new-post
```

#### Grouped Post
```bash
# Create: content/posts/tutorials/advanced-nextjs.md
# URL: /blog/tutorials/advanced-nextjs
```

### Features

1. **Automatic Grouping**: Posts are automatically grouped by their folder on the homepage
2. **Group Labels**: Each post displays its group/category
3. **Nested Routing**: Supports any depth of folder nesting
4. **Static Generation**: All routes are pre-generated at build time
5. **Group Navigation**: Quick links to jump to different blog groups

## Example Post Structure

```markdown
---
title: "My Awesome Post"
description: "A great description"
date: "2025-01-15"
tags: ["nextjs", "tutorial"]
---

# Content here...
```

## Tips

- Use **lowercase folder names** with hyphens for consistency
- Keep folder names **short and descriptive**
- Organize by topic, category, or any structure that makes sense
- Root-level posts appear in the "Uncategorized" section
